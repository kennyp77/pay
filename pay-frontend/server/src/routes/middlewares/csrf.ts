import { Csrf } from '@yandex-int/csrf';
import { express } from '@yandex-int/duffman';

import { getEnv } from '../../utils';

const csrf = new Csrf({ key: getEnv('CSRF_KEY') });

export default function (req: express.Request, res: express.Response, next: express.NextFunction): express.Response {
    req.csrfToken = csrf.generateToken({
        yandexuid: req.cookies && req.cookies.yandexuid,
        uid: '0',
    });

    return next();
}
