const { stringify, generateExport } = require('svg-sprite-loader/lib/utils');

function runtimeGenerator(params) {
    const { symbol, config } = params;
    const { esModule } = config;
    const meta = stringify({
        id: symbol.id,
        viewBox: symbol.viewBox,
    });

    return generateExport(meta, esModule);
}

module.exports = runtimeGenerator;
