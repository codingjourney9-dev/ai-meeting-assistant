

import { env } from '../config/env.js';


export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}


export function errorHandler(err, _req, res, _next) {
  console.error('[error]', err);

  
  
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(422).json({ error: err.message });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
