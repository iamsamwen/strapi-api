'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-search

describe('Test search and del_all', () => {

    const strapi = new StrapiApi();

    before(async () => {
        for (let i = 0; i < 20; i++) {
            await strapi.post('/api/tests', {data: {title: `test search ${i}`}});
        }
    })

    it('test search api without query', async () => {
        const result = await strapi.search('/api/tests');
        //console.log(result);
        expect(result).haveOwnProperty('data');
        assert.isArray(result.data);
        expect(result.data.length).greaterThanOrEqual(10);
        expect(result).haveOwnProperty('meta');
    });

    it('test search admin api without query', async () => {
        const result = await strapi.search('/content-manager/collection-types/api::test.test');
        //console.log(result);
        expect(result).haveOwnProperty('results');
        assert.isArray(result.results);
        expect(result.results.length).greaterThanOrEqual(10);
        expect(result).haveOwnProperty('pagination');
    });

    it('test search api with query', async () => {
        const result = await strapi.search('/api/tests', {filters: {title: {'$contains': '2'}}});
        //console.log(result);
        expect(result).haveOwnProperty('data');
        assert.isArray(result.data);
        expect(result.data.length).greaterThanOrEqual(2);
        expect(result).haveOwnProperty('meta');
    });

    it('test search admin api query', async () => {
        const result = await strapi.search('/content-manager/collection-types/api::test.test', {filters: {title: {'$contains': '2'}}});
        //console.log(result);
        expect(result).haveOwnProperty('results');
        assert.isArray(result.results);
        expect(result.results.length).greaterThanOrEqual(2);
        expect(result).haveOwnProperty('pagination');
    });

    after(async () => {
        const result = await strapi.del_all('/api/tests');
        expect(result).greaterThanOrEqual(20);
    })

});