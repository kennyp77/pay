module.exports = {
    extends: '@yandex-pay',
    rules: {
        'newline-before-return': 'error',
        'import/order': [
            'error',
            {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                pathGroups: [
                    {
                        pattern: 'react',
                        group: 'builtin',
                        position: 'before',
                    },
                    {
                        pattern: '~/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: './**.scss',
                        group: 'index',
                        position: 'after',
                    },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
                'newlines-between': 'always',
                warnOnUnassignedImports: true,
            },
        ],
        'import/newline-after-import': ['error'],
    },
};
