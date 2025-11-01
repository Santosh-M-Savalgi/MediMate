const { migrate } = require('node-pg-migrate');
const config = require('../config/config');

const runMigration = async () => {
  const dbConfig = {
    ...config.db,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };

  try {
    await migrate({
      databaseUrl: `postgres://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
      dir: 'migrations',
      direction: 'up',
      migrationsTable: 'migrations'
    });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();