import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';
import { getCookie } from '../../helpers/cookie';
import { createMetrikaUrl } from '../../helpers/metrika';
import { getRequestUrl } from '../../helpers/request';

export default function view(params: Record<string, any>, core: BaseCore): Promise<any> {
    const viewUrl = getRequestUrl(core.req);
    const ymUid = getCookie(core.req, '_ym_uid', '');

    const url = createMetrikaUrl({ ymUid, viewUrl });

    return core.service('metrika')('', { url });
}

view[flags.NO_AUTH] = true;
view[flags.NO_CKEY] = true;
