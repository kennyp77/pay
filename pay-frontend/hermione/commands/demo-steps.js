const demo = require('../page-objects/demo');
const nda_page = require('../page-objects/nda-page');
const PayForm = require('../page-objects/pay-form');

/**
 * Открытие demo
 */

async function yaOpenNdaPage(url) {
    await this.url(url);
    await this.yaWaitForVisible(nda_page.cards_list());
}

async function yaOpenDemo(url) {
    await this.url(url);
    await this.yaWaitForVisible(demo.pay_button());
}

async function yaClickOnPayButton() {
    await this.yaClick(demo.pay_button());
    await this.pause(500); //для отработки анимации
}

async function yaShouldNotSeePayButton() {
    await this.yaElementIsNotDisplayed(demo.pay_button());
}

async function yaShouldSeePayButton() {
    await this.yaWaitForVisible(demo.pay_button());
}

async function yaShouldSeeTokenLog() {
    await this.yaWaitForVisible(demo.log_content());
}

async function yaShouldSeePayOrderForm() {
    await this.yaWaitForVisible(PayForm.pay_order_form());
}

module.exports = {
    yaOpenDemo,
    yaOpenNdaPage,
    yaClickOnPayButton,
    yaShouldNotSeePayButton,
    yaShouldSeePayButton,
    yaShouldSeeTokenLog,
    yaShouldSeePayOrderForm,
};
