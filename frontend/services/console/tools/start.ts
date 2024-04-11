import fs from 'fs';
import * as https from 'https';
import os from 'os';
import * as path from 'path';
import { resolve } from 'path';

import { createServer as createViteServer, createLogger, searchForWorkspaceRoot } from 'vite';

import { createServer } from '../src/server/create-server';

import { secrets } from './helpers/secrets';

import type * as tls from 'tls';

const logger = createLogger('info', { prefix: '[wds]' });

process.env.YENV = 'development';

async function start(cert: tls.SecureContextOptions) {
    const app = createServer();

    const vite = await createViteServer({
        root: process.cwd(),
        logLevel: 'info',
        server: {
            https: cert,
            middlewareMode: 'ssr',
            watch: {
                // During tests we edit the files too fast and sometimes chokidar
                // misses change events, so enforce polling for consistency
                usePolling: true,
                interval: 100,
            },
            fs: {
                allow: [
                    // search up for workspace root
                    searchForWorkspaceRoot(process.cwd()),
                    // pnpm store
                    path.join(os.homedir(), '.pay-frontend-tmp'),
                ],
            },
        },
    });
    app.use(vite.middlewares);

    app.use('*', async(req, res) => {
        try {
            const url = req.originalUrl;

            let template;
            template = fs.readFileSync(resolve(path.join(process.cwd(), 'index.html')), 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            const render = (await vite.ssrLoadModule('/src/entry.server.tsx')).render;

            let html = template.replace('<!--app-html-->', render(url));
            html = html.replace(/<link/g, `<link nonce="${req.nonce}"`);
            html = html.replace(/<script/g, `<script nonce="${req.nonce}"`);

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            vite.ssrFixStacktrace(e);
            logger.error(e.stack);
            res.status(500).end(e.stack);
        }
    });

    https.createServer(cert, app).listen(3000, () => {
        logger.info('Server running at https://pay.local.yandex.ru:3000', { timestamp: true });
    });
}

async function main() {
    // yav secret: local.yandex.ru (sec-01ftb36pg46b6pcm0v279qzsrv)
    let tokens = await secrets('ver-01ftez4hc947vkw8bc6e03nvs2');

    // yav secret: local.yandex.ru ssl cert
    let pem = tokens['pay.local.yandex.ru.pem'];

    await start({
        key: pem,
        cert: pem,
    });
}

main();
