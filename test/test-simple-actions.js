'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;

// NODE_ENV=test mocha --reporter spec test/test-simple-actions

describe('Test simple actions', () => {

    it('test post, get, put and del', async () => {

        let id, title = 'test123';

        {
            const strapi = new StrapiApi();
            const result = await strapi.post('/api/hellos', {title});
            //console.log(result);
            expect(result).haveOwnProperty('data');
            expect(result.data).haveOwnProperty('id');
            id = result.data.id;
            expect(result.data).haveOwnProperty('attributes');
            expect(result.data.attributes).haveOwnProperty('title');
            expect(result.data.attributes.title).equals(title);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get('/api/hellos', id);
            //console.log(result);
            expect(result).haveOwnProperty('data');
            expect(result).haveOwnProperty('meta');
            expect(result.data.id).equals(id);
            expect(result.data).haveOwnProperty('attributes');
            expect(result.data.attributes).haveOwnProperty('title');
            expect(result.data.attributes.title).equals(title);
        }

        {
            let new_title = 'new test123';

            const strapi = new StrapiApi();
            const result = await strapi.put('/api/hellos', id, {title: new_title});
            //console.log(result);
            expect(result).haveOwnProperty('data');
            expect(result.data).haveOwnProperty('id');
            expect(result.data).haveOwnProperty('attributes');
            expect(result.data.attributes).haveOwnProperty('title');
            expect(result.data.attributes.title).equals(new_title);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del('/api/hellos', id);
            //console.log(result);
            expect(result).haveOwnProperty('data');
            expect(result.data).haveOwnProperty('id');
            expect(result.data).haveOwnProperty('attributes');
        }
    });

});