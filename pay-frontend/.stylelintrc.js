const { resolvePath } = require('./_config/paths');

module.exports = {
    extends: [resolvePath('_config/stylelint')],
    rules: {
        'value-list-comma-space-after': 'always-single-line',
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    'extends',
                    'tailwind',
                    'for',
                    'mixin',
                    'define-mixin',
                    'media',
                    'mixin-content',
                    'each',
                    'include',
                    'use',
                ],
            },
        ],
    },
};
