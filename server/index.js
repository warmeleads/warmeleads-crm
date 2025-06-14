const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const logger = require('./utils/logger');
const GoogleSheetsService = require('./services/GoogleSheetsService');

// Global variable to track database availability
global.dbAvailable = false;

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const leadRoutes = require('./routes/leads');
const distributionRoutes = require('./routes/distribution');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('ENV:', process.env);
process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', function (reason, p) {
  console.error('Unhandled Rejection:', reason);
});

// Database availability middleware
const checkDatabase = (req, res, next) => {
  if (!global.dbAvailable) {
    return res.status(503).json({ 
      error: 'Database not available', 
      message: 'Please add a DATABASE_URL environment variable to enable database features' 
    });
  }
  next();
};

// Security middleware
const allowedOrigins = [
  'https://warmeleads-crm.onrender.com',
  'https://www.warmeleadscrm.nl',
  'https://warmeleads-frontend.onrender.com',
  'http://localhost:3000'
];

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: global.dbAvailable ? 'connected' : 'disconnected'
  });
});

// API routes (with database check)
app.use('/api/auth', checkDatabase, authRoutes);
app.use('/api/customers', checkDatabase, customerRoutes);
app.use('/api/leads', checkDatabase, leadRoutes);
app.use('/api/distribution', checkDatabase, distributionRoutes);
app.use('/api/analytics', checkDatabase, analyticsRoutes);
app.use('/api/settings', checkDatabase, settingsRoutes);

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
    // Test database connection (optional for now)
    try {
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');
      global.dbAvailable = true;
      
      // Sync database (in development)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database synced.');
      }
    } catch (dbError) {
      logger.warn('Database connection failed, starting server without database:', dbError.message);
      console.log('⚠️  Database connectie mislukt, server start zonder database');
      global.dbAvailable = false;
    }
    
    new GoogleSheetsService();
    
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