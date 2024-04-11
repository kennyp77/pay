const bemPageObject = require('@yandex-int/bem-page-object');

const Entity = bemPageObject.Entity;
const PageObjects = {};

// кнопка Pay на демо
PageObjects.pay_button = new Entity('[aria-label="Yandex Pay"]');
// слово "token" на демо после успешной оплаты
PageObjects.log_content = new Entity("//div[contains(text(), 'token')]");

module.exports = bemPageObject.create(PageObjects);
