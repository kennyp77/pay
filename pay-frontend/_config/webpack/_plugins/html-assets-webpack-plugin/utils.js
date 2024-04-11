const path = require('path');

function hasProp(obj, prop) {
    // eslint-disable-next-line no-prototype-builtins
    return Boolean(obj && obj.hasOwnProperty && obj.hasOwnProperty(prop));
}

function isScript(tag) {
    return tag.tagName === 'script';
}

function isResourceLink(tag) {
    return tag.tagName === 'link';
}

/**
 * @param {string} toMatch
 * @param {string|string[]|RegExp|RegExp[]} matchers
 * @returns {boolean}
 */
function matches(toMatch, matchers) {
    if (!Array.isArray(matchers)) {
        // eslint-disable-next-line no-param-reassign
        matchers = [matchers];
    }

    return matchers.some((matcher) =>
        matcher instanceof RegExp ? matcher.test(toMatch) : toMatch.includes(matcher),
    );
}

function getScriptPath(tag, publicPath) {
    let scriptPath = '';

    if (isScript(tag)) {
        scriptPath = (tag.attributes && tag.attributes.src) || '';
    }
    if (isResourceLink(tag)) {
        scriptPath = (tag.attributes && tag.attributes.href) || '';
    }
    if (publicPath) {
        scriptPath = scriptPath.replace(publicPath, '');
    }

    return scriptPath;
}

function getScriptName(tag, publicPath = '') {
    return path.basename(getScriptPath(tag, publicPath));
}

function rewriteScriptPath(tag, rewritePath) {
    const scriptName = getScriptName(tag);

    return path.join(rewritePath, scriptName);
}

module.exports = {
    hasProp,
    matches,
    getScriptPath,
    getScriptName,
    rewriteScriptPath,
};
