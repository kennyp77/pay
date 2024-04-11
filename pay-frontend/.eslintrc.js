module.exports = {
    extends: [require.resolve('./_config/eslint'), 'plugin:react-hooks/recommended'],
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
                        group: 'external',
                        position: 'before',
                    },
                    {
                        pattern: './**.scss',
                        group: 'index',
                        position: 'after',
                    },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
                'newlines-between': 'always',
                warnOnUnassignedImports: true,
            },
        ],
        'import/newline-after-import': ['error'],
    },
};
