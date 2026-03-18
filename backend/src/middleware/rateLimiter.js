// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const apiLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Auth endpoints rate limit
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Payment endpoints rate limit
const paymentLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 requests per windowMs
  'Too many payment requests, please try again later.'
);

module.exports = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.paymentLimiter = paymentLimiter;