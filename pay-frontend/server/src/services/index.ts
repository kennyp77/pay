import addrs from './addrs';
import blackboxApi from './blackbox-api';
import consoleWebapi from './console-webapi';
import laas from './laas';
import metrika from './metrika';
import payWebapi from './pay-webapi';
import trustWebapi from './trust-webapi';
import uaas from './uaas';

export default {
    addrs,
    metrika,
    uaas,
    'blackbox-api': blackboxApi,
    laas,
    'pay-webapi': payWebapi,
    'trust-webapi': trustWebapi,
    'console-webapi': consoleWebapi,
};
