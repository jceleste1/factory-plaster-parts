import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);
console.log('Installing dependencies in:', process.cwd());

try {
  const result = execSync('npm install', { encoding: 'utf-8', stdio: 'inherit' });
  console.log('\n✓ Dependencies installed successfully');
} catch (error) {
  console.error('\n✗ npm install failed');
  process.exit(1);
}

console.log('\nNow running build...');
try {
  const result = execSync('npm run build', { encoding: 'utf-8', stdio: 'inherit' });
  console.log('\n✓ BUILD SUCCESSFUL!');
} catch (error) {
  console.error('\n✗ Build failed');
  process.exit(1);
}
