const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.join(__dirname));
console.log('Building in:', process.cwd());

try {
  const result = execSync('npm run build', { encoding: 'utf-8', stdio: 'pipe' });
  console.log(result);
} catch (error) {
  console.error('BUILD ERROR:');
  console.error(error.stdout || error.message);
}
