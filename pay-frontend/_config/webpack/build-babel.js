/**
 * @param tsx {boolean}
 * @param browsersList {string[]}
 * */
module.exports = (tsx, browsersList) => {
    const { withHOT, isTesting } = require('../mode');

    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    modules: false,
                    useBuiltIns: 'entry',
                    loose: true,
                    corejs: 3.6,
                    targets: isTesting ? { node: 'current' } : browsersList,
                },
            ],
        ],
        plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-syntax-class-properties',
            '@babel/plugin-proposal-nullish-coalescing-operator',
            '@babel/plugin-proposal-optional-chaining',

            ['@babel/plugin-transform-typescript', { isTSX: tsx }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],

            tsx ? '@babel/plugin-transform-react-jsx' : '',
            '@babel/plugin-transform-runtime',

            withHOT ? 'react-refresh/babel' : '',

            isTesting ? '@babel/plugin-transform-modules-commonjs' : '',
        ].filter(Boolean),
    };
};
