const { 
  Customer, 
  Lead, 
  LeadDistribution, 
  LeadType, 
  CustomerLeadType, 
  DistributionRule,
  sequelize 
} = require('../models');
const logger = require('../utils/logger');
const GoogleSheetsService = require('./GoogleSheetsService');
const fs = require('fs');
const path = require('path');
const leadMappings = require('../lead-mapping');
const { v4: uuidv4 } = require('uuid');

class LeadDistributionService {
  constructor() {
    this.googleSheetsService = new GoogleSheetsService();
  }

  /**
   * Main method to distribute a lead to the best matching customers
   * @param {Object} leadData - Lead data from Facebook
   * @returns {Array} Array of distribution results
   */
  async distributeLead(leadData) {
    const transaction = await sequelize.transaction();
    
    try {
      logger.info(`Starting distribution for lead: ${leadData.facebookLeadId}`);
      
      // 1. Create or find the lead
      const lead = await this.createOrFindLead(leadData, transaction);
      
      // 2. Find eligible customers for this lead type
      const eligibleCustomers = await this.findEligibleCustomers(lead.leadTypeId, transaction);
      
      if (eligibleCustomers.length === 0) {
        logger.warn(`No eligible customers found for lead type: ${lead.leadTypeId}`);
        await transaction.rollback();
        return [];
      }
      
      // 3. Score and rank customers
      const scoredCustomers = await this.scoreCustomers(lead, eligibleCustomers);
      
      // 4. Select customers for distribution
      const selectedCustomers = this.selectCustomersForDistribution(scoredCustomers);
      
      // 5. Distribute lead to selected customers
      const distributionResults = await this.executeDistributions(lead, selectedCustomers, transaction);
      
      // 6. Update lead status
      await this.updateLeadStatus(lead, distributionResults, transaction);
      
      await transaction.commit();
      
      logger.info(`Successfully distributed lead to ${distributionResults.length} customers`);
      return distributionResults;
      
    } catch (error) {
      await transaction.rollback();
      logger.error('Error distributing lead:', error);
      throw error;
    }
  }

  /**
   * Create or find a lead in the database
   */
  async createOrFindLead(leadData, transaction) {
    const existingLead = await Lead.findOne({
      where: { facebookLeadId: leadData.facebookLeadId },
      transaction
    });

    if (existingLead) {
      logger.info(`Lead already exists: ${leadData.facebookLeadId}`);
      return existingLead;
    }

    // Determine lead type based on Facebook form or other criteria
    const leadType = await this.determineLeadType(leadData);
    
    const lead = await Lead.create({
      leadTypeId: leadType.id,
      facebookLeadId: leadData.facebookLeadId,
      facebookAdId: leadData.facebookAdId,
      facebookCampaignId: leadData.facebookCampaignId,
      firstName: leadData.firstName,
      lastName: leadData.lastName,
      email: leadData.email,
      phone: leadData.phone,
      address: leadData.address,
      city: leadData.city,
      postalCode: leadData.postalCode,
      country: leadData.country,
      latitude: leadData.latitude,
      longitude: leadData.longitude,
      propertyType: leadData.propertyType,
      propertyAge: leadData.propertyAge,
      propertySize: leadData.propertySize,
      energyLabel: leadData.energyLabel,
      currentHeatingSystem: leadData.currentHeatingSystem,
      interestIn: leadData.interestIn,
      budget: leadData.budget,
      timeline: leadData.timeline,
      additionalInfo: leadData.additionalInfo,
      leadQuality: this.assessLeadQuality(leadData),
      cost: leadData.cost || 0,
      rawData: leadData
    }, { transaction });

    logger.info(`Created new lead: ${lead.id}`);
    return lead;
  }

