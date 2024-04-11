import { express } from '@yandex-int/duffman';

import bunker from '../middlewares/bunker';

import routeHandler from './handler';

const router = express.Router();

router.use(bunker);
router.all('/', routeHandler);

module.exports = router;
