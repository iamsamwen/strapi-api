'use strict';

require('dotenv').config();

//const StrapiApi = require('@iamsamwen/strapi-api');
const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    // create an entry
    //
    let result = await strapi.post('/api/hellos', {title: 'example'});
    console.log(result);

    const id = result.data.id;

    // get the created entry
    //
    result = await strapi.get('/api/hellos', id);
    console.log(result);

    // get all entries of hellos
    //
    result = await strapi.get_all('/api/hellos');
    console.log(result);

    // update the entry
    //
    result = await strapi.put('/api/hellos', id, {title: 'update example'});
    console.log(result);

    // delete the entry
    //
    result = await strapi.del('/api/hellos', id);
    console.log(result);

})();