const bemPageObject = require('@yandex-int/bem-page-object');

const Entity = bemPageObject.Entity;
const PageObjects = {};

PageObjects.agreement_first_title = new Entity('.doc-c-headers_mod_h2');

module.exports = bemPageObject.create(PageObjects);
