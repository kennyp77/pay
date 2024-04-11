import express from 'express';

import { serverCspMiddleware } from './middlewares/server-csp-middleware';

export function createServer() {
    const app = express();

    app.use(require('cookie-parser')());
    app.use(serverCspMiddleware);

    return app;
}
