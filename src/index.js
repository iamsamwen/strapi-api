'use strict';

const qs = require('qs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const util = require('util');

class StrapiApi {

    constructor({base_url, api_token, admin_email, admin_password, page_size, batch_size, api_log, api_debug} = {}) {

        this.base_url = base_url || process.env.STRAPI_BASE_URL || 'http://localhost:1337';
        this.admin_email = admin_email || process.env.STRAPI_ADMIN_EMAIL;
        this.admin_password = admin_password || process.env.STRAPI_ADMIN_PASSWORD;
        this.api_token = api_token || process.env.STRAPI_API_TOKEN;

        this.page_size = page_size || process.env.STRAPI_PAGE_SIZE || 100;
        this.batch_size = batch_size || process.env.STRAPI_BATCH_SIZE || 16;

        this.api_log = api_log || process.env.STRAPI_API_LOG;
        this.api_debug = api_debug || process.env.STRAPI_API_DEBUG;

    }

    async get(path, id, query) {
        const url = this.get_url(path, id, query);
        return await this.send_http_request({url, method: 'get'});
    }

    async post(path, data) {
        const url = this.get_url(path);
        return await this.send_http_request({url, method: 'post', data});
    }

    async put(path, id, data) {
        const url = this.get_url(path, id);
        return await this.send_http_request({url, method: 'put', data});
    }

    async del(path, id) {
        const url = this.get_url(path, id);
        return await this.send_http_request({url, method: 'delete'});
    }
    
    async search(path, query) {
        const url = this.get_url(path, undefined, query);
        return await this.send_http_request({url, method: 'get'});
    }

    async count(path, query) {
        if (!query) query = {fields: ['id'], };
        else query = { ...query, fields: ['id']};
        const pagination = {page: 1, pageSize: 1};
        const is_api_call = path.startsWith('/api/');
        if (is_api_call) query.pagination = pagination;
        else Object.assign(query, pagination);
        const result = await this.search(path, query);;
        if (is_api_call) {
            return result.meta.pagination.total;
        } else {
            return result.pagination.total;
        }
    }

    async get_ids(path, query) {
        if (!query) query = {fields: ['id']};
        else query = { ...query, fields: ['id']};
        const result = await this.get_all(path, query);
        if (!result || result.length === 0) return [];
        return result.map(x => x.id);
    }

    async get_all(path, query) {
        if (!query) query = {};
        else query = {...query};
        const pagination = {pageSize: this.page_size};
        const is_api_call = path.startsWith('/api/');
        if (is_api_call) {
            query.pagination = pagination;
        } else {
            Object.assign(query, pagination);
        }
        const items = [];
        let page = 1;
        while (true) {
            if (is_api_call) query.pagination.page = page;
            else query.page = page;
            const result = await this.search(path, query);
            if (is_api_call) {
                if (!result || !result.data || !result.meta) {
                    throw new Error('failed to search: ' + JSON.stringify(result));
                }
                const { data, meta: { pagination: { total }}} = result;
                if (!data || data.length === 0) break;
                items.push(...data);
                if (items.length === total) break;
            } else {
                if (!result || !result.results || !result.pagination) {
                    throw new Error('failed to search: ' + JSON.stringify(result));
                }
                const { results, pagination: { total }} = result;
                if (!results || results.length === 0) break;
                items.push(...results);
                if (items.length === total) break;
            }
            page++;
        }
        return items;
    }

    async get_page(path, query, page = 1, pageSize = this.page_size) {
        if (!query) query = {};
        else query = {...query};
        const pagination = {page, pageSize};
        if (path.startsWith('/api/')) query.pagination = pagination;
        else Object.assign(query, pagination);
        return await this.search(path, query);
    }

    async del_all(path, query) {
        const ids = await this.get_ids(path, query);
        const promises = [];
        for (const id of ids) {
            promises.push(this.del(path, id));
            if (promises.length === this.batch_size) {
                await Promise.all(promises);
                promises.length = 0;
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        return ids.length;
    }

    async upload_file(filepath, {ref, id, field, path, name, caption, alternativeText} = {}) {
        if (!fs.existsSync(filepath)) {
            throw new Error(`${filepath} not found`);
        }
        const stream = fs.createReadStream(filepath);
        const form = new FormData();
        form.append('files', stream);
        if (name || caption || alternativeText) {
            form.append('fileInfo', JSON.stringify({ name, caption, alternativeText}));
        }
        if (ref && id && field) {
            form.append('ref', ref);
            form.append('refId', id);
            form.append('field', field);
        }
        if (path) form.append('path', path);

        const url = `${this.base_url}/api/upload`;
        return await this.send_http_request({url, method: 'post', data: form, headers: form.getHeaders()});
    }

    get_url(path, id, query) {
        query = query ? { ...query } : {};
        let str = qs.stringify(query, { encodeValuesOnly: true });
        if (str) str = '?' + str;
        if (id) return `${this.base_url}${path}/${id}${str}`;
        else return `${this.base_url}${path}${str}`;
    }

    async login(email = this.admin_email, password = this.admin_password) {
        const url = `${this.base_url}/admin/login`;
        const data = {email, password};
        const config = {method: 'post', url, data};
        const result = await this.send_http_request(config, false);
        if (!result || !result.data) {
            throw new Error('failed to login admin');
        }
        const {data: {token, user}} = result;
        this.admin_token = token;
        if (this.admin_email) delete this.admin_email;
        if (this.admin_password) delete this.admin_password;
        return user;
    }

    async get_headers(url) {
        const headers = {
            accept: 'application/json',
            'content-type': 'application/json'
        };
        if (url.startsWith(`${this.base_url}/api/`)) {
            headers.authorization = `Bearer ${this.api_token}`;
            if (this.api_debug) console.log('use api_token');
        } else if (!url.endsWith('/admin/login')) {
            if (!this.admin_token) {
                if (this.admin_email && this.admin_password) {
                    await this.login();
                } else {
                    throw new Error('missing admin_email and admin_password');
                }
            }
            headers.authorization = `Bearer ${this.admin_token}`;
            if (this.api_debug) console.log('use admin_token');
        }
        return headers;
    }
    
    async send_http_request(config) {
        try {
            const headers = await this.get_headers(config.url);
            if (config.headers) Object.assign(headers, config.headers);
            config = {...config, headers};
            if (this.api_debug) console.log(util.inspect(config, false, null, true));
            const { data } = await axios(config);
            if (this.api_debug) console.log(util.inspect(data, false, null, true));
            return data;
        } catch (err) {
            if (err.response && err.response.data) {
                if (this.api_debug) console.log(util.inspect(err.response.data, false, null, true));
                return err.response.data;
            } else {
                if (this.api_debug) console.error(err);
                throw new Error(err.message);
            }
        }
    }
}

module.exports = StrapiApi;