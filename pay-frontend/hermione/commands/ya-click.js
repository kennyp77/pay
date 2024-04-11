// Кликаем по появившемуся элементу
function yaClick(selector, timeout, message, hidden) {
    return this.yaWaitForVisible(selector, timeout, message, hidden).click(selector);
}

module.exports = {
    yaClick,
};
