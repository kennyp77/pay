import { express } from '@yandex-int/duffman';

import blackbox from '../middlewares/blackbox';
import csp from '../middlewares/csp';
import csrf from '../middlewares/csrf';
import tvm from '../middlewares/tvm';
import uatraits from '../middlewares/uatraits';
import yandexuid from '../middlewares/yandexuid';
import ymUid from '../middlewares/ym-uid';

import routeHandler from './handler';

const router = express.Router();

router.use(uatraits);
router.use(yandexuid());
router.use(ymUid({ fromQuery: 'ymuid', setOnPost: true }));
router.use(tvm);
router.use(csrf);
router.use(blackbox({ username: true }));
router.use(csp);

router.all('/', routeHandler);

module.exports = router;
