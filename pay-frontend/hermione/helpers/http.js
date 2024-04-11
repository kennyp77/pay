const https = require('https');

const axios = require('axios');

const config = require('../config/http-conf');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const authHttp = axios.create({
    baseURL: config.auth.baseUrl,
    httpsAgent: httpsAgent,
});

const trustHttp = axios.create({
    baseURL: config.trust.baseUrl,
    httpsAgent: httpsAgent,
});

module.exports = {
    authHttp,
    trustHttp,
};
