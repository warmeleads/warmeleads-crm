const express = require('express');
const router = express.Router();
const branchColumnService = require('../services/BranchColumnService');
const logger = require('../utils/logger');

// Haal alle branches op met hun kolommen
router.get('/', async (req, res) => {
  try {
    const branches = await branchColumnService.getAllBranches();
    res.json({ success: true, branches });
  } catch (error) {
    logger.error('Fout bij ophalen branches', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Haal kolommen op voor een specifieke branche
router.get('/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const columns = await branchColumnService.getColumnsForBranch(branch);
    
    if (!columns) {
      return res.status(404).json({ success: false, error: 'Branche niet gevonden' });
    }
    
    res.json({ success: true, branch, columns });
  } catch (error) {
    logger.error('Fout bij ophalen kolommen voor branche', { branch: req.params.branch, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sla kolommen op voor een branche
router.post('/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const { columns } = req.body;
    
    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({ success: false, error: 'Kolommen array is verplicht' });
    }
    
    const result = await branchColumnService.saveColumnsForBranch(branch, columns);
    res.json({ success: true, branch, columns: result.columns });
  } catch (error) {
    logger.error('Fout bij opslaan kolommen voor branche', { branch: req.params.branch, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verwijder een branche
router.delete('/:branch', async (req, res) => {
  try {
    const { branch } = req.params;
    const deleted = await branchColumnService.deleteBranch(branch);
    
    if (deleted) {
      res.json({ success: true, message: `Branche '${branch}' verwijderd` });
    } else {
      res.status(404).json({ success: false, error: 'Branche niet gevonden' });
    }
  } catch (error) {
    logger.error('Fout bij verwijderen branche', { branch: req.params.branch, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 