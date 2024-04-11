const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

function pluginReactHot() {
    return new ReactRefreshWebpackPlugin();
}

module.exports = pluginReactHot;
