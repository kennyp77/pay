import { express } from '@yandex-int/duffman';
import bodyParser from 'body-parser';

import routeHandler from './handler';

const router = express.Router();

router.use(bodyParser.raw());
router.all('/', routeHandler);

module.exports = router;
