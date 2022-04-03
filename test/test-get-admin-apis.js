'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-get-get-admin-apis

describe('Test get admin apis', () => {

    it('test get content types', async () => {

        const strapi = new StrapiApi();
        const result = await strapi.get('/content-manager/content-types');
        //console.log(JSON.stringify(result, null, 2));
        expect(result).haveOwnProperty('data');
        assert.isArray(result.data);
        expect(result.data.length).greaterThanOrEqual(9);
    });

    it('test get content types settings', async () => {

        const strapi = new StrapiApi();
        const result = await strapi.get('/content-manager/content-types-settings');
        //console.log(JSON.stringify(result, null, 2));
        expect(result).haveOwnProperty('data');
        assert.isArray(result.data);
        expect(result.data.length).greaterThanOrEqual(9);
    });

    it('test get content type test configuration', async () => {

        const strapi = new StrapiApi();
        const result = await strapi.get('/content-manager/content-types/api::test.test/configuration');
        //console.log(JSON.stringify(result, null, 2));
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('contentType');
    });
});