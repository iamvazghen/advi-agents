// This script regenerates the Convex API
const { execSync } = require('child_process');

console.log('Regenerating Convex API...');
try {
  // Run the command to regenerate the API
  execSync('npx convex codegen', { stdio: 'inherit' });
  console.log('Convex API regenerated successfully!');
} catch (error) {
  console.error('Error regenerating Convex API:', error);
  process.exit(1);
}