  /**
   * Determine lead type based on various criteria
   */
  async determineLeadType(leadData) {
    // This could be based on Facebook form ID, keywords, or other criteria
    const leadTypes = await LeadType.findAll({ where: { isActive: true } });
    
    // Simple logic - can be enhanced with ML/AI
    if (leadData.facebookFormId) {
      const formBasedType = leadTypes.find(lt => lt.facebookFormId === leadData.facebookFormId);
      if (formBasedType) return formBasedType;
    }
    
    // Fallback to keyword matching
    const keywords = leadData.interestIn || [];
    for (const leadType of leadTypes) {
      if (leadType.targetKeywords && leadType.targetKeywords.some(keyword => 
        keywords.includes(keyword) || 
        leadData.additionalInfo?.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return leadType;
      }
    }
    
    // Default to first active lead type
    return leadTypes[0];
  }

  /**
   * Assess lead quality based on various factors
   */
  assessLeadQuality(leadData) {
    let score = 0;
    
    // Email quality
    if (leadData.email && leadData.email.includes('@')) score += 1;
    
    // Phone quality
    if (leadData.phone && leadData.phone.length >= 10) score += 1;
    
    // Address quality
    if (leadData.address && leadData.postalCode) score += 1;
    
    // Property information
    if (leadData.propertyType && leadData.propertySize) score += 1;
    
    // Budget information
    if (leadData.budget && leadData.budget !== 'unknown') score += 1;
    
    // Timeline information
    if (leadData.timeline && leadData.timeline !== 'unknown') score += 1;
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Find customers eligible for this lead type
   */
  async findEligibleCustomers(leadTypeId, transaction) {
    const customers = await Customer.findAll({
      include: [
        {
          model: LeadType,
          where: { id: leadTypeId },
          through: {
            where: { isActive: true }
          },
          required: true
        }
      ],
      where: {
        isActive: true
      },
      transaction
    });

    // Get CustomerLeadType data for each customer
    const customersWithLeadTypeData = [];
    for (const customer of customers) {
      const customerLeadType = await CustomerLeadType.findOne({
        where: {
          customerId: customer.id,
          leadTypeId: leadTypeId
        },
        transaction
      });
      
      if (customerLeadType && customer.canReceiveLeads() && customerLeadType.canReceiveLeads()) {
        // Add CustomerLeadType to customer object for compatibility
        customer.CustomerLeadTypes = [customerLeadType];
        customersWithLeadTypeData.push(customer);
      }
    }

    return customersWithLeadTypeData;
  }

  /**
   * Score customers based on various factors
   */
  async scoreCustomers(lead, customers) {
    const scoredCustomers = [];

    for (const customer of customers) {
      const customerLeadType = customer.CustomerLeadTypes.find(clt => clt.leadTypeId === lead.leadTypeId);
      
      let totalScore = 0;
      const scoreBreakdown = {};

      // 1. Distance score (0-1)
      const distance = lead.calculateDistance(customer.latitude, customer.longitude);
      const maxDistance = customerLeadType.maxDistance || customer.serviceRadius;
      
      if (distance <= maxDistance) {
        const distanceScore = Math.max(0, 1 - (distance / maxDistance));
        scoreBreakdown.distance = distanceScore;
        totalScore += distanceScore * 0.3; // 30% weight
      }

      // 2. Budget utilization score (0-1)
      const budgetUtilization = customer.getBudgetUtilization();
      const budgetScore = Math.max(0, 1 - (budgetUtilization / 100));
      scoreBreakdown.budget = budgetScore;
      totalScore += budgetScore * 0.2; // 20% weight

      // 3. Lead count utilization score (0-1)
      const leadUtilization = customer.getLeadUtilization();
      const leadScore = Math.max(0, 1 - (leadUtilization / 100));
      scoreBreakdown.leadCount = leadScore;
      totalScore += leadScore * 0.2; // 20% weight

      // 4. Customer priority score (0-1)
      const priorityScore = Math.max(0, 1 - ((customer.priority - 1) / 9));
      scoreBreakdown.priority = priorityScore;
      totalScore += priorityScore * 0.15; // 15% weight

      // 5. Lead type priority score (0-1)
      const leadTypePriorityScore = Math.max(0, 1 - ((customerLeadType.priority - 1) / 9));
      scoreBreakdown.leadTypePriority = leadTypePriorityScore;
      totalScore += leadTypePriorityScore * 0.1; // 10% weight

      // 6. Quality match score (0-1)
      const qualityScores = { high: 1, medium: 0.6, low: 0.3 };
      const qualityScore = qualityScores[lead.leadQuality] || 0.5;
      scoreBreakdown.quality = qualityScore;
      totalScore += qualityScore * 0.05; // 5% weight

      // 7. Custom distribution rules
      const customRulesScore = await this.evaluateCustomRules(lead, customer);
      scoreBreakdown.customRules = customRulesScore;
      totalScore += customRulesScore;

      scoredCustomers.push({
        customer,
        customerLeadType,
        totalScore,
        scoreBreakdown,
        distance
      });
    }

    // Sort by total score (highest first)
    return scoredCustomers.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Evaluate custom distribution rules
   */
  async evaluateCustomRules(lead, customer) {
    const rules = await DistributionRule.findAll({
      where: {
        customerId: customer.id,
        isActive: true
      }
    });

    let totalScore = 0;
    
    for (const rule of rules) {
      if (rule.isValid() && 
          rule.appliesToLeadType(lead.leadTypeId) && 
          rule.appliesToRegion(lead.country)) {
        const ruleScore = rule.evaluate(lead, customer);
        totalScore += ruleScore;
      }
    }

    return Math.min(1, totalScore); // Cap at 1
  }

  /**
   * Select customers for distribution based on scores
   */
  selectCustomersForDistribution(scoredCustomers) {
    const selectedCustomers = [];
    
    // Always select the top scorer
    if (scoredCustomers.length > 0) {
      selectedCustomers.push(scoredCustomers[0]);
    }
    
    // Select additional customers if they have high scores
    for (let i = 1; i < scoredCustomers.length; i++) {
      const customer = scoredCustomers[i];
      
      // Select if score is above threshold and within reasonable distance
      if (customer.totalScore > 0.7 && customer.distance <= 100) {
        selectedCustomers.push(customer);
      }
      
      // Limit to maximum 3 customers per lead
      if (selectedCustomers.length >= 3) break;
    }
    
    return selectedCustomers;
  }

  /**
   * Execute the actual distributions
   */
  async executeDistributions(lead, selectedCustomers, transaction) {
    const results = [];
    
    for (const { customer, customerLeadType, totalScore, scoreBreakdown, distance } of selectedCustomers) {
      try {
        // Create distribution record
        const distribution = await LeadDistribution.create({
          leadId: lead.id,
          customerId: customer.id,
          distributionScore: totalScore,
          distributionReason: this.generateDistributionReason(scoreBreakdown),
          distance,
          cost: customerLeadType.costPerLead,
          status: 'pending'
        }, { transaction });

        // Update customer budget and lead count
        await this.updateCustomerMetrics(customer, customerLeadType, customerLeadType.costPerLead, transaction);
        
        // Send to Google Sheets
        await this.sendToGoogleSheets(lead, customer, distribution);
        
        results.push({
          distribution,
          customer,
          success: true
        });
        
        logger.info(`Distributed lead ${lead.id} to customer ${customer.id} with score ${totalScore}`);
        
      } catch (error) {
        logger.error(`Failed to distribute lead to customer ${customer.id}:`, error);
        results.push({
          customer,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Generate human-readable distribution reason
   */
  generateDistributionReason(scoreBreakdown) {
    const reasons = [];
    
    if (scoreBreakdown.distance > 0.8) reasons.push('Excellent location match');
    if (scoreBreakdown.budget > 0.8) reasons.push('High budget availability');
    if (scoreBreakdown.leadCount > 0.8) reasons.push('Low lead utilization');
    if (scoreBreakdown.priority > 0.8) reasons.push('High customer priority');
    if (scoreBreakdown.customRules > 0.5) reasons.push('Matches custom rules');
    
    return reasons.length > 0 ? reasons.join(', ') : 'Good overall match';
  }

  /**
   * Update customer metrics after distribution
   */
  async updateCustomerMetrics(customer, customerLeadType, cost, transaction) {
    // Update customer budget - convert to numbers to avoid string concatenation
    customer.budgetUsed = parseFloat(customer.budgetUsed) + parseFloat(cost);
    customer.currentMonthLeads += 1;
    await customer.save({ transaction });
    
    // Update customer lead type metrics
    customerLeadType.budgetUsed = parseFloat(customerLeadType.budgetUsed) + parseFloat(cost);
    customerLeadType.currentMonthLeads += 1;
    await customerLeadType.save({ transaction });
  }

  /**
   * Send lead to customer's Google Sheet
   */
  async sendToGoogleSheets(lead, customer, distribution) {
    try {
      const rowData = this.formatLeadForGoogleSheets(lead);
      const rowId = await this.googleSheetsService.appendRow(
        customer.googleSheetId,
        customer.googleSheetName,
        rowData
      );
      
      distribution.googleSheetRowId = rowId;
      distribution.status = 'delivered';
      distribution.sentToGoogleSheet = true;
      distribution.deliveredAt = new Date();
      await distribution.save();
      
      logger.info(`Sent lead to Google Sheets for customer ${customer.id}`);
      
    } catch (error) {
      logger.error(`Failed to send to Google Sheets for customer ${customer.id}:`, error);
      distribution.status = 'failed';
      distribution.errorMessage = error.message;
      await distribution.save();
    }
  }

  /**
   * Format lead data for Google Sheets
   */
  formatLeadForGoogleSheets(lead) {
    return [
      new Date().toISOString(),
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone,
      lead.address,
      lead.city,
      lead.postalCode,
      lead.country,
      lead.propertyType,
      lead.propertySize,
      lead.energyLabel,
      lead.budget,
      lead.timeline,
      lead.additionalInfo,
      lead.leadQuality,
      lead.facebookLeadId
    ];
  }

  /**
   * Update lead status after distribution
   */
  async updateLeadStatus(lead, distributionResults, transaction) {
    const successfulDistributions = distributionResults.filter(r => r.success);
    
    if (successfulDistributions.length > 0) {
      lead.status = 'distributed';
      lead.distributionCount = successfulDistributions.length;
      lead.lastDistributedAt = new Date();
      await lead.save({ transaction });
    }
  }

  /**
   * Get distribution analytics
   */
  async getDistributionAnalytics(filters = {}) {
    const whereClause = {};
    
    if (filters.startDate) whereClause.createdAt = { [sequelize.Op.gte]: filters.startDate };
    if (filters.endDate) whereClause.createdAt = { ...whereClause.createdAt, [sequelize.Op.lte]: filters.endDate };
    
    const distributions = await LeadDistribution.findAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['companyName', 'city', 'country'] },
        { model: Lead, attributes: ['leadTypeId', 'leadQuality', 'cost'] }
      ]
    });
    
    return this.calculateAnalytics(distributions);
  }

  /**
   * Calculate analytics from distribution data
   */
  calculateAnalytics(distributions) {
    const analytics = {
      totalDistributions: distributions.length,
      totalCost: 0,
      averageScore: 0,
      byCustomer: {},
      byLeadType: {},
      byQuality: { high: 0, medium: 0, low: 0 }
    };
    
    distributions.forEach(dist => {
      analytics.totalCost += parseFloat(dist.cost);
      analytics.averageScore += parseFloat(dist.distributionScore);
      
      // By customer
      const customerName = dist.Customer.companyName;
      if (!analytics.byCustomer[customerName]) {
        analytics.byCustomer[customerName] = { count: 0, cost: 0 };
      }
      analytics.byCustomer[customerName].count++;
      analytics.byCustomer[customerName].cost += parseFloat(dist.cost);
      
      // By quality
      analytics.byQuality[dist.Lead.leadQuality]++;
    });
    
    analytics.averageScore = analytics.averageScore / distributions.length;
    
    return analytics;
  }

  /**
   * Importeer nieuwe leads uit alle relevante tabbladen van de ingestelde Google Sheet
   * (categorisatie op klant, branche, locatie; validatie en deduplicatie)
   */
  async importNewLeadsFromSheet() {
    // Log database info bij import
    const dbConfig = require('../models').sequelize.config;
    logger.importLog('Database info bij import', {
      host: dbConfig.host,
      database: dbConfig.database
    });

    // Haal sheetUrl uit settings.json
    const settingsFile = path.join(__dirname, '../../settings.json');
    if (!fs.existsSync(settingsFile)) {
      throw new Error('settings.json niet gevonden');
    }
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    if (!settings.sheetUrl) {
      throw new Error('Geen sheetUrl ingesteld in settings.json');
    }
    // sheetUrl kan een volledige URL of alleen een ID zijn
    let sheetId = settings.sheetUrl;
    if (sheetId.includes('/')) {
      // Probeer ID uit URL te halen
      const match = sheetId.match(/\/d\/([\w-]+)/);
      if (match) sheetId = match[1];
    }
    // Haal alle tabbladnamen op
    const allSheetNames = await this.googleSheetsService.getAllSheetNames(sheetId);
    // Definieer relevante branches
    const relevanteBranches = ['Thuisbatterij', 'Airco', 'GZ Accu', 'Accu', 'Zonnepanelen', 'Warmtepomp'];
    // Filter tabbladen op relevante branches
    const relevanteTabs = allSheetNames.filter(name => relevanteBranches.some(br => name.toLowerCase().includes(br.toLowerCase())));
    let totaalGeimporteerd = 0;
    let totaalDuplicaten = 0;
    let importDetails = [];
    for (const tabName of relevanteTabs) {
      // Metadata uit tabbladnaam
      const [sheetCustomerName, sheetBranche, sheetLocation] = tabName.split(',').map(s => s.trim());
      // Haal alle rijen op uit dit tabblad
      const rows = await this.googleSheetsService.getAllRows(sheetId, tabName);
      if (!rows || rows.length < 2) continue;
      const header = rows[0];
      const dataRows = rows.slice(1);
      for (const row of dataRows) {
        // Uniek ID: e-mail + telefoon + evt. datum
        const emailIdx = header.findIndex(h => h.toLowerCase().includes('email'));
        const phoneIdx = header.findIndex(h => h.toLowerCase().includes('phone'));
        const dateIdx = header.findIndex(h => h.toLowerCase().includes('date'));
        let facebookLeadId = (row[dateIdx] || '') + (row[emailIdx] || '') + (row[phoneIdx] || '');
        if (!facebookLeadId) {
          facebookLeadId = uuidv4();
          logger.warn(`Lege facebookLeadId bij import, random UUID gebruikt: ${facebookLeadId} (tab: ${tabName})`);
        }
        // Check of deze lead al bestaat
        const existing = await Lead.findOne({ where: { facebookLeadId } });
        if (existing) {
          totaalDuplicaten++;
          importDetails.push({ status: 'duplicate', facebookLeadId, tabName });
          continue;
        }
        // Maak leadData object
        const leadData = {};
        header.forEach((col, i) => { leadData[col] = row[i]; });
        leadData.facebookLeadId = facebookLeadId;
        leadData.sheetTabName = tabName;
        leadData.sheetCustomerName = sheetCustomerName;
        leadData.sheetBranche = sheetBranche;
        leadData.sheetLocation = sheetLocation;
        // Validatie: telefoonnummer NL/BE
        leadData.phoneValid = /^((\+31|0)[1-9][0-9]{8})$|^(\+32|0)[1-9][0-9]{7,8}$/.test(leadData.phone || '');
        // Validatie: e-mail
        leadData.emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadData.email || '');
        // Voeg leadTypeId toe aan leadData
        const leadType = await this.determineLeadType(leadData);
        leadData.leadTypeId = leadType.id;
        // Verdeel lead
        await this.distributeLead(leadData);
        totaalGeimporteerd++;
        importDetails.push({ status: 'imported', facebookLeadId, tabName });
      }
    }
    logger.info(`Importresultaat: ${totaalGeimporteerd} leads aangemaakt, ${totaalDuplicaten} duplicaten, details:`, importDetails);
    return { imported: totaalGeimporteerd, duplicates: totaalDuplicaten, details: importDetails };
  }

  /**
   * Importeer leads uit geselecteerde tabbladen en optioneel filter op branche
   * @param {Object} opts - { sheetId, tabNames, branch, mapping }
   */
  async importLeadsFromSelectedTabs({ sheetId, tabNames, branch, mapping }) {
    // Log database info bij import
    const dbConfig = require('../models').sequelize.config;
    logger.importLog('Database info bij import', {
      host: dbConfig.host,
      database: dbConfig.database
    });

    if (!sheetId || !tabNames || !Array.isArray(tabNames) || tabNames.length === 0) {
      throw new Error('sheetId en tabNames zijn verplicht');
    }
    let totaalGeimporteerd = 0;
    let totaalDuplicaten = 0;
    let importDetails = [];
    for (const tabName of tabNames) {
      // Metadata uit tabbladnaam
      const [sheetCustomerName, sheetBranche, sheetLocation] = tabName.split(',').map(s => s.trim());
      if (branch && (!sheetBranche || sheetBranche.toLowerCase() !== branch.toLowerCase())) {
        continue; // Sla tabbladen over die niet bij de gekozen branche horen
      }
      // Haal alle rijen op uit dit tabblad
      const rows = await this.googleSheetsService.getAllRows(sheetId, tabName);
      if (!rows || rows.length < 2) continue;
      const header = rows[0];
      const dataRows = rows.slice(1);
      // Log de ruwe sheetdata van dit tabblad (max 10 rijen voor log)
      logger.importLog('Ruwe sheetdata van tabblad geïmporteerd', {
        tabName,
        header,
        previewRows: dataRows.slice(0, 10)
      });
      for (const rowArr of dataRows) {
        // Maak een row-object van header/rowArr
        const row = {};
        header.forEach((col, i) => { row[col] = rowArr[i]; });
        // Uniek ID: e-mail + telefoon + evt. datum
        const emailIdx = header.findIndex(h => h.toLowerCase().includes('email'));
        const phoneIdx = header.findIndex(h => h.toLowerCase().includes('phone'));
        const dateIdx = header.findIndex(h => h.toLowerCase().includes('date'));
        let facebookLeadId = (rowArr[dateIdx] || '') + (rowArr[emailIdx] || '') + (rowArr[phoneIdx] || '');
        if (!facebookLeadId) {
          facebookLeadId = uuidv4();
          logger.warn(`Lege facebookLeadId bij import, random UUID gebruikt: ${facebookLeadId} (tab: ${tabName})`);
        }
        // Check of deze lead al bestaat
        const existing = await Lead.findOne({ where: { facebookLeadId } });
        if (existing) {
          totaalDuplicaten++;
          importDetails.push({ status: 'duplicate', facebookLeadId, tabName });
          continue;
        }
        // Mapping per tabblad: gebruik mapping uit argument als aanwezig, anders standaard mapping
        let leadData = {};
        if (mapping && mapping[tabName]) {
          // mapping[tabName] is een object: { sheetKolom: { enabled, mappedTo } }
          Object.entries(mapping[tabName]).forEach(([sheetCol, mapObj]) => {
            if (mapObj.enabled && mapObj.mappedTo) {
              leadData[mapObj.mappedTo] = row[sheetCol];
            }
          });
        } else {
          // Mapping per branche (fallback)
          const brancheMapping = leadMappings[sheetBranche] || {};
          Object.keys(brancheMapping).forEach(field => {
            leadData[field] = brancheMapping[field](row);
          });
        }
        // Mapping & defaults voor verplichte velden
        leadData.facebookLeadId = facebookLeadId;
        leadData.facebookAdId = row['Facebook Ad ID'] || 'unknown';
        leadData.facebookCampaignId = row['Facebook Campaign ID'] || 'unknown';
        leadData.sheetTabName = tabName;
        leadData.sheetCustomerName = sheetCustomerName;
        leadData.sheetBranche = sheetBranche;
        leadData.sheetLocation = sheetLocation;
        // Extra validatie: sheetBranche leeg of onbekend
        const brancheNorm = (sheetBranche || '').toLowerCase();
        if (!brancheNorm || (!brancheNorm.includes('thuisbatterij') && !brancheNorm.includes('airco') && !brancheNorm.includes('gz accu'))) {
          logger.warn(`Onbekende of lege branche in tabbladnaam: ${tabName}`);
          leadData.importWarning = `Onbekende of lege branche in tabbladnaam: ${tabName}`;
        }
        // Verplichte velden fallback
        if (!leadData.country) leadData.country = 'Netherlands';
        if (!leadData.latitude) leadData.latitude = 0;
        if (!leadData.longitude) leadData.longitude = 0;
        if (!leadData.firstName) leadData.firstName = 'Onbekend';
        if (!leadData.lastName) leadData.lastName = 'Onbekend';
        if (!leadData.city) leadData.city = 'Onbekend';
        // Validatie: telefoonnummer NL/BE
        leadData.phoneValid = /^((\+31|0)[1-9][0-9]{8})$|^(\+32|0)[1-9][0-9]{7,8}$/.test(leadData.phone || '');
        // Validatie: e-mail
        leadData.emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leadData.email || '');
        // Voeg leadTypeId toe aan leadData
        const leadType = await this.determineLeadType(leadData);
        leadData.leadTypeId = leadType.id;
        // Probeer lead aan te maken
        logger.importLog('Probeer lead aan te maken', { leadData, tabName });
        try {
          const createdLead = await Lead.create({
            ...leadData,
            rawData: row
          });
          logger.importLog('Lead succesvol aangemaakt', { 
            id: createdLead.id, 
            facebookLeadId, 
            tabName 
          });
          totaalGeimporteerd++;
          importDetails.push({ status: 'imported', facebookLeadId, tabName, warning: leadData.importWarning });
        } catch (err) {
          logger.importLog('Fout bij aanmaken lead', { 
            error: err.message, 
            leadData, 
            tabName 
          });
          importDetails.push({ status: 'error', facebookLeadId, tabName, error: err.message });
          continue;
        }
      }
    }
    logger.info(`Importresultaat: ${totaalGeimporteerd} leads aangemaakt, ${totaalDuplicaten} duplicaten, details:`, importDetails);
    return { imported: totaalGeimporteerd, duplicates: totaalDuplicaten, details: importDetails };
  }
}

module.exports = LeadDistributionService;