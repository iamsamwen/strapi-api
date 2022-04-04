'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-del-all

describe('Test search and del_all', () => {

    const strapi = new StrapiApi();

    it('test del all with api', async () => {

        for (let i = 0; i < 3; i++) {
            await strapi.post('/api/tests', {data: {title: `test del all ${i}`}});
        }

        const result = await strapi.del_all('/api/tests');
        //console.log(result);
        expect(result).greaterThanOrEqual(3);
    });

    it('test del all with admin api', async () => {

        for (let i = 0; i < 3; i++) {
            await strapi.post('/content-manager/collection-types/api::test.test', {title: `test del all ${i}`});
        }

        const result = await strapi.del_all('/content-manager/collection-types/api::test.test');
        //console.log(result);
        expect(result).greaterThanOrEqual(3);
    });
});