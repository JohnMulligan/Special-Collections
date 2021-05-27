const path = require("path");
const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const app = express(); // create express app

if (process.env.NODE_ENV !== 'production') {
  // Allow an .env file in development to store local Omeka access keys.
  require('dotenv').config();
}

// TODO: Implement JWT logic
// https://www.luiztools.com.br/post/autenticacao-json-web-token-jwt-em-nodejs/

// TODO: Read from environment vars.
const omekaProtocol = process.env.OMEKA_PROTOCOL || 'http';
const omekaUrl = process.env.OMEKA_URL || 'localhost';
const port = process.env.SERVER_PORT || 3000;
const baseUrl = `${process.env.BASE_URL || 'localhost'}:${port}`;

// This approach was found in the GitHub post:
// https://github.com/chimurai/http-proxy-middleware/issues/293#issuecomment-449548863
const updateQueryStringParameter = (path, key, value) => {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = path.indexOf('?') !== -1 ? '&' : '?';
  if (path.match(re)) {
    return path.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return path + separator + key + '=' + value;
  }
};

const baseProxyConfig = {
  target: `${omekaProtocol}://${omekaUrl}`,
  changeOrigin: true,
  pathRewrite: function(path, req) {
    let newPath = path;
    // TODO: we need to get the authenticated user and fetch
    // the corresponding id/cred pair.
    newPath = updateQueryStringParameter(newPath, 'key_identity',  process.env.OMEKA_ADMIN_ID);
    newPath = updateQueryStringParameter(newPath, 'key_credential',  process.env.OMEKA_ADMIN_CREDENTIAL);
    return newPath;
  }
};

const apiUrlRegex = new RegExp(omekaUrl, "g");

const apiProxyConfig = {
  ...baseProxyConfig,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    // Omeka S includes its own URL in several parts of the response.
    // Here we replace all occurrances it by our proxy URL.
    const response = responseBuffer.toString('utf8');
    return response.replace(apiUrlRegex, baseUrl);
  })
};

// Proxy for Omeka S:
app.use('/api', createProxyMiddleware(apiProxyConfig));
const omekaStaticProxy = createProxyMiddleware(baseProxyConfig);
app.use('/files', omekaStaticProxy);
app.use('/application', omekaStaticProxy);

// Map React urls to the React App.
app.use('/react', [
  function (req, res, next) {
    req.url = req.url.replace('/react/', '/');
    next();
  }, express.static(path.join(__dirname, "..", "build"))]);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '/build/index.html'));
});

app.listen(port, () => {
  console.log(`server started on port ${port}`);
});