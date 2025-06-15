const { sequelize, Lead } = require('../models');

(async () => {
  try {
    const leads = await Lead.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt', 'sheetBranche', 'status']
    });
    console.log('Laatste 10 leads:');
    leads.forEach(lead => {
      console.log(lead.toJSON());
    });
    process.exit(0);
  } catch (err) {
    console.error('Fout bij ophalen leads:', err);
    process.exit(1);
  }
})(); 