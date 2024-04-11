const mode = require('@yandex-pay/config/mode');
const { DefinePlugin } = require('webpack');

function prepareVariables(variables, prefix = 'process.env.') {
    return Object.keys(variables).reduce((acc, key) => {
        acc[`${prefix}${key}`] = JSON.stringify(variables[key]);

        return acc;
    }, {});
}

function pluginDefine(globalVars = {}, envVars = {}) {
    const variables = {
        ...prepareVariables(globalVars, ''),
        ...prepareVariables({ ...envVars, NODE_ENV: mode.name }),
    };

    variables.__DEV__ = mode.isDevelopment;
    variables.__TEST__ = mode.isTesting;

    // eslint-disable-next-line no-console
    console.log(`Define variables: ${JSON.stringify(variables, null, 2)}`);

    return new DefinePlugin(variables);
}

module.exports = pluginDefine;
