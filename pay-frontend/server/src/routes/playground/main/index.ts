import { express } from '@yandex-int/duffman';

import csrf from '../../middlewares/csrf';

import routeHandler from './handler';

const router = express.Router();

router.use(csrf);
router.all('*', routeHandler);

module.exports = router;
