import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveDbPath(): string {
  if (process.env.DB_PATH && !process.env.DB_PATH.includes('frontend')) {
    const customPath = path.resolve(__dirname, '../../', process.env.DB_PATH);
    if (fs.existsSync(customPath)) return customPath;
  }
  const bundledDb = path.resolve(__dirname, '../../data/fir_system.sqlite');
  if (fs.existsSync(bundledDb) && fs.statSync(bundledDb).size > 0) {
    try {
      fs.accessSync(bundledDb, fs.constants.W_OK);
      return bundledDb;
    } catch {
      const tmpDb = path.join(os.tmpdir(), 'fir_system_catalyst_runtime.sqlite');
      if (!fs.existsSync(tmpDb) || fs.statSync(tmpDb).size === 0) {
        fs.copyFileSync(bundledDb, tmpDb);
      }
      return tmpDb;
    }
  }
  return path.resolve(__dirname, '../../../../../frontend/data/fir_system.sqlite');
}

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  DB_PATH: resolveDbPath(),
  JWT_SECRET: process.env.JWT_SECRET || 'ksp-intelligence-platform-catalyst-cloud-secret-key-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '12h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

