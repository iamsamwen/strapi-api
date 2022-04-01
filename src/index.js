'use strict';

const qs = require('qs');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

class StrapiApi {

    constructor(default_publication_state, base_url, jwt_token) {
        this.base_url = base_url || process.env.STRAPI_BASE_URL;
        this.jwt_token = jwt_token || process.env.STRAPI_JWT_TOKEN;
        if (default_publication_state) this.default_publication_state = default_publication_state;
    }

    async get(api_path, id, query) {
        const query_string = this.get_query_string(query);
        const url = id ? `${this.base_url}${api_path}/${id}${query_string}` : `${this.base_url}${api_path}/${query_string}`;
        return await this.send_http_request({url, method: 'get'});
    }

    async post(api_path, data) {
        const url = `${this.base_url}${api_path}`;
        return await this.send_http_request({url, method: 'post', data: {data}});
    }

    async put(api_path, id, data) {
        const url = `${this.base_url}${api_path}/${id}`;
        return await this.send_http_request({url, method: 'put', data: {data}});
    }

    async del(api_path, id) {
        const url = `${this.base_url}${api_path}/${id}`;
        return await this.send_http_request({url, method: 'delete'});
    }
    
    async search(api_path, query) {
        const query_string = this.get_query_string(query);
        const url = `${this.base_url}${api_path}${query_string}`;
        return await this.send_http_request({url, method: 'get'});
    }

    async count(api_path, query) {
        if (!query) query = {fields: ['id'], pagination: {page: 1, pageSize: 1}};
        else query = { ...query, fields: ['id'], pagination: {page: 1, pageSize: 1}};
        const {meta: {pagination: {total}}} = await this.search(api_path, query);
        return total;
    }

    async get_ids(api_path, query) {
        if (!query) query = {fields: ['id']};
        else query = { ...query, fields: ['id']};
        const result = await this.get_all(api_path, query);
        if (!result || result.length === 0) return [];
        return result.map(x => x.id);
    }

    async get_all(api_path, query) {
        if (!query) query = {pagination: {pageSize: 100}};
        else query = {...query, pagination: {pageSize: 100}};
        const items = [];
        let page = 1;
        while (true) {
            query.pagination.page = page;
            const result = await this.search(api_path, query)
            if (!result || !result.data || !result.meta) {
                throw new Error('unexpected search result: ' + JSON.stringify(result));
            }
            const { data, meta: { pagination: { total }}} = result;
            if (!data || data.length === 0) break;
            items.push(...data);
            if (items.length === total) break;
            page++;
        }
        return items;
    }

    async get_page(api_path, query, page = 1, pageSize = 100) {
        if (!query) query = {pagination: {page, pageSize}};
        else query = {...query, pagination: {page, pageSize}};
        const { data } = await this.search(api_path, query);
        if (data && data.length === 0) return null;
        return data;
    }

    async del_all(api_path, query, log = false) {
        const total = await this.count(api_path, query);
        const pageSize = 100;
        const pageCount = Math.ceil(total / 100)
        if (query) query = {...query, fields: ['id'], pagination: {page, pageSize}};
        else query = {fields: ['id'], pagination: {pageSize}};
        if (log) console.log({total, pageCount, pageSize});
        let count = 0;
        let page = pageCount;
        while (true) {
            query.pagination.page = page;
            const { data } = await this.search(api_path, query);
            if (data.length === 0) break;
            if (log) console.log('delete page', page, 'entries', data.length);
            for (const {id} of data) {
                count++;
                await this.del(api_path, id);
            }
            if (page > 1) page--;
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
        const api_path = '/api/upload';
        const url = `${this.base_url}${api_path}`;
        return await this.send_http_request({url, method: 'post', data: form, headers: form.getHeaders()});
    }

    async get_all_files(query) {
        return await this.search('/api/upload/files', query);
    }

    async del_all_files(log = false) {
        let count = 0;
        const api_path = '/api/upload/files';
        const promises = [];
        while(true) {
            const data = await this.get_all_files({fields: ['id']});
            if (log) console.log('delete files count', data.length);
            if (data.length === 0) break;
            for (const {id} of data) {
                count++;
                promises.push(this.del('/api/upload/files', id));
                if (promises.length === 32) {
                    console.log('delete files', promises.length, 'total', count);
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

    get_query_string(query) {
        query = query || {};
        if (!query.publicationState && this.default_publication_state) {
            query.publicationState = this.default_publication_state;
        }
        const str = qs.stringify(query, { encodeValuesOnly: true });
        if (str) return '?' + str;
        else return '';
    }

    get headers() {
        return {
            authorization: `Bearer ${this.jwt_token}`,
            accept: 'application/json',
            'content-type': 'application/json'
        };
    }
    
    async send_http_request(config) {
        try {
            const headers = {...this.headers};
            if (config.headers) Object.assign(headers, config.headers);
            //console.log({...config, headers})
            const { data } = await axios({...config, headers});
            return data;
        } catch (err) {
            if (err.response && err.response.data) {
                return err.response.data;
            } else {
                throw new Error(err.message);
            }
        }
    }
}

module.exports = StrapiApi;