async function yaAssertView(state, selectors = 'html', opts = {}) {
    return this.assertView(state, selectors, opts);
}

module.exports = {
    yaAssertView,
};
