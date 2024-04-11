require('dotenv').config();

const assert = require('assert');
const serialize = require('serialize-javascript');

const { USER_DATA } = require('./config');

function isHTML(contentType) {
  return contentType.includes('text/html');
}

function getInjectScript(data) {
  return `<script>window.__CONFIG = ${serialize(data)}</script>`;
}

function getOAuthToken() {
  assert(process.env.OAUTH_TOKEN, 'Unable to found OAUTH_TOKEN');

  return process.env.OAUTH_TOKEN;
}

function getUserInfo() {
  const token = getOAuthToken();

  const infoKey = Object.keys(USER_DATA).find((key) => token.endsWith(key));
  const userInfo = USER_DATA[infoKey];

  // assert(userInfo, 'Unable to get user info by OAUTH_TOKEN');

  return userInfo;
}

module.exports = {
  isHTML,
  getOAuthToken,
  getInjectScript,
  getUserInfo,
}
