const winston = require('winston');
const path = require('path');

// Bepaal log bestanden locatie
const logDir = process.env.RENDER ? '/tmp' : path.join(__dirname, '../../logs');
const debugLogFile = path.join(logDir, 'leads-debug.log');
const allLogsFile = path.join(logDir, 'all-logs.log');

// Maak logs directory als deze niet bestaat
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Winston logger configuratie
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'leads-system' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Alle logs naar één bestand
    new winston.transports.File({ 
      filename: allLogsFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Specifieke debug logs voor leads
    new winston.transports.File({ 
      filename: debugLogFile,
      level: 'debug',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ]
});

// Helper functie voor leads-specifieke logging
logger.leadsDebug = (message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'LEADS_DEBUG',
    message,
    data,
    service: 'leads-system'
  };
  
  // Log naar alle transports
  logger.info(logEntry);
  
  // Schrijf ook naar een apart debug bestand voor leads
  fs.appendFileSync(debugLogFile, JSON.stringify(logEntry) + '\n');
};

// Helper functie voor import logging
logger.importLog = (message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'IMPORT',
    message,
    data,
    service: 'leads-system'
  };
  
  logger.info(logEntry);
  fs.appendFileSync(debugLogFile, JSON.stringify(logEntry) + '\n');
};

// Helper functie voor API logging
logger.apiLog = (message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'API',
    message,
    data,
    service: 'leads-system'
  };
  
  logger.info(logEntry);
  fs.appendFileSync(debugLogFile, JSON.stringify(logEntry) + '\n');
};

// Helper functie voor frontend logging
logger.frontendLog = (message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'FRONTEND',
    message,
    data,
    service: 'leads-system'
  };
  
  logger.info(logEntry);
  fs.appendFileSync(debugLogFile, JSON.stringify(logEntry) + '\n');
};

module.exports = logger; 