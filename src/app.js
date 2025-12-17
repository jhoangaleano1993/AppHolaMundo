const express = require('express');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Hola Mundo',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
