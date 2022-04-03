# strapi-api for strap v4

A wrapper of strapi api calls util class to simplify the code to manipulate strapi data and media files. 

## Install
```bash
     npm install @iamsamwen/strapi-api
```
OR
```bash
     yarn add @iamsamwen/strapi-api
```

## Setup 

create ***.env*** file in your project root directory with following name and values:

```bash
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=xxx
STRAPI_ADMIN_EMAIL=xxx
STRAPI_ADMIN_PASSWORD=xxx
```

With STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD setup, strapi-api can call APIs used by strapi admin frontend.

## Examples

if the ***.env*** file is setup correctly, strapi-api can create content type tests:

### created content type tests with field name title

```js
'use strict';

require('dotenv').config();

const StrapiApi = require('@iamsamwen/strapi-api');

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
```

The rest of examples are assuming that you have setup .env file and created a content type tests with field name title.

### example 1 - simple operations

```js
'use strict';

require('dotenv').config();

const StrapiApi = require('@iamsamwen/strapi-api');

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

```

### example 2 - upload a media file

```js
'use strict';

require('dotenv').config();

const StrapiApi = require('@iamsamwen/strapi-api');

(async () => {

    const strapi = new StrapiApi();

    const result = await strapi.upload_file(__dirname + '/image.png', {path: 't-shirts', name: 'color blue', caption: 't-shirts', alternativeText: 'color blue'});

    console.log(result);

})()

```


### example 3 - get all content types (an api used by admin frontend)

```js
'use strict';

require('dotenv').config();

const StrapiApi = require('@iamsamwen/strapi-api');

(async () => {

    const strapi = new StrapiApi();

    const result = await strapi.get('/content-manager/content-types');

    console.log(result);

})();

```

## list of methods

all methods are async. For how to use query, please read <a href="https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#filtering">strapi doc</a> for REST API: Filtering, Locale, and Publication State.


| name           | arguments   | comments |
| -------------- | ------------------------------------------------------------ |------------------------------------------------------------|
| constructor| {base_url, api_token, admin_email, admin_password, page_size, batch_size, api_log, api_debug} | set with environment variable, prefix with STRAPI_ and capitalized name. for example: base_url => STRAPI_BASE_URL |
|get|path, id, query| path is an api path, i.e., /api/tests|
|post|path, data|{data: {title: 'hello'}}|
|put|path, id, data|id is the strapi data id|
|del|path, id||
|search|path, query|query: {title: {$contains: 'llo'}}|
|count|path, query||
|get_ids|path, query||
|get_all|path, query||
|get_page|path, query, page, page_size||
|del_all|path, query||
|upload_file|filepath, {ref, id, field, path, name, caption, alternativeText}|
|get_files_count|query||
|get_files_page|page, page_size, query||
|get_all_files|query||
|del_all_files|query||
