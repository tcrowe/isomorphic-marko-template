const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const isNil = require("lodash/isNil");
const utf8Encoding = { encoding: "utf8" };
const cookieSecretPath = path.join(__dirname, "..", "..", "cookie-secret.txt");

/**
 * Write the secret so next time it can be read.
 * @param {function} done
 */
function generateCookieSecret(done) {
  const secret = crypto.randomBytes(64).toString("hex");
  fs.writeFile(cookieSecretPath, secret, utf8Encoding, function(err) {
    if (isNil(err) === false) {
      return done(err);
    }
    done(null, secret);
  });
}

/**
 * Get the cookie secret so users have a session.
 *
 * 1. Try to get `COOKIE_SECRET` environment variable
 * 2. Try to get `cookieSecretPath`
 * 3. Generate secret
 *
 * @param {function} done
 */
function getCookieSecret(done) {
  const { COOKIE_SECRET } = process.env;

  if (isNil(COOKIE_SECRET) === false) {
    return done(null, COOKIE_SECRET);
  }

  fs.exists(cookieSecretPath, function(exists) {
    if (exists === false) {
      return generateCookieSecret(done);
    }

    fs.readFile(cookieSecretPath, utf8Encoding, function(err, secret) {
      if (isNil(err) === false) {
        return done(err);
      }

      return done(null, secret);
    });
  });
}

module.exports = { generateCookieSecret, getCookieSecret };
