'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-get

describe('Test get', () => {

    const strapi = new StrapiApi();
    let id;

    before(async () => {
        const result = await strapi.post('/api/tests', {data: {title: `test get`}});
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('id');
        id = result.data.id;

    })

    it('Test get api with id', async () => {

        const result = await strapi.get('/api/tests', id);
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('id');
        expect(result.data.id).equals(id);

    });

    it('Test get admin api with id', async () => {

        const result = await strapi.get('/content-manager/collection-types/api::test.test', id);
        expect(result).haveOwnProperty('id');
        expect(result.id).equals(id);

    });

    it('Test get api without id', async () => {

        const result = await strapi.get('/api/tests');
        expect(result).haveOwnProperty('data');
        //console.log(result);
        assert.isArray(result.data);
        expect(result.data.length).greaterThanOrEqual(1);
        expect(result).haveOwnProperty('meta');

    });

    it('Test get admin api without id', async () => {

        const result = await strapi.get('/content-manager/collection-types/api::test.test');
        //console.log(result);
        expect(result).haveOwnProperty('results');
        assert.isArray(result.results);
        expect(result.results.length).greaterThanOrEqual(1);
        expect(result).haveOwnProperty('pagination');
    });

    it('Test get api', async () => {

        const result = await strapi.get('/api/tests', id);
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('id');
        expect(result.data.id).equals(id);

    });

    after(async () => {
        await strapi.del('/api/tests', id);
    })
});