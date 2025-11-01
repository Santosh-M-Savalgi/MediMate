const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir);
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupsDir, `backup-${timestamp}.sql`);

// PostgreSQL connection details
const { host, port, database, user, password } = config.db;

// Set environment variables for pg_dump
const env = {
  ...process.env,
  PGPASSWORD: password
};

// Run pg_dump
const pg_dump = spawn('pg_dump', [
  '-h', host,
  '-p', port.toString(),
  '-U', user,
  '-F', 'c', // Custom format (compressed)
  '-b', // Include large objects
  '-v', // Verbose
  '-f', backupFile,
  database
], { env });

pg_dump.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

pg_dump.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

pg_dump.on('close', (code) => {
  if (code === 0) {
    console.log(`Backup completed successfully: ${backupFile}`);
    
    // Clean up old backups (keep last 7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();
    
    fs.readdir(backupsDir, (err, files) => {
      if (err) throw err;
      
      files.forEach(file => {
        const filePath = path.join(backupsDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) throw err;
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlink(filePath, err => {
              if (err) throw err;
              console.log(`Deleted old backup: ${file}`);
            });
          }
        });
      });
    });
  } else {
    console.error(`Backup failed with code ${code}`);
  }
});