const tokenator = require('@yandex-int/tokenator');
const { TUSClient } = require('@yandex-int/tus-client');

const tusClientConfig = require('../config/tus-client-conf');

async function getUserPassword(login) {
    const { tus: tusToken } = await tokenator('tus');
    //пароль можно получить только из tus-клиента
    const tusClient = new TUSClient(
        tusToken,
        {
            env: tusClientConfig.env,
            tus_consumer: tusClientConfig.tus_consumer,
        },
        tusClientConfig.requestOptions,
    );
    const account = await tusClient.getAccount({ login: login, lock_duration: 0 });

    return account.account.password;
}

module.exports = {
    getUserPassword,
};
