module.exports = {
    arrowParens: 'always',
    bracketSpacing: true,
    htmlWhitespaceSensitivity: 'css',
    jsxBracketSameLine: false,
    jsxSingleQuote: false,
    printWidth: 100,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    overrides: [
        {
            files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
            options: {
                parser: 'typescript',
            },
        },
        {
            files: ['*.json'],
            options: {
                parser: 'json',
                singleQuote: false,
            },
        },
        {
            files: ['*.css'],
            options: {
                parser: 'css',
            },
        },
        {
            files: ['*.scss'],
            options: {
                parser: 'scss',
            },
        },
    ],
};
