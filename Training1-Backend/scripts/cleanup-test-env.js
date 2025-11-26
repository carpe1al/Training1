#!/usr/bin/env node

/**
 * Test Cleanup Script
 * 
 * Cleans up test database and Redis data after tests
 */

const { execSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.test') });

console.log('🧹 Cleaning up test environment...\n');

try {
  // Clear test database
  console.log('1️⃣  Resetting test database...');
  execSync('npx prisma migrate reset --force --skip-seed', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  console.log('✅ Database reset\n');

  // Clear Redis test data
  console.log('2️⃣  Clearing Redis test data...');
  const redis = require('redis');
  const client = redis.createClient({ url: process.env.REDIS_URL });
  
  client.connect().then(async () => {
    await client.flushDb();
    console.log('✅ Redis cleared\n');
    await client.disconnect();
    
    console.log('🎉 Test environment cleaned!\n');
  });

} catch (error) {
  console.error('\n❌ Cleanup failed:', error.message);
  process.exit(1);
}
