'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec test/test-post

describe('Test simple actions', () => {

    it('test post', async () => {

        const strapi = new StrapiApi();
        const result = await strapi.post('/api/tests', {data: {title: 'post test'}});
        //console.log(result);
        expect(result).haveOwnProperty('data');
        expect(result.data).haveOwnProperty('id');
        expect(result.data).haveOwnProperty('attributes');
        expect(result.data.attributes).haveOwnProperty('title');
    });

});