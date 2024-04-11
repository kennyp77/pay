const express = require('express');
const next = require('next');
const path = require('path');

const port = parseInt(process.env.APP_PORT, 10);
const dev = process.env.NODE_ENV === 'development';

const app = next({ dev })

app.prepare().then(() => {
  const handle = app.getRequestHandler()
  const server = express();

  server.disable('x-powered-by');

  server.get('/ping', (req, res) => res.status(200).send('OK'));

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://0.0.0.0:${port}`)
  })
});

/*
 * РЕШЕНИЕ НА ВРЕМЯ МИГРАЦИИ С МОКОВ
 */
const Restapify = require('restapify').default;

const apiFolderPath = path.resolve(__dirname, './mocked-api');

const rpfy = new Restapify({
  rootDir: apiFolderPath,
})

rpfy.on('start', () => {
  console.log(`restapify API is served at ${rpfy.publicPath}`);
  console.log(`restapify dashboard url: http://localhost:${rpfy.port}/restapify`);
});

rpfy.on('error', ({error, message}) => {
  console.log(error + ' ' + message)
});

rpfy.run();
