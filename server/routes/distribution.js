const express = require('express');
const router = express.Router();
const { Lead } = require('../models');
const LeadDistributionService = require('../services/LeadDistributionService');
const logger = require('../utils/logger');

const leadDistributionService = new LeadDistributionService();

// Manually trigger distribution for a lead by ID
router.post('/:leadId', async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    const result = await leadDistributionService.distributeLead(lead.rawData);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Error distributing lead:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 