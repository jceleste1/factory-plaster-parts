import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);
console.log('='.repeat(60));
console.log('🔨 BUILDING MANUFACTURING TRACKING SYSTEM');
console.log('='.repeat(60));

try {
  // Clear dist
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✓ Cleared dist/');
  }

  // Run build
  console.log('\nRunning: npm run build...\n');
  const result = execSync('npm run build', { encoding: 'utf-8', stdio: 'inherit', maxBuffer: 50 * 1024 * 1024 });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ BUILD SUCCESSFUL!');
  console.log('='.repeat(60));
  console.log('\n📦 Output location: dist/');
  
  // Check dist folder
  if (fs.existsSync('dist')) {
    const distSize = execSync('dir dist /s /-c 2>nul | find "totale"', { encoding: 'utf-8', stdio: 'pipe' }).catch(() => 'size unknown');
    console.log(`📊 Build size: ${distSize.trim()}\n`);
  }
  
  process.exit(0);
} catch (error) {
  console.log('\n' + '='.repeat(60));
  console.log('❌ BUILD FAILED');
  console.log('='.repeat(60));
  process.exit(1);
}
