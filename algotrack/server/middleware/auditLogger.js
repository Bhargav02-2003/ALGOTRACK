import { v4 as uuidv4 } from 'uuid';
import AuditLog from '../models/AuditLog.js';

export function auditLogger(req, res, next) {
  const startTime = Date.now();
  const auditId = uuidv4();

  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', async () => {
    const durationMs = Date.now() - startTime;

    try {
      const userId = req.user?.id || null;

      let sanitizedBody = null;
      if (req.body && Object.keys(req.body).length > 0) {
        const { password, password_hash, ...safeBody } = req.body;
        sanitizedBody = safeBody;
      }

      let sanitizedResponse = null;
      if (responseBody) {
        const respString = JSON.stringify(responseBody);
        sanitizedResponse = respString.length > 500 
          ? { truncated: true, size: respString.length }
          : responseBody;
      }

      // Determine entity_type from the URL (e.g. /api/users -> users)
      const segments = req.originalUrl.split('?')[0].split('/');
      let entityType = 'general';
      if (segments.length >= 3 && segments[1] === 'api') {
        entityType = segments[2]; 
      }

      const details = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent'),
        status_code: res.statusCode,
        duration_ms: durationMs,
        request_body: sanitizedBody,
        response_body: sanitizedResponse
      };

      await AuditLog.create({
        id: auditId,
        user_id: userId,
        action: req.method,
        entity_type: entityType,
        details
      });

    } catch (error) {
      console.error('Audit Logger Error:', error);
    }
  });

  next();
}
