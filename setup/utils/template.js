import { downloadTemplate } from 'giget';
import { getGitHubToken } from './github-auth.js';

export async function downloadProjectTemplate(projectPath, options) {
  const auth = getGitHubToken() || undefined;

  await downloadTemplate('github:Asamkhya-com/asamkhya-starter-template', {
    dir: projectPath,
    force: options?.force || false,
    auth
  });
}
