const trustHttp = require('./http').trustHttp;
const getUserAuth = require('./get-auth').getUserAuth;

async function bindCardToUser(userLogin, pan, cardData = {}) {
    const { access_token } = await getUserAuth(userLogin);
    const { cvn = '300', region_id = '225', year = '2022', month = '12' } = cardData;

    return trustHttp
        .post('/bind_card', {
            params: {
                cvn: cvn,
                region_id: region_id,
                expiration_year: year,
                expiration_month: month,
                token: access_token,
                cardholder: 'TEST TEST',
                card_number: pan,
            },
        })
        .then((response) => response)
        .catch((reason) => console.log(reason));
}

module.exports = {
    bindCardToUser,
};
