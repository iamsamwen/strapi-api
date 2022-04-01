'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-get-all

describe('Test get_all, get_ids, get_page and del_all', () => {

    it('Test get_all, get_ids, get_page and del_all', async () => {

        {
            const strapi = new StrapiApi();
            const promises = [];
            for (let i = 0; i < 20; i++) {
                promises.push(strapi.post('/api/hellos', {title: `test search ${i}`}));
            }
            await Promise.all(promises);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get_all('/api/hellos');
            //console.log(result);
            expect(result.length).greaterThanOrEqual(20);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get_ids('/api/hellos');
            //console.log(result);
            expect(result.length).greaterThanOrEqual(20);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get_page('/api/hellos', null, 2, 10);
            //console.log(result);
            expect(result.length).equals(10);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del_all('/api/hellos');
            //console.log(result);
            expect(result).greaterThanOrEqual(20);
        }
    });

});