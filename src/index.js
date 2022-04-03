'use strict';

const qs = require('qs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const util = require('util');

class StrapiApi {

    constructor({base_url, api_token, admin_email, admin_password, page_size, batch_size, publication_state, api_log, api_debug} = {}) {

        this.base_url = base_url || process.env.STRAPI_BASE_URL || 'http://localhost:1337';
        this.admin_email = admin_email || process.env.STRAPI_ADMIN_EMAIL;
        this.admin_password = admin_password || process.env.STRAPI_ADMIN_PASSWORD;
        this.api_token = api_token || process.env.STRAPI_API_TOKEN;

        this.page_size = page_size || process.env.STRAPI_PAGE_SIZE || 100;
        this.batch_size = batch_size || process.env.STRAPI_BATCH_SIZE || 16;
        this.publication_state = publication_state || process.env.STRAPI_PUBLICATION_STATE;
        this.api_log = api_log || process.env.STRAPI_API_LOG;
        this.api_debug = api_debug || process.env.STRAPI_API_DEBUG;

    }

    /**
     * 
     * @param {*} path api path, i.e., /api/tests
     * @param {*} id   id of the data
     * @param {*} query see see strapi doc
     * @returns the data
     */
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
        if (!query) query = {fields: ['id'], pagination: {page: 1, pageSize: 1}};
        else query = { ...query, fields: ['id'], pagination: {page: 1, pageSize: 1}};
        const {meta: {pagination: {total}}} = await this.search(path, query);
        return total;
    }

    async get_ids(path, query) {
        if (!query) query = {fields: ['id']};
        else query = { ...query, fields: ['id']};
        const result = await this.get_all(path, query);
        if (!result || result.length === 0) return [];
        return result.map(x => x.id);
    }

    async get_all(path, query) {
        if (!query) query = {pagination: {pageSize: this.page_size}};
        else query = {...query, pagination: {pageSize: this.page_size}};
        const items = [];
        let page = 1;
        while (true) {
            query.pagination.page = page;
            const result = await this.search(path, query)
            if (!result || !result.data || !result.meta) {
                throw new Error('failed to search: ' + JSON.stringify(result));
            }
            const { data, meta: { pagination: { total }}} = result;
            if (!data || data.length === 0) break;
            items.push(...data);
            if (items.length === total) break;
            page++;
        }
        return items;
    }

    async get_page(path, query, page = 1, pageSize = this.page_size) {
        if (!query) query = {pagination: {page, pageSize}};
        else query = {...query, pagination: {page, pageSize}};
        const { data } = await this.search(path, query);
        if (data && data.length === 0) return null;
        return data;
    }

    async del_all(path, query) {
        const total = await this.count(path, query);
        const pageSize = this.page_size;
        const pageCount = Math.ceil(total / 100)
        if (query) query = {...query, fields: ['id'], pagination: {page, pageSize}};
        else query = {fields: ['id'], pagination: {pageSize}};
        if (this.api_log || this.api_debug) console.log({total, pageCount, pageSize});
        let count = 0;
        let page = pageCount;
        const promises = [];
        while (true) {
            query.pagination.page = page;
            const { data } = await this.search(path, query);
            if (data.length === 0) break;
            if (this.api_log || this.api_debug) console.log('delete page', page, 'entries', data.length);
            for (const {id} of data) {
                count++;
                promises.push(this.del(path, id));
                if (promises.length === this.batch_size) {
                    await Promise.all(promises);
                    promises.length = 0;
                }
            }
            if (page > 1) page--;
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        return count;
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

    async get_files_count(query) {

        if (!query) query = {fields: ['id'], page: 1, pageSize: 1};
        else query = {...query, fields: ['id'], page: 1, pageSize: 1};
        const result = await this.search('/upload/files', query);
        if (!result || !result.pagination) {
            throw new Error('failed to search: ' + JSON.stringify(result));
        }
        return result.pagination.total;
        
    }

    async get_files_page(page = 1, pageSize = this.page_size, query) {
        if (!query) query = {page, pageSize};
        else query = {...query, page, pageSize};
        if (!query.sort) query.sort = 'updatedAt:DESC';
        return await this.search('/upload/files', query);
    }

    async get_all_files(query) {
        return await this.search('/api/upload/files', query);
    }

    async del_all_files(query) {
        if (!query) query = {fields: ['id']};
        else query = {...query, fields: ['id']};
        let count = 0;
        const promises = [];
        while(true) {
            const data = await this.get_all_files(query);
            if (this.api_log || this.api_debug) console.log('delete files count', data.length);
            if (data.length === 0) break;
            for (const {id} of data) {
                count++;
                promises.push(this.del('/api/upload/files', id));
                if (promises.length === 32) {
                    if (this.api_log || this.api_debug) console.log('delete files', promises.length, 'total', count);
                    await Promise.all(promises);
                    promises.length = 0;
                }
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        return count;
    }

    get_url(path, id, query) {
        query = query ? { ...query } : {};
        if (!query.publicationState && this.publication_state) {
            query.publicationState = this.publication_state;
        }
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