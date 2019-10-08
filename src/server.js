// pull in environment variables from ../.env
require("dotenv").config();

// allow requiring marko template
require("marko/node-require");

const url = require("url");
const path = require("path");
const isNil = require("lodash/isNil");
const noop = require("lodash/noop");
const express = require("express");
const nocache = require("nocache");
const compression = require("compression");
const markoExpress = require("marko/express");
const cookieSession = require("cookie-session");
const { getCookieSecret } = require("./lib/cookies");
const server = express();
const { NODE_ENV } = process.env;
const isDev = NODE_ENV === "development";
const isPrd = NODE_ENV === "production";
const { PORT = 7162, HOST = "127.0.0.1" } = process.env;
const publicPath = path.join(__dirname, "..", "dist");
const template = require("./index.marko");

/*

We aggressively disable express caching in development but it's okay
in production.

*/

const staticOpts = {
  etag: isPrd,
  lastModified: isPrd
};

if (isDev === true) {
  staticOpts.setHeaders = res => nocache(null, res, noop);
}

server.disable("etag").disable("x-powered-by");

if (isDev === true) {
  server.use(nocache());
}

/**
 * Not found route handler: No route matched the URI
 *
 * eslint is disabled because we need `next` for express to recognize this
 * function by it's signature but we don't use it.
 * @method notFoundHandler
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
/* eslint-disable */
function notFoundHandler(req, res, next) {
  /* eslint-enable */
  const { method, originalUrl } = req;
  const { headersSent } = res;

  if (headersSent === true) {
    return;
  }

  const message = "404 not found";
  res.status(404).json({ method, originalUrl, message });
}

/**
 * Final error handler: ⚠️ this router handler is last for error handling
 *
 * It's connected after `start()`
 *
 * eslint is disabled because we need `next` for express to recognize this
 * function by it's signature but we don't use it.
 * @method serverErrorHandler
 * @param {object} err
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
/* eslint-disable */
function serverErrorHandler(err, req, res, next) {
  /* eslint-enable */
  const { method, originalUrl } = req;

  if (res.headersSent === true) {
    return;
  }

  const message = "500 server error";
  res.status(500).json({ method, originalUrl, message });
}

/**
 * Render out the marko app and give it some useful state to begin with.
 * @param {object} req
 * @param {object} res
 */
function render(req, res) {
  let { pathname } = url.parse(req.originalUrl);
  let { query = {}, params = {}, body = null } = req;
  let { error, locals } = res;
  const page = { title: "isomorphic-marko-template" };
  const session = req.session.toJSON();
  const $global = {
    serializedGlobals: {
      pathname: true,
      query: true,
      params: true,
      body: true,
      session: true,
      page: true,
      error: true,
      locals: true
    },
    pathname,
    query,
    params,
    body,
    session,
    page,
    error,
    locals
  };
  res.marko(template, {
    pathname,
    query,
    params,
    body,
    session,
    page,
    error,
    locals,
    $global
  });
}

/**
 * The start up needs to be async because we're getting the cookie secret
 * before starting the server.
 */
function start() {
  getCookieSecret(function(err, secret) {
    if (isNil(err) === false) {
      const { message, stack } = err;
      console.log("error getting cookie secret", message, stack);
      return;
    }

    server
      .use(compression())
      .use(cookieSession({ secret }))
      .use(express.static(publicPath, staticOpts))
      .use(markoExpress())
      .get("/", render)
      .get("/resources", render)
      .get("/about", render)
      .use(notFoundHandler)
      .use(serverErrorHandler);

    server.listen(PORT, HOST, function(err) {
      if (isNil(err) === false) {
        const { message, stack } = err;
        console.log("error starting server", message, stack);
        return;
      }

      const serverUrl = `http://${HOST}:${PORT}`;
      console.log(serverUrl);
    });
  });
}

// GO! 🚀
start();
