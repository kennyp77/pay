import { express } from '@yandex-int/duffman';

const router = express.Router();

router.use(function (req: express.Request, res: express.Response): express.Response {
    res.set({
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
    });

    return res.status(200).send('OK');
});

module.exports = router;
