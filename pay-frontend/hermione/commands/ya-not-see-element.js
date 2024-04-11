const { assert } = require('chai');

//проверяет что элемента нет на странице

async function yaElementIsNotDisplayed(PO) {
    const timeout = this.options.waitforTimeout;

    return this.waitUntil(
        async () => true !== (await this.$(PO).isVisible()),
        timeout,
        `Element ${PO} is expected to be not visible on the page`,
    );
}

module.exports = {
    yaElementIsNotDisplayed,
};
