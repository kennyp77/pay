const assert = require('assert');

const { getService } = require('../services');

const { BUCKET, USE_YASTATIC } = require('./config');

module.exports = (serviceName) => {
    const { upload } = getService(serviceName);

    assert(upload.staticPath, 'Required option upload.staticPath is missing');
    assert(upload.staticTarget, 'Required option upload.staticTarget is missing');
    assert(upload.freezePath, 'Required option upload.freezePath is missing');
    assert(upload.freezeTarget, 'Required option upload.freezeTarget is missing');

    return {
        bucket: BUCKET,
        useYastaticCdn: USE_YASTATIC,
        static: {
            path: upload.staticPath,
            target: upload.staticTarget,
            throwOnOverwrite: false,
        },
        freeze: {
            path: upload.freezePath,
            target: upload.freezeTarget,
        },
    };
};
