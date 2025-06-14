const { execSync } = require('child_process');

try {
  console.log('==> Voer database seeders uit...');
  const output = execSync('npx sequelize-cli db:seed:all --env production --config config/config.json', { encoding: 'utf-8' });
  console.log('==> Seeder output:', output);
  console.log('==> Seeders voltooid!');
} catch (err) {
  console.error('==> Seeder-fout:', err.message);
  if (err.stdout) console.error('==> STDOUT:', err.stdout.toString());
  if (err.stderr) console.error('==> STDERR:', err.stderr.toString());
} 