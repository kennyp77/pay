import { express } from '@yandex-int/duffman';
import bodyParser from 'body-parser';

import blackbox from '../middlewares/blackbox';
import csp from '../middlewares/csp';
import csrf from '../middlewares/csrf';
import tvm from '../middlewares/tvm';
import uatraits from '../middlewares/uatraits';

import routeHandler from './handler';

const router = express.Router();

router.use(uatraits);
router.use(tvm);
router.use(csp);
router.use(csrf);
router.use(blackbox());
router.use(bodyParser.urlencoded({ extended: false }));
router.all('/', routeHandler);

module.exports = router;
