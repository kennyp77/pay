import fs from 'fs';
import { resolve } from 'path';

// @ts-ignore
import { createServer } from './create-server';

const app = createServer();
const port = process.env.PORT || 3000;

const template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');

app.use('*', async(req, res) => {
    try {
        const url = req.originalUrl;

        const render = require('./entry.server.js').render;

        let html = template.replace('<!--app-html-->', render(url));
        html = html.replace(/<link/g, `<link nonce="${req.nonce}"`);
        html = html.replace(/<script/g, `<script nonce="${req.nonce}"`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
        // TODO: send error to error booster
        res.status(500).end('Internal Server Error');
    }
});

app.listen(port);
