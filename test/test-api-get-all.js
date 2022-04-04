'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-api-get-all

describe('Test api get_all, get_ids, get_page and del_all', () => {

    const strapi = new StrapiApi();

    before(async () => {
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(strapi.post('/api/tests', {data: {title: `test api ${i}`}}));
        }
        await Promise.all(promises);
    })

    it('Test api get_all', async () => {
        const result = await strapi.get_all('/api/tests');
        //console.log(result);
        expect(result.length).greaterThanOrEqual(20);
    })

    it('Test api get_ids', async () => {
        const result = await strapi.get_ids('/api/tests');
        //console.log(result);
        expect(result.length).greaterThanOrEqual(20);
    })

    it('Test api get_page', async () => {
        const strapi = new StrapiApi();
        const result = await strapi.get_page('/api/tests', null, 2, 10);
        //console.log(result);
        expect(result.data.length).equals(10);
    })

    after(async () => {
        const result = await strapi.del_all('/api/tests');
        expect(result).greaterThanOrEqual(20);
    })
});