const express = require('express');
const router = express.Router();
const LeadDistributionService = require('../services/LeadDistributionService');
const logger = require('../utils/logger');

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

module.exports = router; 