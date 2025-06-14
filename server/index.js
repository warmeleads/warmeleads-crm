const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const leadRoutes = require('./routes/leads');
const distributionRoutes = require('./routes/distribution');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced.');
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log('============================================================');
      console.log('🚀 Backend gestart!');
      console.log(`🌍 Luistert op: http://localhost:${PORT}`);
      const used = Math.round(process.memoryUsage().rss / 1024 / 1024);
      console.log('📦 Geheugengebruik:', used, 'MB');
      if (used < 512) {
        console.log('⚠️  Waarschuwing: Het beschikbare geheugen lijkt laag. Overweeg Node te starten met meer geheugen:');
        console.log('   export NODE_OPTIONS=--max-old-space-size=4096');
      }
      console.log('Tip: Als de server direct wordt "killed", heb je waarschijnlijk een geheugenprobleem.');
      console.log('     - Probeer een kleinere Google Sheet.');
      console.log('     - Start met extra geheugen: export NODE_OPTIONS=--max-old-space-size=4096');
      console.log('     - Check logs in server/logs/error.log voor details.');
      console.log('============================================================');
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Poort ${PORT} is al in gebruik. Kies een andere poort of stop het andere proces.`);
        console.error(`❌ Poort ${PORT} is al in gebruik. Kies een andere poort of stop het andere proces.`);
        process.exit(1);
      } else {
        logger.error('Server error:', err);
        throw err;
      }
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 