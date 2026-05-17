const { execSync } = require('child_process');

if (process.env.BUILDING_OPEN_NEXT) {
  console.log("Detecting OpenNext build context. Running standard 'next build'...");
  execSync('npx next build', { stdio: 'inherit' });
} else {
  console.log("Starting OpenNext Cloudflare build...");
  process.env.BUILDING_OPEN_NEXT = 'true';
  execSync('npx opennextjs-cloudflare build', { stdio: 'inherit' });
}
