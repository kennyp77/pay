import _ from 'lodash';

import { TVM_PARAMS } from '../constants';

export function getServiceTicket(core: any, name: string): Promise<{ ticket: string }> {
    const ticketP = _.get(core, ['req', 'tvm', TVM_PARAMS.clientId, 'tickets', name]);

    if (!ticketP) {
        core.logger.warn(`Unknown tvm service '${name}'`);

        return Promise.resolve({ ticket: '' });
    }

    return ticketP;
}

export function getUserTicket(core: any): string {
    return _.get(core, ['req', 'blackbox', 'userTicket']);
}
