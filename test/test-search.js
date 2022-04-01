'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-search

describe('Test search and del_all', () => {

    it('test search and del_all', async () => {

        {
            const strapi = new StrapiApi();
            for (let i = 0; i < 10; i++) {
                await strapi.post('/api/hellos', {title: `test search ${i}`});
            }
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.search('/api/hellos');
            //console.log(result);
            expect(result).haveOwnProperty('data');
            assert.isArray(result.data);
            expect(result.data.length).greaterThanOrEqual(10);
            expect(result).haveOwnProperty('meta');
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.search('/api/hellos', {filters: {title: {'$startsWith': 'test'}}});
            //console.log(result);
            expect(result).haveOwnProperty('data');
            assert.isArray(result.data);
            expect(result.data.length).greaterThanOrEqual(10);
            expect(result).haveOwnProperty('meta');
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del_all('/api/hellos');
            //console.log(result);
            expect(result).greaterThanOrEqual(10);
        }
    });

});