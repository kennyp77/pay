const config = require('../config/http-conf');

const tus_client = require('./tus-client');
const authHttp = require('./http').authHttp;

const qs = require('qs');
const _ = require('lodash');

async function getUserAuth(login) {
    const password = await tus_client.getUserPassword(login);

    return authHttp
        .post(
            '/token',
            qs.stringify({
                client_id: config.auth.clientId,
                client_secret: config.auth.clientSecret,
                grant_type: 'password',
                username: login,
                password: password,
            }),
        )
        .then((response) => response.data)
        .catch((reason) => console.log(reason));
}

module.exports = {
    getUserAuth: _.memoize(getUserAuth),
};
