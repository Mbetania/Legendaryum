import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rawData = readFileSync(join(__dirname, '../src/roomConfig.json'), 'utf-8');
const config = JSON.parse(rawData);
export default config;
