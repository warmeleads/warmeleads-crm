const express = require('express');
const router = express.Router();
const LeadDistributionService = require('../services/LeadDistributionService');
const logger = require('../utils/logger');
const { sequelize } = require('../models');

const leadDistributionService = new LeadDistributionService();

// Facebook webhook endpoint (POST)
router.post('/facebook-webhook', async (req, res) => {
  try {
    const leadData = req.body;
    logger.info('Received Facebook lead:', leadData);
    const result = await leadDistributionService.distributeLead(leadData);
    res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error('Error in Facebook webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual trigger for lead distribution (for testing)
router.post('/distribute', async (req, res) => {
  try {
    const leadData = req.body;
    const result = await leadDistributionService.distributeLead(leadData);
    res.status(200).json({ success: true, result });
  } catch (error) {
    logger.error('Error distributing lead:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Facebook webhook verificatie (GET)
router.get('/facebook-webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.FB_WEBHOOK_VERIFY_TOKEN || 'my_verify_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Haal alle leads op
router.get('/', async (req, res) => {
  try {
    logger.apiLog('GET /api/leads aangeroepen');
    
    const { Lead, LeadType } = require('../models');
    
    // Log database connectie info
    const dbConfig = sequelize.config;
    logger.apiLog('Database connectie info', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    
    // Eerst checken hoeveel leads er totaal zijn
    const totalCount = await Lead.count();
    logger.apiLog(`Totaal aantal leads in database: ${totalCount}`);
    
    // Probeer eerst met LeadType, als dat faalt dan zonder
    let leads;
    try {
      logger.apiLog('Start ophalen leads met LeadType...');
      leads = await Lead.findAll({ 
        include: [{ model: LeadType, attributes: ['name', 'displayName'] }],
        order: [['createdAt', 'DESC']]
      });
      logger.apiLog(`Aantal leads opgehaald met LeadType: ${leads.length}`);
    } catch (includeError) {
      logger.apiLog('LeadType include gefaald, probeer zonder LeadType', {
        error: includeError.message
      });
      
      // Fallback: haal leads op zonder LeadType
      leads = await Lead.findAll({ 
        order: [['createdAt', 'DESC']]
      });
      logger.apiLog(`Aantal leads opgehaald zonder LeadType: ${leads.length}`);
    }
    
    // Log eerste paar leads voor debugging
    if (leads.length > 0) {
      logger.apiLog('Eerste 3 leads:', {
        leads: leads.slice(0, 3).map(lead => ({
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          createdAt: lead.createdAt,
          leadTypeId: lead.leadTypeId,
          leadTypeName: lead.LeadType?.name,
          sheetBranche: lead.sheetBranche
        }))
      });
    } else {
      logger.apiLog('GEEN LEADS GEVONDEN in database!');
    }
    
    // Converteer naar array en stuur response
    const leadsArray = Array.isArray(leads) ? leads : [];
    logger.apiLog(`Response array lengte: ${leadsArray.length}`);
    
    res.json(leadsArray);
    logger.apiLog('Response succesvol verzonden');
    
  } catch (error) {
    logger.apiLog('Error fetching leads', {
      error: error.message,
      stack: error.stack
    });
    res.status(200).json([]);
  }
});

// Verwijder één lead
router.delete('/:id', async (req, res) => {
  try {
    const { Lead } = require('../models');
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead niet gevonden' });
    await lead.destroy();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting lead:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verwijder alle leads
router.delete('/', async (req, res) => {
  try {
    const { Lead } = require('../models');
    await Lead.destroy({ where: {} });
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting all leads:', error);
    res.status(500).json({ error: error.message });
  }
});

// Haal de 20 meest recente leads als ruwe JSON op
router.get('/raw', async (req, res) => {
  try {
    const branch = req.query.branch;
    if (!branch) return res.status(400).json({ error: 'branch query param verplicht' });
    const fs = require('fs');
    const path = require('path');
    const importLogsFile = process.env.RENDER ? '/tmp/import-logs.json' : path.join(__dirname, '../../import-logs.json');
    let logs = [];
    if (fs.existsSync(importLogsFile)) {
      logs = JSON.parse(fs.readFileSync(importLogsFile, 'utf8'));
    }
    // Zoek de meest recente relevante logregel
    const match = logs.reverse().find(log =>
      log.message === 'Ruwe sheetdata van tabblad geïmporteerd' &&
      log.data &&
      log.data.tabName &&
      log.data.tabName.toLowerCase().includes(branch.toLowerCase())
    );
    if (!match) return res.status(404).json({ error: 'Geen ruwe sheetdata gevonden voor deze branche' });
    res.json({
      header: match.data.header,
      previewRows: match.data.previewRows,
      tabName: match.data.tabName,
      timestamp: match.timestamp
    });
  } catch (error) {
    logger.error('Error in /api/leads/raw endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint voor database info
router.get('/debug', async (req, res) => {
  try {
    logger.info('[LEADS DEBUG] Debug endpoint aangeroepen');
    
    const { Lead, LeadType } = require('../models');
    const dbConfig = sequelize.config;
    
    // Database connectie info
    const dbInfo = {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      dialect: dbConfig.dialect,
      timezone: dbConfig.timezone
    };
    
    // Test database connectie
    await sequelize.authenticate();
    const connectionOk = true;
    
    // Tabel informatie
    const leadCount = await Lead.count();
    const leadTypeCount = await LeadType.count();
    
    // Laatste 5 leads
    const recentLeads = await Lead.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'leadTypeId', 'sheetBranche']
    });
    
    // Lead types
    const leadTypes = await LeadType.findAll({
      attributes: ['id', 'name', 'displayName', 'category']
    });
    
    const debugInfo = {
      database: dbInfo,
      connection: connectionOk,
      tables: {
        leads: {
          count: leadCount,
          recent: recentLeads.map(l => l.toJSON())
        },
        leadTypes: {
          count: leadTypeCount,
          types: leadTypes.map(lt => lt.toJSON())
        }
      },
      timestamp: new Date().toISOString()
    };
    
    logger.info('[LEADS DEBUG] Debug info:', debugInfo);
    res.json(debugInfo);
    
  } catch (error) {
    logger.error('[LEADS DEBUG] Error in debug endpoint:', error);
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint om alle logs op te halen
router.get('/logs', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Bepaal log bestanden locatie
    const logDir = process.env.RENDER ? '/tmp' : path.join(__dirname, '../../logs');
    const debugLogFile = path.join(logDir, 'leads-debug.log');
    const allLogsFile = path.join(logDir, 'all-logs.log');
    
    let logs = [];
    
    // Lees debug logs
    if (fs.existsSync(debugLogFile)) {
      const debugLogs = fs.readFileSync(debugLogFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return { raw: line, error: 'Invalid JSON' };
          }
        })
        .filter(log => log.type && ['LEADS_DEBUG', 'IMPORT', 'API', 'FRONTEND'].includes(log.type));
      
      logs = logs.concat(debugLogs);
    }
    
    // Lees alle logs (laatste 100 regels)
    if (fs.existsSync(allLogsFile)) {
      const allLogs = fs.readFileSync(allLogsFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .slice(-100) // Laatste 100 regels
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return { raw: line, error: 'Invalid JSON' };
          }
        });
      
      logs = logs.concat(allLogs);
    }
    
    // Sorteer op timestamp
    logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Filter op laatste 24 uur
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    logs = logs.filter(log => new Date(log.timestamp) > oneDayAgo);
    
    res.json({
      totalLogs: logs.length,
      logs: logs,
      logFiles: {
        debugLogFile: fs.existsSync(debugLogFile) ? 'exists' : 'not found',
        allLogsFile: fs.existsSync(allLogsFile) ? 'exists' : 'not found'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('[LEADS LOGS] Error reading logs:', error);
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint: Haal de laatst geïmporteerde leads als sheet-tabel (originele kolommen, gemapte waarden)
router.get('/sheet', async (req, res) => {
  try {
    const branch = req.query.branch;
    if (!branch) return res.status(400).json({ error: 'branch query param verplicht' });
    const fs = require('fs');
    const path = require('path');
    const importLogsFile = process.env.RENDER ? '/tmp/import-logs.json' : path.join(__dirname, '../../import-logs.json');
    let logs = [];
    if (fs.existsSync(importLogsFile)) {
      logs = JSON.parse(fs.readFileSync(importLogsFile, 'utf8'));
    }
    // Zoek de meest recente relevante logregel
    const match = logs.reverse().find(log =>
      log.message === 'Ruwe sheetdata van tabblad geïmporteerd' &&
      log.data &&
      log.data.tabName &&
      log.data.tabName.toLowerCase().includes(branch.toLowerCase())
    );
    if (!match) return res.status(404).json({ error: 'Geen ruwe sheetdata gevonden voor deze branche' });
    const header = match.data.header;
    const previewRows = match.data.previewRows;
    // Maak per rij een object { kolomnaam: waarde }
    const leads = previewRows.map(rowArr => {
      const obj = {};
      header.forEach((col, i) => { obj[col] = rowArr[i]; });
      return obj;
    });
    res.json({
      header,
      leads,
      tabName: match.data.tabName,
      timestamp: match.timestamp
    });
  } catch (error) {
    logger.error('Error in /api/leads/sheet endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 