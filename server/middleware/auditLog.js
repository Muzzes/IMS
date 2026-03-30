const pool = require('../config/db');

const auditLog = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = (data) => {
    // Log after successful response
    if (res.statusCode < 400) {
      const entityId = req.params.id || req.params.userId || null;
      const entityType = req.params.id || req.params.userId ? 'record' : 'collection';
      
      const payloadDetails = {
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined // Avoid logging whole body if it contains sensitive data, though passwords aren't here typically
      };
      
      // Be careful not to log passwords or large payloads
      if (payloadDetails.body && payloadDetails.body.password) {
        payloadDetails.body.password = '[REDACTED]';
      }
      
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // We don't wait for this to finish to avoid blocking the response
      pool.query(
        `INSERT INTO audit_logs
         (user_id, action, entity_type, entity_id, details, ip_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user?.id || req.user?.sub || null, // handle different JWT payload formats just in case
          action,
          entityType,
          entityId,
          JSON.stringify(payloadDetails), // store details as JSON string
          ipAddress
        ]
      ).catch(err => console.error('Audit log failed:', err));
    }
    
    return originalJson(data);
  };
  
  next();
};

module.exports = auditLog;
