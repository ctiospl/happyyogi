// Updates package.json name field after project clone

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function updatePackageName(projectPath, projectName) {
  const pkgPath = join(projectPath, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.name = projectName;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
