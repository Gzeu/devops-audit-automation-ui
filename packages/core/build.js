#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Building @audit/core package...');

try {
  // Verifică că scripturile există și sunt executabile
  const scripts = [
    'scripts/quick-health-check.sh',
    'scripts/devops-analyzer.py', 
    'scripts/quality-audit-script.sh'
  ];
  
  scripts.forEach(script => {
    try {
      execSync(`chmod +x ${script}`, { stdio: 'inherit' });
      console.log(`✅ Made ${script} executable`);
    } catch (error) {
      console.log(`⚠️  ${script} not found - will need to be copied from original repo`);
    }
  });
  
  console.log('✅ Core package built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}