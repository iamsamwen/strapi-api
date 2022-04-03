'use strict';

require('dotenv').config();

//const StrapiApi = require('@iamsamwen/strapi-api');
const StrapiApi = require('../src');

(async () => {

    const strapi = new StrapiApi();

    const data = {
        contentType: {
            draftAndPublish: true,
            singularName: 'test',
            pluralName: 'tests',
            displayName: 'test',
            kind: 'collectionType',
            attributes: { title: { type: 'string' } }
        }
    };
    const result = await strapi.post('/content-type-builder/content-types', data);
    
    console.log(result);

})();