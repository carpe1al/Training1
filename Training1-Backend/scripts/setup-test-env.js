#!/usr/bin/env node

/**
 * Test Environment Setup Script
 * 
 * This script:
 * 1. Creates test database
 * 2. Runs migrations
 * 3. Seeds test data
 * 4. Verifies test environment is ready
 */

const { execSync } = require('child_process');
const path = require('path');

// Load test environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.test') });

console.log('🧪 Setting up test environment...\n');

try {
  // Step 1: Create test database if it doesn't exist
  console.log('1️⃣  Creating test database...');
  try {
    execSync('psql -U postgres -c "CREATE DATABASE training1_test;"', { stdio: 'inherit' });
    console.log('✅ Test database created\n');
  } catch (err) {
    console.log('ℹ️  Test database already exists\n');
  }

  // Step 2: Run Prisma migrations
  console.log('2️⃣  Running database migrations...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  });
  console.log('✅ Migrations complete\n');

  // Step 3: Generate Prisma client
  console.log('3️⃣  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 4: Seed test data (optional)
  console.log('4️⃣  Seeding test data...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Test data seeded\n');
  } catch (err) {
    console.log('ℹ️  No seed script found, skipping\n');
  }

  // Step 5: Verify Redis connection
  console.log('5️⃣  Verifying Redis connection...');
  const redis = require('redis');
  const client = redis.createClient({ url: process.env.REDIS_URL });
  
  client.on('error', (err) => {
    console.error('❌ Redis connection failed:', err.message);
    process.exit(1);
  });

  client.connect().then(() => {
    console.log('✅ Redis connected\n');
    client.disconnect();
    
    console.log('🎉 Test environment is ready!\n');
    console.log('Run tests with: npm test');
  });

} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
