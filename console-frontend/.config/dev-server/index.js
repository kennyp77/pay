const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const { PAY_API_HOST, NEXT_DEV_HOST, DEV_SERVER_PORT } = require('./config');
const { isHTML, getInjectScript, getOAuthToken, getUserInfo } = require('./tools');


const app = express();

app.use('/api', createProxyMiddleware({
  target: PAY_API_HOST,
  changeOrigin: true,
  secure: false,
  onProxyReq: function(proxyReq) {
    proxyReq.setHeader('Authorization', `OAuth ${getOAuthToken()}`);
  }
}));

app.use('*', createProxyMiddleware({
  target: NEXT_DEV_HOST,
  ws: true,
  changeOrigin: true,
  selfHandleResponse: true,
  onProxyReq: function(proxyReq) {
    proxyReq.setHeader('Authorization', `OAuth ${getOAuthToken()}`);
  },
  onProxyRes: responseInterceptor((responseBuffer, proxyRes, req, res) => {
    if (isHTML(res.get('Content-Type') || '')) {
      const userInfoScript = getInjectScript(getUserInfo());

      return responseBuffer
        .toString('utf8')
        .replace('<head>', `<head>${userInfoScript}`)
    }

    return responseBuffer;
  }),
}));

console.log(`Dev server started at http://localhost:${DEV_SERVER_PORT}`)

app.listen(DEV_SERVER_PORT);
