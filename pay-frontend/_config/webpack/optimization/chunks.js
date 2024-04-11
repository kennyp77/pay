function optimizationChunks() {
    return {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
                common: {
                    name: 'common',
                    chunks: 'initial',
                    minChunks: 2,
                },
                vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    priority: 0,
                    test: (module) =>
                        module.resource &&
                        module.resource.includes('node_modules') &&
                        !module.resource.includes('@yandex-int/rum-counter') &&
                        !module.resource.includes('@yandex-int/error-counter'),
                },
            },
        },
        runtimeChunk: {
            name: 'runtime',
        },
        removeEmptyChunks: true,
    };
}

module.exports = optimizationChunks;
