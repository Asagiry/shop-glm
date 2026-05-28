import fs from 'fs';
import path from 'path';

const logPath = path.join(__dirname, '../../../server.log');

export function logEvent(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, line);
}