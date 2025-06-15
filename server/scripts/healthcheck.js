const { sequelize } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    const dbConfig = sequelize.config;
    const isRender = dbConfig.host && dbConfig.host.includes('dpg-d16oepemcj7s73cd84sg-a');
    console.log('Database verbinding OK!');
    console.log('Host:', dbConfig.host);
    console.log('Database:', dbConfig.database);
    if (isRender) {
      console.log('✅ Je bent verbonden met de Render database!');
    } else {
      console.warn('⚠️  Je bent NIET verbonden met de Render database!');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connectie mislukt:', err.message);
    process.exit(1);
  }
})(); 