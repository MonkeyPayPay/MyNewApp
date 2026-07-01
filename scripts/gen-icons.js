/**
 * Generates all required Capacitor icon and splash sizes from resources/icon.png
 * and resources/splash.png using @capacitor/assets.
 *
 * Run once locally after cloning:
 *   npm install --save-dev @capacitor/assets
 *   node scripts/gen-icons.js
 *
 * Requires: resources/icon.png (1024×1024), resources/splash.png (2732×2732)
 */
const { execSync } = require('child_process')

execSync('npx @capacitor/assets generate --iconBackgroundColor "#050510" --iconBackgroundColorDark "#050510" --splashBackgroundColor "#050510" --splashBackgroundColorDark "#050510"', {
  stdio: 'inherit',
  cwd: process.cwd(),
})
