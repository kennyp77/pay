import { express } from '@yandex-int/duffman';

import blackbox from '../middlewares/blackbox';
import csp from '../middlewares/csp';
import csrf from '../middlewares/csrf';
import tvm from '../middlewares/tvm';
import uatraits from '../middlewares/uatraits';
import yandexuid from '../middlewares/yandexuid';

import routeHandler from './handler';

const router = express.Router();

router.use(uatraits);
router.use(yandexuid());
router.use(tvm);
router.use(csp);
router.use(csrf);
router.use(blackbox());
router.all('/', routeHandler);

module.exports = router;
