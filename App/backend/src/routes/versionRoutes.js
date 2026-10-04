import { readFileSync } from 'node:fs';
import express from 'express';

const router = express.Router();
const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const builtAt = process.env.BUILD_TIMESTAMP || new Date().toISOString();

router.get('/', (req, res) => {
  const commit = process.env.GIT_COMMIT;

  res.json({
    version: packageJson.version,
    buildNumber: process.env.BUILD_NUMBER || 'local',
    commit: commit ? commit.slice(0, 7) : 'unknown',
    builtAt
  });
});

export default router;
