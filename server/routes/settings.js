const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const LeadDistributionService = require('../services/LeadDistributionService');
const logger = require('../utils/logger');

const settingsFile = path.join(__dirname, '../../settings.json');
const importLogsFile = process.env.RENDER ? '/tmp/import-logs.json' : path.join(__dirname, '../../import-logs.json');
const leadDistributionService = new LeadDistributionService();

// GET huidige sheet URL/ID
router.get('/sheet', (req, res) => {
  let sheetUrl = '';
  if (fs.existsSync(settingsFile)) {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    sheetUrl = settings.sheetUrl || '';
  }
  res.json({ sheetUrl });
});

// GET: Haal alle tabbladen en kolomtitels op uit de ingestelde Google Sheet
router.get('/sheet-columns', async (req, res) => {
  try {
    let sheetUrl = '';
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      sheetUrl = settings.sheetUrl || '';
    }
    if (!sheetUrl) return res.status(400).json({ error: 'Geen sheetUrl ingesteld' });
    let sheetId = sheetUrl;
    if (sheetId.includes('/')) {
      const match = sheetId.match(/\/d\/([\w-]+)/);
      if (match) sheetId = match[1];
    }
    const allSheetNames = await leadDistributionService.googleSheetsService.getAllSheetNames(sheetId);
    const sheetTabs = [];
    for (const tabName of allSheetNames) {
      const rows = await leadDistributionService.googleSheetsService.getAllRows(sheetId, tabName);
      const columns = rows && rows.length > 0 ? rows[0] : [];
      sheetTabs.push({ name: tabName, columns });
    }
    res.json({ sheetTabs });
  } catch (error) {
    logger.error('Error fetching sheet columns:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST nieuwe sheet URL/ID
router.post('/sheet', (req, res) => {
  const { sheetUrl } = req.body;
  let settings = {};
  if (fs.existsSync(settingsFile)) {
    settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  }
  settings.sheetUrl = sheetUrl;
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  res.json({ success: true });
});

// GET: Haal de laatste 100 importlogs op
router.get('/import-logs', (req, res) => {
  logger.info(`[LOGS] /import-logs endpoint aangeroepen. Pad: ${importLogsFile}`);
  let logs = [];
  if (!fs.existsSync(importLogsFile)) {
    logger.warn(`[LOGS] Logbestand bestaat niet: ${importLogsFile}`);
    fs.writeFileSync(importLogsFile, '[]');
  }
  if (fs.existsSync(importLogsFile)) {
    logs = JSON.parse(fs.readFileSync(importLogsFile, 'utf8'));
  }
  if (logs.length === 0) {
    logger.info(`[LOGS] Geen logs gevonden in ${importLogsFile}`);
  }
  res.json({ logs: logs.slice(-100).reverse() });
});

// POST: Importeer nieuwe leads uit Google Sheet
router.post('/import-sheet-leads', async (req, res) => {
  try {
    const { sheetId, tabNames, branch, mapping } = req.body;
    const result = await leadDistributionService.importLeadsFromSelectedTabs({ sheetId, tabNames, branch, mapping });
    // Log importresultaat naar bestand
    let logs = [];
    if (!fs.existsSync(importLogsFile)) {
      fs.writeFileSync(importLogsFile, '[]');
    }
    if (fs.existsSync(importLogsFile)) {
      logs = JSON.parse(fs.readFileSync(importLogsFile, 'utf8'));
    }
    logs.push({ timestamp: new Date().toISOString(), ...result });
    fs.writeFileSync(importLogsFile, JSON.stringify(logs.slice(-1000), null, 2));
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('Error importing leads from sheet:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 