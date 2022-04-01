'use strict';

require('dotenv').config();

const chai = require('chai');
const StrapiApi = require('../src');

const expect = chai.expect;
const assert = chai.assert;

// NODE_ENV=test mocha --reporter spec test/test-upload-file

describe('Test upload file, get_all_files and del_all_files', () => {

    it('Test upload file, get_all_files and del_all_files', async () => {

        {
            const strapi = new StrapiApi();
            const result = await strapi.upload_file(__dirname + '/image.png', {name: 'test name', caption: 'test caption', alternativeText: 'test alt text'});
            //console.log(result);
            assert.isArray(result);
            expect(result.length).greaterThanOrEqual(1);
            expect(result[0].name).equals('test name');
            expect(result[0].caption).equals('test caption');
            expect(result[0].alternativeText).equals('test alt text');
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.get_all_files();
            //console.log(result);
            assert.isArray(result);
            expect(result.length).greaterThanOrEqual(1);
        }

        {
            const strapi = new StrapiApi();
            const result = await strapi.del_all_files();
            //console.log(result);
            expect(result).greaterThanOrEqual(1);
        }
    });

});