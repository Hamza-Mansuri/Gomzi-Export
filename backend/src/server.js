import { createApp } from './app.js';

const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
const host = process.env.HOST || '127.0.0.1';
const server = createApp().listen(port, host, () => console.log(`Gomzi API listening on http://${host}:${port}`));
server.requestTimeout = 15000;
server.headersTimeout = 17000;
server.on('error', error => { console.error('API startup failed:', error.message); process.exit(1); });

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const timer = setTimeout(() => { server.closeAllConnections(); process.exit(1); }, 10000).unref();
  server.close(() => { clearTimeout(timer); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
