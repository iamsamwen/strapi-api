'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-admin-get-all

describe('Test admin get_all, get_ids, get_page and del_all', () => {

    const strapi = new StrapiApi();

    before(async () => {
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(strapi.post('/content-manager/collection-types/api::test.test', {title: `test admin api ${i}`}));
        }
        await Promise.all(promises);
    })

    it('Test admin get_all', async () => {
        const result = await strapi.get_all('/content-manager/collection-types/api::test.test');
        //console.log(result);
        expect(result.length).greaterThanOrEqual(20);
    })

    it('Test admin get_ids', async () => {
        const result = await strapi.get_ids('/content-manager/collection-types/api::test.test');
        //console.log(result);
        expect(result.length).greaterThanOrEqual(20);
    })

    it('Test admin get_page', async () => {
        const strapi = new StrapiApi();
        const result = await strapi.get_page('/content-manager/collection-types/api::test.test', null, 2, 10);
        //console.log(result);
        expect(result.results.length).equals(10);
    })

    after(async () => {
        const result = await strapi.del_all('/content-manager/collection-types/api::test.test');
        expect(result).greaterThanOrEqual(20);
    })
});