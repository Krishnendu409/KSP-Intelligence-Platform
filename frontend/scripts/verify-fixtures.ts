import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturePath = path.resolve(__dirname, '../data/fixtures/canonical_investigation.json');
try {
  const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  let isValid = true;
  
  if (!data.cases || !Array.isArray(data.cases)) {
    console.error('Fixture missing valid "cases" array.');
    isValid = false;
  }
  if (!data.entities || !Array.isArray(data.entities)) {
    console.error('Fixture missing valid "entities" array.');
    isValid = false;
  }
  if (!data.events || !Array.isArray(data.events)) {
    console.error('Fixture missing valid "events" array.');
    isValid = false;
  }
  if (!data.relationships || !Array.isArray(data.relationships)) {
    console.error('Fixture missing valid "relationships" array.');
    isValid = false;
  }
  
  if (isValid) {
    console.log('Fixture verification passed.');
  } else {
    process.exit(1);
  }
} catch (error) {
  console.error('Error verifying fixtures:', error);
  process.exit(1);
}
