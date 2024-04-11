import { express } from '@yandex-int/duffman';
import bodyParser from 'body-parser';

import blackbox from '../../middlewares/blackbox';
import tvm from '../../middlewares/tvm';

import routeHandler from './handler';

const router = express.Router();

router.use(tvm);
router.use(blackbox());
router.use(bodyParser.urlencoded({ extended: false }));
router.all('/', routeHandler);

module.exports = router;
