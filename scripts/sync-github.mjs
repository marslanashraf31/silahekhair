import { execSync } from 'child_process';

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repo = 'marslanashraf31/silahekhair';

if (!token) {
  console.log('⚠️ GITHUB_TOKEN environment variable is not set. Skipping GitHub push.');
  console.log('To enable auto-syncing, add GITHUB_TOKEN to Secrets in Settings.');
  process.exit(0);
}

try {
  console.log('🔄 Syncing changes to GitHub repository:', repo);

  execSync('git config user.name "Silah-e-Khair Bot"', { stdio: 'inherit' });
  execSync('git config user.email "bot@silahekhair.org"', { stdio: 'inherit' });
  execSync('git branch -M main', { stdio: 'inherit' });

  const remoteUrl = `https://x-access-token:${token}@github.com/${repo}.git`;
  execSync(`git remote set-url origin "${remoteUrl}"`, { stdio: 'pipe' });

  execSync('git add .', { stdio: 'inherit' });

  const status = execSync('git status --porcelain').toString();
  if (status.trim()) {
    execSync('git commit -m "Auto-sync update from AI Studio"', { stdio: 'inherit' });
    console.log('📦 Local changes committed.');
  } else {
    console.log('✅ No uncommitted local changes.');
  }

  execSync('git push -u origin main --force', { stdio: 'inherit' });
  console.log('🚀 Successfully synced latest changes to GitHub repository marslanashraf31/silahekhair!');
} catch (error) {
  console.error('❌ Failed to sync to GitHub:', error.message || error);
}
