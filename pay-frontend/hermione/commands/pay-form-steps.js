const form = require('../page-objects/pay-form');

const payWindowTitle = 'Условия использования сервиса «Yandex Pay» - Правовые документы. Помощь';

async function yaSwitchOnAgreement() {
    await this.yaSwitchWindow(payWindowTitle);
}

async function yaOpenCardList() {
    await this.yaClick(form.pay_order_form.link_choose_other_card());
}

async function yaClickOnFormPayButton() {
    await this.yaClick(form.pay_order_form.pay_button_red());
}

async function yaClickOnAgreementLink() {
    await this.yaClick(form.pay_order_footer.agreement_link());
}

async function yaClosePay() {
    await this.close();
}

module.exports = {
    yaOpenCardList,
    yaClickOnFormPayButton,
    yaClickOnAgreementLink,
    yaSwitchOnAgreement,
    yaClosePay,
};
