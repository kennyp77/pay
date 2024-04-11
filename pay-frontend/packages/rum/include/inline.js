const fs = require('fs');

const has = require('@tinkoff/utils/object/has');
const UglifyJS = require('uglify-js');

const interpolate = (str, data = {}) =>
    str.replace(/%.+?%/g, (match) => {
        const key = match.substr(1, match.length - 2);

        return has(key, data) ? data[key] : match;
    });

const readScript = (name) => {
    return fs.readFileSync(require.resolve(name), 'utf-8');
};

const minifyScript = (content) => {
    const res = UglifyJS.minify(content);

    if (res.error) {
        throw new Error(res.error);
    }

    return res.code;
};

module.exports = ({ project, page }, isDevelopment) => {
    if (isDevelopment) {
        return [
            '(window.Ya || (window.Ya = {})).Rum = {',
            'logError: () => {},',
            'ERROR_LEVEL: {},',
            'sendTimeMark: () => {},',
            'time: () => {},',
            'timeEnd: () => {},',
            'getTime: () => {},',
            'sendDelta: () => {},',
            '};',
        ].join('');
    }

    return [
        readScript('@yandex-int/rum-counter/dist/inline/interface.min.js'),
        readScript('@yandex-int/rum-counter/dist/inline/longtask.min.js'),
        readScript('@yandex-int/rum-counter/dist/inline/io.min.js'),
        // Подключается в inline для error-counter
        isDevelopment
            ? minifyScript(readScript('@yandex-int/rum-counter/debug/blockstat.js'))
            : readScript('@yandex-int/rum-counter/dist/bundle/send.min.js'),
        readScript('@yandex-int/error-counter/dist/interfaceOverRum.min.js'),
        readScript('@yandex-int/error-counter/dist/implementation.min.js'),
        readScript('@yandex-int/error-counter/dist/filters.min.js'),
        readScript('@yandex-int/error-counter/dist/logError.min.js'),
        minifyScript(interpolate(readScript('./inline-config.js'), { project, page })),
    ].join('');
};
