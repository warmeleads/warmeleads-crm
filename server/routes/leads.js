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
    logger.info('[LEADS API] GET /api/leads aangeroepen');
    
    const { Lead, LeadType } = require('../models');
    
    // Log database connectie info
    const dbConfig = sequelize.config;
    logger.info(`[LEADS API] Database connectie: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Eerst checken hoeveel leads er totaal zijn
    const totalCount = await Lead.count();
    logger.info(`[LEADS API] Totaal aantal leads in database: ${totalCount}`);
    
    // Haal alle leads op met LeadType info
    logger.info('[LEADS API] Start ophalen leads met LeadType...');
    const leads = await Lead.findAll({ 
      include: [{ model: LeadType, attributes: ['name', 'displayName'] }],
      order: [['createdAt', 'DESC']]
    });
    
    logger.info(`[LEADS API] Aantal leads opgehaald: ${leads.length}`);
    
    // Log eerste paar leads voor debugging
    if (leads.length > 0) {
      logger.info('[LEADS API] Eerste 3 leads:');
      leads.slice(0, 3).forEach((lead, index) => {
        logger.info(`[LEADS API] Lead ${index + 1}:`, {
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          createdAt: lead.createdAt,
          leadTypeId: lead.leadTypeId,
          leadTypeName: lead.LeadType?.name,
          sheetBranche: lead.sheetBranche
        });
      });
    } else {
      logger.warn('[LEADS API] GEEN LEADS GEVONDEN in database!');
    }
    
    // Converteer naar array en stuur response
    const leadsArray = Array.isArray(leads) ? leads : [];
    logger.info(`[LEADS API] Response array lengte: ${leadsArray.length}`);
    
    res.json(leadsArray);
    logger.info('[LEADS API] Response succesvol verzonden');
    
  } catch (error) {
    logger.error('[LEADS API] Error fetching leads:', error);
    logger.error('[LEADS API] Error stack:', error.stack);
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
    const { Lead } = require('../models');
    const leads = await Lead.findAll({ order: [['createdAt', 'DESC']], limit: 20 });
    res.json(leads.map(l => l.toJSON()));
  } catch (error) {
    logger.error('Error fetching raw leads:', error);
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

module.exports = router; 