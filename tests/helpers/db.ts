import { execSync } from 'node:child_process';

export function cleanupTestData() {
  execSync(`pnpx supabase db reset`, { stdio: 'inherit' });
}
