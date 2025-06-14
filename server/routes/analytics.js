const express = require('express');
const router = express.Router();
const LeadDistributionService = require('../services/LeadDistributionService');
const logger = require('../utils/logger');

const leadDistributionService = new LeadDistributionService();

// Get distribution analytics
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const analytics = await leadDistributionService.getDistributionAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 