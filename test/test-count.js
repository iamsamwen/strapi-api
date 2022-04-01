'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-count

describe('Test count and del_all', () => {

    it('test count and del_all', async () => {

        {
            const strapi = new StrapiApi();
            for (let i = 0; i < 10; i++) {
                await strapi.post('/api/hellos', {title: `my test search ${i}`});
            }
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.count('/api/hellos');
            //console.log(result);
            expect(result).greaterThanOrEqual(10);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.count('/api/hellos', {filters: {title: {'$startsWith': 'my'}}});
            //console.log(result);
            expect(result).greaterThanOrEqual(10);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del_all('/api/hellos');
            //console.log(result);
            expect(result).greaterThanOrEqual(10);
        }
    });

});