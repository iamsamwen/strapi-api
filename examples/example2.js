'use strict';

require('dotenv').config();

const StrapiApi = require('@iamsamwen/strapi-api');
//const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    const result = await strapi.upload_file(__dirname + '/image.png', {path: 't-shirts', name: 'color blue', caption: 't-shirts', alternativeText: 'color blue'});

    console.log(result);

})()