const trustHttp = require('./http').trustHttp;
const getUserAuth = require('./get-auth').getUserAuth;

async function unbindCardFromUser(userLogin, pan) {
    const { access_token } = await getUserAuth(userLogin);

    return trustHttp
        .post('/unbind_card', {
            params: {
                token: access_token,
                card_number: pan,
            },
        })
        .then((response) => response)
        .catch((reason) => console.log(reason));
}

module.exports = {
    unbindCardFromUser,
};
