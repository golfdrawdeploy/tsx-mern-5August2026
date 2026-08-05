const { verifyAccessToken } = require('../utils/jwt');

/**
 * Guards protected routes. Reads `Authorization: Bearer <token>`, verifies
 * it, and attaches `req.userId`/`req.username` on success.
 *
 * Crucially returns 401 (not 403) on missing/invalid/expired tokens -
 * the frontend's axios interceptor specifically listens for 401 to decide
 * "this is a stale access token, try silently refreshing it".
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.username = payload.username;
    return next();
  } catch (err) {
    // Covers both "expired" (TokenExpiredError) and "tampered/invalid" (JsonWebTokenError).
    return res.status(401).json({ error: 'Access token invalid or expired.' });
  }
}

module.exports = { requireAuth };
