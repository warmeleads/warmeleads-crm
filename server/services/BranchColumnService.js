const { BranchColumn } = require('../models');
const logger = require('../utils/logger');

class BranchColumnService {
  /**
   * Haal kolommen op voor een specifieke branche
   */
  async getColumnsForBranch(branch) {
    try {
      const branchColumn = await BranchColumn.findOne({
        where: { branch }
      });
      
      if (!branchColumn) {
        return null;
      }
      
      return branchColumn.columns;
    } catch (error) {
      logger.error('Fout bij ophalen kolommen voor branche', { branch, error: error.message });
      throw error;
    }
  }

  /**
   * Sla kolommen op voor een branche
   */
  async saveColumnsForBranch(branch, columns) {
    try {
      const [branchColumn, created] = await BranchColumn.findOrCreate({
        where: { branch },
        defaults: { columns }
      });

      if (!created) {
        branchColumn.columns = columns;
        await branchColumn.save();
      }

      logger.info('Kolommen opgeslagen voor branche', { branch, columnsCount: columns.length });
      return branchColumn;
    } catch (error) {
      logger.error('Fout bij opslaan kolommen voor branche', { branch, error: error.message });
      throw error;
    }
  }

  /**
   * Haal alle branches op met hun kolommen
   */
  async getAllBranches() {
    try {
      const branches = await BranchColumn.findAll({
        order: [['branch', 'ASC']]
      });
      
      return branches.map(branch => ({
        id: branch.id,
        branch: branch.branch,
        columns: branch.columns,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt
      }));
    } catch (error) {
      logger.error('Fout bij ophalen alle branches', { error: error.message });
      throw error;
    }
  }

  /**
   * Verwijder een branche en zijn kolommen
   */
  async deleteBranch(branch) {
    try {
      const deleted = await BranchColumn.destroy({
        where: { branch }
      });
      
      if (deleted > 0) {
        logger.info('Branche verwijderd', { branch });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Fout bij verwijderen branche', { branch, error: error.message });
      throw error;
    }
  }

  /**
   * Check of kolommen bestaan voor een branche, maak aan als ze niet bestaan
   */
  async ensureColumnsExist(branch, defaultColumns = []) {
    try {
      let branchColumn = await BranchColumn.findOne({
        where: { branch }
      });

      if (!branchColumn) {
        // Maak standaard kolommen aan
        branchColumn = await BranchColumn.create({
          branch,
          columns: defaultColumns
        });
        
        logger.info('Standaard kolommen aangemaakt voor branche', { branch, columnsCount: defaultColumns.length });
      }

      return branchColumn.columns;
    } catch (error) {
      logger.error('Fout bij controleren/aanmaken kolommen voor branche', { branch, error: error.message });
      throw error;
    }
  }
}

module.exports = new BranchColumnService(); 