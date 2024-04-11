const bemPageObject = require('@yandex-int/bem-page-object');

const Entity = bemPageObject.Entity;
const PageObjects = {};

//Активное окно оплат
PageObjects.pay_order_form = new Entity('.order_active');
PageObjects.pay_order_form.card_info_issuer = new Entity('.card-info__issuer');
PageObjects.pay_order_form.card_info_number_mask = new Entity('.card-info__number-mask');
PageObjects.pay_order_form.card_info_number = new Entity('.card-info__number');
PageObjects.pay_order_form.link_choose_other_card = new Entity('.order-selected-payment-method .link_theme_grey');
PageObjects.pay_order_form.pay_button_red = new Entity('.big-button_type_red');

//Футер
PageObjects.pay_order_footer = new Entity('.payment__footer');
PageObjects.pay_order_footer.agreement_link = new Entity('.additional-information__agreement-link');

module.exports = bemPageObject.create(PageObjects);
