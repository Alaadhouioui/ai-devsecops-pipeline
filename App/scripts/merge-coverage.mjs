import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const reports = [
  ['backend', 'backend/coverage/lcov.info'],
  ['frontend', 'frontend/coverage/lcov.info']
];

const normalizedReports = await Promise.all(reports.map(async ([project, reportPath]) => {
  const report = await readFile(new URL(`../${reportPath}`, import.meta.url), 'utf8');
  return report.replace(/^SF:(.*)$/gm, (_line, sourcePath) => {
    const normalizedPath = sourcePath.replaceAll('\\', '/');
    const sourceIndex = normalizedPath.lastIndexOf(`${project}/src/`);
    const relativeSource = sourceIndex >= 0
      ? normalizedPath.slice(sourceIndex)
      : `${project}/src/${normalizedPath.replace(/^.*?src\//, '')}`;
    return `SF:${relativeSource}`;
  }).trim();
}));

const outputPath = new URL('../coverage/lcov.info', import.meta.url);
await mkdir(dirname(outputPath.pathname), { recursive: true });
await writeFile(outputPath, `${normalizedReports.join('\n')}\n`);
