const trustHttp = require('./http').trustHttp;
const getUserAuth = require('./get-auth').getUserAuth;

async function getBindedCardsFromUser(userLogin) {
    const { access_token } = await getUserAuth(userLogin);

    return trustHttp
        .get('/list_payment_methods', {
            params: {
                token: access_token,
            },
        })
        .then((response) => response)
        .catch((reason) => console.log(reason));
}

module.exports = {
    getBindedCardsFromUser,
};
