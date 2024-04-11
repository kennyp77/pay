import expressTvmMiddleware from '@yandex-int/express-tvm';

import { TVM_PARAMS } from '../../constants';
import { getEnv } from '../../utils';

export default expressTvmMiddleware({
    clientId: TVM_PARAMS.clientId,
    destinations: TVM_PARAMS.destinations,
    serverUrl: getEnv('DEPLOY_TVM_TOOL_URL'),
    token: getEnv('TVMTOOL_LOCAL_AUTHTOKEN'),
    logError: false,
    throwError: true,
});
