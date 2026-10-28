export function notFound(_req, res) {
  res.status(404).json({ error: 'NOT_FOUND', message: 'This API route does not exist.' });
}

export function errorHandler(error, _req, res, _next) {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'PAYLOAD_TOO_LARGE', message: 'The request exceeds the 16 KB limit.' });
  }
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({ error: 'INVALID_JSON', message: 'Send a valid JSON request body.' });
  }
  if (error.code === 'CORS_BLOCKED') {
    return res.status(403).json({ error: 'ORIGIN_NOT_ALLOWED', message: 'This origin is not allowed.' });
  }
  console.error('Unhandled API error:', error.message);
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'The request could not be completed.' });
}
