/**
 * Ожидает отображенгия элемента
 * Обертка над Гермионой позволяющая выводить свое сообщение
 * @returns {Promise<void>}
 */
function yaWaitForVisible(selector, timeout, message, hidden) {
    if (typeof timeout !== 'number') {
        timeout = this.options.waitforTimeout;
    }

    return this.waitForVisible(selector, timeout, hidden).catch((err) => {
        if (message && err.type === 'WaitUntilTimeoutError') {
            throw new Error(message);
        }

        throw err;
    });
}

module.exports = {
    yaWaitForVisible,
};
