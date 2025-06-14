const express = require('express');
const router = express.Router();
const { Customer, CustomerLeadType, LeadType } = require('../models');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const settingsFile = path.join(__dirname, '../../settings.json');
const LeadDistributionService = require('../services/LeadDistributionService');
const leadDistributionService = new LeadDistributionService();

// List all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: CustomerLeadType,
          include: [LeadType]
        }
      ]
    });
    res.json(customers);
  } catch (error) {
    logger.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    logger.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    logger.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.destroy();
    res.json({ success: true });
  } catch (error) {
    logger.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new lead type
router.post('/leadtype', async (req, res) => {
  try {
    const { name, displayName, description, category, averageCost, conversionRate, averageValue, isActive, priority, targetKeywords, facebookFormId, googleSheetTemplate } = req.body;
    const leadType = await LeadType.create({
      name,
      displayName,
      description,
      category,
      averageCost,
      conversionRate,
      averageValue,
      isActive,
      priority,
      targetKeywords,
      facebookFormId,
      googleSheetTemplate
    });
    res.status(201).json(leadType);
  } catch (error) {
    logger.error('Error creating lead type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a customer lead type association
router.post('/:customerId/leadtype', async (req, res) => {
  try {
    const { leadTypeId, isActive, targetLeadsPerMonth, costPerLead, priority, maxDistance, qualityThreshold, budget } = req.body;
    const customerLeadType = await CustomerLeadType.create({
      customerId: req.params.customerId,
      leadTypeId,
      isActive,
      targetLeadsPerMonth,
      costPerLead,
      priority,
      maxDistance,
      qualityThreshold,
      budget
    });
    res.status(201).json(customerLeadType);
  } catch (error) {
    logger.error('Error creating customer lead type:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 