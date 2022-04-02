'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-files-page

describe('Test get_files_page and get_files_count', () => {

    it('Test upload file, get_all_files and del_all_files', async () => {

        {
            const strapi = new StrapiApi();
            const result = await strapi.upload_file(__dirname + '/image.png', {name: 'test name', caption: 'test caption', alternativeText: 'test alt text'});
            //console.log(result);
            assert.isArray(result);
            expect(result.length).greaterThanOrEqual(1);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get_files_count();
            //console.log(result);
            expect(result).greaterThanOrEqual(1);
        }


        {
            const strapi = new StrapiApi();
            const result = await strapi.get_files_page(1, 10);
            //console.log(result);
            expect(result).haveOwnProperty('results');
            assert.isArray(result.results);
            expect(result.results.length).greaterThanOrEqual(1);
            expect(result).haveOwnProperty('pagination');
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del_all_files();
            //console.log(result);
            expect(result).greaterThanOrEqual(1);
        }
    });

});