import { flags } from '@yandex-int/duffman';

import BaseCore from '../../core/base-core';
import { getCookie } from '../../helpers/cookie';
import { createMetrikaUrl } from '../../helpers/metrika';

export default function count(params: Record<string, any>, core: BaseCore): Promise<any> {
    const ymUid = getCookie(core.req, '_ym_uid', '');
    const url = createMetrikaUrl({ params, ymUid });

    return core.service('metrika')('', { url });
}

count[flags.NO_AUTH] = true;
count[flags.NO_CKEY] = true;
