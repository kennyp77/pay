const bemPageObject = require('@yandex-int/bem-page-object');

const Entity = bemPageObject.Entity;
const PageObjects = {};

PageObjects.card_list = new Entity('.payment-methods_active');
PageObjects.card_list.selected_card_icon = new Entity('.payment-method-details__selected-icon');
PageObjects.card_list.back = new Entity('.link_theme_grey');
PageObjects.card_list.selected_card_container = new Entity('.payment-method-details_selected');
PageObjects.selected_card_number = PageObjects.card_list.selected_card_container.descendant(
    new Entity('.card-info__number'),
);

module.exports = bemPageObject.create(PageObjects);
