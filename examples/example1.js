'use strict';

require('dotenv').config();

//const StrapiApi = require('@iamsamwen/strapi-api');
const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    // create an entry
    //
    let result = await strapi.post('/api/tests', {data: {title: 'example'}});
    console.log(result);

    const id = result.data.id;

    // get the created entry
    //
    result = await strapi.get('/api/tests', id);
    console.log(result);

    // get all entries of tests
    //
    result = await strapi.get_all('/api/tests');
    console.log(result);

    // update the entry
    //
    result = await strapi.put('/api/tests', id, {data: {title: 'update example'}});
    console.log(result);

    // delete the entry
    //
    result = await strapi.del('/api/tests', id);
    console.log(result);

})();