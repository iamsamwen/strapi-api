'use strict';
require('dotenv').config();

//const StrapiApi = require('@iamsamwen/strapi-api');
const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    const result = await strapi.upload_file(__dirname + '/image.png', {name: 'test name', caption: 'test caption', alternativeText: 'test alt text'});

    console.log(result);

})()