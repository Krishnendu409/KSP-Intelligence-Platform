/**
 * Zoho Catalyst Advanced I/O Serverless Function Bridge
 * 
 * This file serves as the mandatory entrypoint for the Zoho Catalyst Serverless Node.js 20 runtime.
 * When deployed to Catalyst Cloud, the platform executes index.js, which boots our compiled
 * TypeScript Express application and connects it directly to the Catalyst Advanced I/O router.
 */

const fs = require('fs');
const path = require('path');

const distMain = path.join(__dirname, 'dist', 'index.js');

if (!fs.existsSync(distMain)) {
  console.error('[Catalyst Bridge] Fatal: dist/index.js not found. Ensure TypeScript compilation (tsc) runs before deployment.');
  process.exit(1);
}

const app = require('./dist/index.js');

module.exports = app;
