import yandexuid from '../../middlewares/yandexuid';
import { ExpressHandler } from '../../typings/common';
import { getYandexDomain } from '../../utils/yandex-domain';

interface YandexuidMiddlewareOptions {
    setOnPost?: boolean;
}

export default (options: YandexuidMiddlewareOptions = {}): ExpressHandler => {
    const { setOnPost } = options;

    return (req, res, next) => {
        const yaDomain = getYandexDomain(req.headers['x-original-host'] || req.hostname);

        return yandexuid({ yaDomain, setOnPost })(req, res, next);
    };
};
