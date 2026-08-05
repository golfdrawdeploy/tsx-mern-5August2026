const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '60s';
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

/** Issues a short-lived access token carrying the user's id + username. */
function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), username: user.username }, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

/** Issues a longer-lived refresh token. Kept minimal on purpose - just enough to re-issue an access token. */
function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
}

/** Throws if the access token is missing/expired/tampered with. */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/** Throws if the refresh token is missing/expired/tampered with. */
function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
