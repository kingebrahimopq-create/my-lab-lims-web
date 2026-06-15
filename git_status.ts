import { execSync } from 'child_process';

try {
  console.log('--- Git Status ---');
  const status = execSync('git status', { encoding: 'utf8' });
  console.log(status);
} catch (error: any) {
  console.error(error.message);
}
