import { express, middleware } from '@yandex-int/duffman';

import uatraits from '../middlewares/uatraits';
import ymUid from '../middlewares/ym-uid';

import routeHandler from './handler';

const router = express.Router();

router.use(uatraits);
// NB: Для Трека важно наличие yandexuid куки и ее выставление
router.use(middleware.yandexuid);
router.use(ymUid());
router.all('/', routeHandler);

module.exports = router;
