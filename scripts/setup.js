#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Training1 Platform...\n');

// Check if all required directories exist
const requiredDirs = [
  '../Training1-Backend',
  '../Training1-Frontend'
];

console.log('📁 Checking repository structure...');
for (const dir of requiredDirs) {
  const fullPath = path.resolve(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Missing directory: ${dir}`);
    console.log('Please ensure all three repositories are cloned at the same level:');
    console.log('  - Training1/');
    console.log('  - Training1-Backend/');
    console.log('  - Training1-Frontend/');
    process.exit(1);
  }
  console.log(`✅ Found: ${dir}`);
}

// Check if Docker is installed
console.log('\n🐳 Checking Docker installation...');
try {
  execSync('docker --version', { stdio: 'pipe' });
  execSync('docker-compose --version', { stdio: 'pipe' });
  console.log('✅ Docker and Docker Compose are installed');
} catch (error) {
  console.error('❌ Docker or Docker Compose not found');
  console.log('Please install Docker Desktop: https://www.docker.com/products/docker-desktop');
  process.exit(1);
}

// Check if Node.js is installed in backend and frontend
console.log('\n📦 Checking Node.js dependencies...');

const checkNodeProject = (dir, name) => {
  const fullPath = path.resolve(__dirname, '..', dir);
  const packageJsonPath = path.join(fullPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ No package.json found in ${name}`);
    return false;
  }
  
  const nodeModulesPath = path.join(fullPath, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log(`📦 Installing dependencies for ${name}...`);
    try {
      execSync('npm install', { cwd: fullPath, stdio: 'inherit' });
      console.log(`✅ Dependencies installed for ${name}`);
    } catch (error) {
      console.error(`❌ Failed to install dependencies for ${name}`);
      return false;
    }
  } else {
    console.log(`✅ Dependencies already installed for ${name}`);
  }
  
  return true;
};

if (!checkNodeProject('../Training1-Backend', 'Backend')) {
  process.exit(1);
}

if (!checkNodeProject('../Training1-Frontend', 'Frontend')) {
  process.exit(1);
}

// Create environment files if they don't exist
console.log('\n🔧 Setting up environment files...');

const envFiles = [
  {
    path: '../Training1-Backend/.env',
    content: `NODE_ENV=development
DATABASE_URL=postgresql://training1_user:training1_password@localhost:5432/training1
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-change-this-in-production
PORT=3001
CORS_ORIGIN=http://localhost:3000`
  },
  {
    path: '../Training1-Frontend/.env',
    content: `REACT_APP_API_URL=http://localhost:3001
PORT=3000`
  }
];

for (const envFile of envFiles) {
  const fullPath = path.resolve(__dirname, '..', envFile.path);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, envFile.content);
    console.log(`✅ Created: ${envFile.path}`);
  } else {
    console.log(`⚠️  Already exists: ${envFile.path}`);
  }
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Run "npm run dev" to start all services with Docker');
console.log('2. Or run services individually:');
console.log('   - Backend: npm run dev:backend');
console.log('   - Frontend: npm run dev:frontend');
console.log('\nServices will be available at:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:3001');
console.log('- Database: localhost:5432');
console.log('- Redis: localhost:6379');
console.log('- MailHog (dev email): http://localhost:8025');