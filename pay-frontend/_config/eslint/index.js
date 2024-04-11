module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: { jsx: true },
        useJSXTextNode: true,
    },
    plugins: ['ascii', 'react', 'import', '@typescript-eslint'],
    extends: ['plugin:import/recommended', 'plugin:import/typescript'],
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    globals: {},
    settings: {
        react: {
            pragma: 'React',
            version: '17.0',
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
                moduleDirectory: ['node_modules', 'src'],
            },
        },
    },
    overrides: [
        {
            files: ['**/*.i18n.ts'],
            rules: {
                'ascii/valid-name': 'off',
            },
        },
        {
            files: ['**/*.json'],
            rules: {
                quotes: [2, 'double', { avoidEscape: true }],
                'quote-props': [2, 'always', { numbers: true }],
                'comma-dangle': [2, 'never'],
                semi: [2, 'never'],
            },
        },
    ],
};
