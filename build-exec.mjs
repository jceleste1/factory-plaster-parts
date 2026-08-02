import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.chdir(__dirname);
console.log('Building in:', process.cwd());

try {
  const result = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 });
  // Show first 100 lines
  const lines = result.split('\n');
  lines.slice(0, 100).forEach(line => console.log(line));
} catch (error) {
  console.error('BUILD ERROR OUTPUT:');
  if (error.stdout) console.log(error.stdout.toString());
  if (error.stderr) console.error(error.stderr.toString());
  console.error('Status:', error.status);
}
