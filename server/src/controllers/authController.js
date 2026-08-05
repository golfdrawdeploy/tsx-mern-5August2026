const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const REFRESH_COOKIE_NAME = 'refreshToken';

/** Shared cookie options for setting/clearing the refresh token cookie. */
function refreshCookieOptions() {
  return {
    httpOnly: true, // JS on the client can NEVER read this - mitigates XSS token theft
    sameSite: 'strict', // mitigates CSRF - cookie only sent on same-site requests
    secure: process.env.NODE_ENV === 'production', // requires HTTPS in prod
    path: '/auth', // only sent to auth routes, minimizing exposure
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, mirrors REFRESH_TOKEN_TTL
  };
}

/**
 * POST /auth/login
 * Verifies credentials against Mongo (bcrypt compare), then issues:
 * - an access token in the JSON response body (kept in memory client-side)
 * - a refresh token as an httpOnly cookie
 */
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await User.findOne({ username });
  if (!user) {
    // Deliberately vague error message - don't reveal whether the username exists.
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return res.json({
    accessToken,
    user: { id: user._id.toString(), username: user.username },
  });
}

/**
 * POST /auth/refresh
 * Reads the refresh token from the httpOnly cookie, verifies it, and if
 * valid, issues a brand-new access token (this is what makes "silent
 * refresh" silent - no credentials are re-entered).
 */
async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided.' });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (err) {
    // Expired or tampered refresh token - clear the dead cookie and force real re-login.
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
    return res.status(401).json({ error: 'Refresh token invalid or expired.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
    return res.status(401).json({ error: 'User no longer exists.' });
  }

  const accessToken = signAccessToken(user);

  // Rotate the refresh token's expiry on each use so an active session
  // doesn't get logged out from underneath the user after 7 days of use.
  const newRefreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions());

  return res.json({
    accessToken,
    user: { id: user._id.toString(), username: user.username },
  });
}

/**
 * POST /auth/logout
 * Clears the refresh cookie server-side. The client is responsible for
 * dropping its in-memory access token on its own end.
 */
async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
  return res.status(204).send();
}

/** GET /auth/me - handy for debugging/manual testing of the access token. */
async function me(req, res) {
  return res.json({ id: req.userId, username: req.username });
}

module.exports = { login, refresh, logout, me };
