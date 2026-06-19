const { verifyAccess } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/response');
const authenticate = (req, res, next) => { const header = req.headers.authorization; if (!header || !header.startsWith('Bearer ')) return unauthorized(res, 'No token provided'); const token = header.slice(7); try { req.user = verifyAccess(token); next(); } catch (err) { return unauthorized(res, 'Invalid or expired token'); } };
const requireRole = (...roles) => (req, res, next) => { if (!req.user) return unauthorized(res); if (!roles.includes(req.user.role)) return forbidden(res, `Requires role: ${roles.join(' or ')}`); next(); };
module.exports = { authenticate, requireRole };
