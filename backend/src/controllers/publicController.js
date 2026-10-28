import { capabilities } from '../data/capabilities.js';

export function health(_req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', service: 'gomzi-export-api', version: '1.0.0', mode: 'ui-scaffold' });
}

export function listCapabilities(_req, res) {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ formats: capabilities });
}

export function unavailableInquiry(_req, res) {
  // Never claim to accept an inquiry without durable storage / delivery.
  res.status(503).json({
    error: 'INQUIRY_SERVICE_NOT_CONFIGURED',
    message: 'Online inquiry delivery is not configured. Please contact info@gomzilifesciences.in.',
  });
}
