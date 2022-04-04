'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec test/test-post

describe('Test simple actions', () => {

    const strapi = new StrapiApi();

    it('test post with api', async () => {
        const result = await strapi.post('/api/tests', {data: {title: 'post test 1'}});
        //console.log(result);
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('id');
        expect(result.data).haveOwnProperty('attributes');
        expect(result.data.attributes).haveOwnProperty('title');
    });

    it('test post with admin api', async () => {
        const result = await strapi.post('/content-manager/collection-types/api::test.test', {title: 'post test 2'});
        //console.log(result);
        expect(result).haveOwnProperty('id');
        expect(result).haveOwnProperty('title');
    });
});