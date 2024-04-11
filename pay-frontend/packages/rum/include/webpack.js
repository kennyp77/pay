module.exports = function webpackRum({ project, page }, isDevelopment) {
    if (isDevelopment) {
        const inline = [
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

        return {
            inlineAsset: {
                'rum-inline.js': { content: inline },
            },
            entryName: 'rum-bundle',
            entry: {},
            paths: [require.resolve('./bundle')],
        };
    }

    return {
        inlineAsset: {
            'rum-inline.js': { content: require('./inline')({ project, page }) },
        },
        entryName: 'rum-bundle',
        entry: {
            'rum-bundle': require.resolve('./bundle'),
        },
        paths: [require.resolve('./bundle')],
    };
};
