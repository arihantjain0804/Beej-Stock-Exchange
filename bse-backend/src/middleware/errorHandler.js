const logger = require('../utils/logger');
const { serverError } = require('../utils/response');
const errorHandler = (err, req, res, next) => { logger.error('Unhandled error', { error: err.message, path: req.path }); if (err.code === '23505') return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Resource already exists' } }); return serverError(res, err.message || 'Something went wrong'); };
module.exports = { errorHandler };
