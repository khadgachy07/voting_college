import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from './src/config/index.js';

import routes from './src/routes/index.js';
import * as debugCtrl from './src/controllers/debugController.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.env === 'production' ? 'short' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Debug — system diagnostics (no auth; local dev only)
app.get('/debug', debugCtrl.debug);

// Mount API routes
app.use('/api', routes);

// 404 handler for API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const server = app.listen(config.port, () => {
  console.log(`✅ Server running on http://localhost:${config.port} [${config.env}]`);
});

export default server;
