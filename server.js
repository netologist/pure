// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'local';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Simple logging
const log = (level, message) => {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[LOG_LEVEL] || 2;
  
  if (levels[level] <= currentLevel) {
    console.log(`[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`);
  }
};

// Routes
app.get('/', (req, res) => {
  log('info', `Request to / from ${req.ip}`);
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>My App - ${ENV}</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 10px;
                backdrop-filter: blur(10px);
                text-align: center;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            }
            .env-badge {
                background: rgba(255,255,255,0.2);
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                margin: 10px 0;
                font-weight: bold;
            }
            .api-info {
                margin-top: 30px;
                padding: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 My App is Running!</h1>
            <div class="env-badge">Environment: ${ENV}</div>
            <p>Welcome to your containerized Node.js application</p>
            <p>Hostname: ${require('os').hostname()}</p>
            <p>Version: 1.0.0</p>
            
            <div class="api-info">
                <h3>Available Endpoints:</h3>
                <ul>
                    <li><a href="/health" style="color: #ffeb3b;">/health</a> - Health check</li>
                    <li><a href="/ready" style="color: #ffeb3b;">/ready</a> - Readiness check</li>
                    <li><a href="/info" style="color: #ffeb3b;">/info</a> - App information</li>
                    <li><a href="/api/status" style="color: #ffeb3b;">/api/status</a> - API status</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint (for Kubernetes liveness probe)
app.get('/health', (req, res) => {
  log('debug', 'Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: ENV
  });
});

// Readiness check endpoint (for Kubernetes readiness probe)
app.get('/ready', (req, res) => {
  log('debug', 'Readiness check requested');
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    environment: ENV
  });
});

// App info endpoint
app.get('/info', (req, res) => {
  log('info', 'Info endpoint requested');
  res.json({
    app: 'my-app',
    version: '1.0.0',
    environment: ENV,
    hostname: require('os').hostname(),
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  log('info', 'API status requested');
  res.json({
    api: 'active',
    status: 'operational',
    environment: ENV,
    timestamp: new Date().toISOString(),
    endpoints: [
      { path: '/', method: 'GET', description: 'Home page' },
      { path: '/health', method: 'GET', description: 'Health check' },
      { path: '/ready', method: 'GET', description: 'Readiness check' },
      { path: '/info', method: 'GET', description: 'App information' },
      { path: '/api/status', method: 'GET', description: 'API status' }
    ]
  });
});

// Simple API endpoint
app.get('/api/hello', (req, res) => {
  const name = req.query.name || 'World';
  log('info', `Hello API called with name: ${name}`);
  res.json({
    message: `Hello, ${name}!`,
    environment: ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  log('warn', `404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  log('error', `Error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: ENV === 'production' ? 'Something went wrong' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('info', 'Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    log('info', 'Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  log('info', `Server running on port ${PORT} in ${ENV} environment`);
  log('info', `Log level set to: ${LOG_LEVEL}`);
});

module.exports = app;