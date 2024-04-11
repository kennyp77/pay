import experiments from './abt/experiments';
import decreaseSession from './blackbox/decreaseSession';
import encryptCredentials from './console-webapi/encrypt-credentials';
import geocoderFindHouseNearby from './geocoder/find-house-nearby';
import userLocation from './location/user-location';
import metrikaCount from './metrika/count';
import metrikaView from './metrika/view';
import payWebapiIsReadyToPay from './pay-webapi/is-ready-to-pay';
import trustWebapiPaymentJson from './trust-webapi/payment-json';

export default {
    'geocoder/find-house-nearby': geocoderFindHouseNearby,
    'abt/experiments': experiments,
    'blackbox/decreaseSession': decreaseSession,
    'location/user-location': userLocation,
    'metrika/view': metrikaView,
    'metrika/count': metrikaCount,
    'pay-webapi/is-ready-to-pay': payWebapiIsReadyToPay,
    'console-webapi/encrypt-credentials': encryptCredentials,
    'trust-webapi/payment-json': trustWebapiPaymentJson,
};
