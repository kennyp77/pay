import expressUatraits from '@yandex-int/express-uatraits';

import config from '../../configs';

// @ts-ignore  почему-то в опцият требуется ключ uatraits вместо extra
export default expressUatraits(config.uatraits);
