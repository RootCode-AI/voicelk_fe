// Production server for Heroku: serves the Vite build in dist/ and falls back to
// index.html for any other GET, so a reload never lands on a 404.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = process.env.PORT || 4173;

const app = express();
app.disable('x-powered-by');
// Heroku terminates TLS at its router and forwards the original scheme in a header.
app.set('trust proxy', true);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.get('x-forwarded-proto') === 'http') {
    return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
  }
  // Same header as the dev server in vite.config.js: Firebase Google sign-in opens a popup.
  res.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Vite fingerprints everything under assets/, so those files can be cached for good.
app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(dist));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, () => {
  console.log(`VoiceLK web client listening on port ${port}`);
});
