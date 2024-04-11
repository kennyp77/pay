const bemPageObject = require('@yandex-int/bem-page-object');

const Entity = bemPageObject.Entity;
const PageObjects = {};

// список карт
PageObjects.cards_list = new Entity('[class="bank-cards__list"]');

module.exports = bemPageObject.create(PageObjects);
