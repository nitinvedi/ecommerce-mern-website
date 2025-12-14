// Simple rate limiting middleware
// For production, consider using express-rate-limit package

const rateLimitStore = new Map();

// Rate limit middleware
export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later",
    skipSuccessfulRequests = false
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    // Clean up old entries
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now - v.resetTime > windowMs) {
          rateLimitStore.delete(k);
        }
      }
    }

    const record = rateLimitStore.get(key);

    if (!record || now - record.resetTime > windowMs) {
      // Create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now
      });
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        message,
        retryAfter
      });
    }

    record.count++;
    next();
  };
};

// Strict rate limit for auth routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: "Too many authentication attempts, please try again later"
});

// General API rate limit
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: "Too many requests, please try again later"
});

