const { parse } = require('postcss');

const { kebabify, isPlainObject } = require('./utils');
const balanced = require('./utils/balanced-match');

const RE_PROP_SET = /^(--)([\w-]+)(\s*)([:]?)$/;
const RE_VALUE_SET = /^\{.*}$/s;

class Visitor {
    cache = {};
    result = {};
    options = {};

    defaults = {
        preserve: false,
        sets: {},
    };

    constructor(options) {
        this.options = {
            ...this.defaults,
            ...options,
        };
    }

    /**
     * Prepend JS defined sets into the cache before parsing.
     * This means CSS defined sets will overrides them if they share the same name.
     */
    prepend = () => {
        const { sets } = this.options;

        Object.keys(sets).forEach((setName) => {
            const newRule = postcss.rule({ selector: `--${setName}` });

            const set = sets[setName];

            if (typeof set === 'string') {
                newRule.prepend(set);
            } else if (isPlainObject(set)) {
                Object.entries(set).forEach(([prop, value]) => {
                    newRule.prepend(postcss.decl({ prop: kebabify(prop), value }));
                });
            } else {
                throw new Error(`Unrecognized set type \`${typeof set}\`, must be an object or string.`);
            }

            this.cache[setName] = newRule;
        });
    };

    /**
     * Collect all `:root` declared property sets and save them.
     */
    collect = (rule) => {
        const matches = RE_PROP_SET.exec(rule.prop);
        const valueMatch = RE_VALUE_SET.exec(rule.value);

        if (!matches || !valueMatch) {
            return;
        }

        const setName = matches[2];
        const { parent } = rule;

        if (parent.selector !== ':root') {
            rule.warn(
                this.result,
                'Custom property set ignored: not scoped to top-level `:root` ' +
                    `(--${setName}` +
                    `${parent.type === 'rule' ? ` declared in ${parent.selector}` : ''})`,
            );

            if (parent.type === 'root') {
                rule.remove();
            }

            return;
        }

        const newRule = getFirstNode(parse(rule.value));

        if (!newRule) {
            return;
        }

        this.cache[setName] = newRule;

        if (!this.options.preserve) {
            removeCommentBefore(rule);
            safeRemoveRule(rule);
        }

        if (!parent.nodes.length) {
            parent.remove();
        }
    };

    /**
     * Replace nested `@apply` at-rules declarations.
     */
    resolveNested = () => {
        Object.keys(this.cache).forEach((rule) => {
            this.cache[rule].walkAtRules('apply', (atRule) => {
                this.resolve(atRule);

                // @TODO honor `preserve` option.
                atRule.remove();
            });
        });
    };

    /**
     * Replace `@apply` at-rules declarations with provided custom property set.
     */
    resolve = (atRule) => {
        let ancestor = atRule.parent;

        while (ancestor && ancestor.type !== 'rule') {
            ancestor = ancestor.parent;
        }

        if (!ancestor) {
            atRule.warn(this.result, 'The @apply rule can only be declared inside Rule type nodes.');

            atRule.remove();

            return;
        }

        if (isDefinition(atRule.parent)) {
            return;
        }

        const param = getParamValue(atRule.params);
        const matches = RE_PROP_SET.exec(param);

        if (!matches) {
            return;
        }

        const setName = matches[2];
        const { parent } = atRule;

        if (!(setName in this.cache)) {
            atRule.warn(this.result, `No custom property set declared for \`${setName}\`.`);

            return;
        }

        const newRule = this.cache[setName].clone();
        cleanIndent(newRule);

        if (this.options.preserve) {
            parent.insertBefore(atRule, newRule.nodes);

            return;
        }

        atRule.replaceWith(newRule.nodes);
    };
}

function getFirstNode(rule) {
    return rule && Array.isArray(rule.nodes) ? rule.nodes[0] : null;
}

/**
 * Helper: return whether the rule is a custom property set definition.
 */
function isDefinition(rule) {
    return (
        !!rule.selector &&
        !!RE_PROP_SET.exec(rule.selector) &&
        rule.parent &&
        !!rule.parent.selector &&
        rule.parent.selector === ':root'
    );
}

/**
 * Helper: allow parens usage in `@apply` AtRule declaration.
 * This is for Polymer integration.
 */
function getParamValue(param) {
    return /^\(/.test(param) ? balanced('(', ')', param).body : param;
}

/**
 * Helper: remove excessive declarations indentation.
 */
function cleanIndent(rule) {
    rule.walkDecls((decl) => {
        if (typeof decl.raws.before === 'string') {
            decl.raws.before = decl.raws.before.replace(/[^\S\n\r]{2,}/, '  ');
        }
    });
}

/**
 * Helper: correctly handle property sets removal and semi-colons.
 * @See: postcss/postcss#1014
 */
function safeRemoveRule(rule) {
    if (rule === rule.parent.last && rule.raws.ownSemicolon) {
        rule.parent.raws.semicolon = true;
    }

    rule.remove();
}

/**
 * Helper: remove immediate preceding comments.
 */
function removeCommentBefore(node) {
    const previousNode = node.prev();

    if (previousNode && previousNode.type === 'comment') {
        previousNode.remove();
    }
}

module.exports = (options) => {
    return {
        postcssPlugin: 'postcss-apply-8',
        Once(root, { result }) {
            const visitor = new Visitor(options);
            visitor.result = result;

            visitor.prepend();

            root.walkDecls(visitor.collect);

            visitor.resolveNested();

            root.walkAtRules('apply', visitor.resolve);
        },
    };
};

module.exports.postcss = true;
