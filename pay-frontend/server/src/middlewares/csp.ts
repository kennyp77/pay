import { express } from '@yandex-int/duffman';
import { expressYandexCsp as yaCSP } from '@yandex-int/express-yandex-csp';

import { yaCSP as Config } from '../configs/production';
import { ExpressHandler, YaEnv } from '../typings/common';

function getPlatform(uatraits: any): 'touch' | 'desktop' {
    return uatraits.isTouch ? 'touch' : 'desktop';
}

export default function (config: Config, env: YaEnv): ExpressHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction): express.Response => {
        if (!req.cookies) {
            return next(
                new Error(
                    'cookie-parser middleware is not installed. Add it before use express-yandexuid: app.use(require("cookie-parser")())',
                ),
            );
        }

        if (!req.uatraits) {
            return next(
                new Error(
                    'express-uatraits middleware is not installed. Add it before use express-yandexuid: app.use(require("express-uatraits")())',
                ),
            );
        }

        const reportUriParams = [
            'from=pay',
            'project=pay',
            `platform=${getPlatform(req.uatraits)}`,
            `env=${env}`,
            `reqId=${req.requestId}`,
            `uid=${req.cookies.yandexuid}`,
            `login=${req.cookies.yandex_login}`,
            `page=${req.baseUrl}`,
        ].join('&');

        return yaCSP({
            presets: config.presets,
            directives: config.policies,
            from: config.serviceName,
            project: config.project,
            reportUri: `${config.reportUri}?${reportUriParams}`,
        })(req, res, next);
    };
}
