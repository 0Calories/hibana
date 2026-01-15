import { execSync } from 'node:child_process';

export function cleanupTestData() {
  execSync(`pnpm db:reset`, { stdio: 'inherit' });
}
