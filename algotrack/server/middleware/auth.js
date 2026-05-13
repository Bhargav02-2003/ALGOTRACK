import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'algotrack-secret-key-2026';

/**
 * Authentication middleware.
 * Verifies JWT token from Authorization header.
 * Sets req.user with the decoded user info.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

/**
 * Optional auth middleware.
 * Sets req.user if token is valid, but doesn't block if missing.
 * Useful for audit logging on public endpoints.
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Token invalid, proceed without user
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

export { JWT_SECRET };
