const buildBabel = require('@yandex-pay/config/webpack/build-babel');
const {default: transformer} = require('babel-jest');

module.exports = transformer.createTransformer({
    babelrc: false,
    sourceMaps: 'inline',
    ...buildBabel(true, []),
});
