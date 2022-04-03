'use strict';

require('dotenv').config();

//const StrapiApi = require('@iamsamwen/strapi-api');
const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    const result = await strapi.get('/content-manager/content-types');
    
    console.log(result);

})();