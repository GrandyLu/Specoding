import { execFileSync } from 'child_process';
import { printCommandErrorDetails } from './command-error.js';

type CodeGraphInstallStatus = 'installed' | 'failed' | 'skipped';

const CODEGRAPH_COMMAND = 'codegraph';
const CODEGRAPH_PACKAGE = 'codegraph@latest';
const CODEGRAPH_INSTALL_TIMEOUT_MS = 120_000;

function getNpmExecutable(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'npm.cmd' : 'npm';
}

function isCommandAvailable(command: string): boolean {
  try {
    const checker = process.platform === 'win32' ? 'where' : 'which';
    execFileSync(checker, [command], { stdio: 'ignore', timeout: 10_000 });
    return true;
  } catch {
    return false;
  }
}

async function installCodeGraph(projectPath: string): Promise<CodeGraphInstallStatus> {
  if (isCommandAvailable(CODEGRAPH_COMMAND)) {
    return 'skipped';
  }

  console.log(`    Installing CodeGraph CLI...`);
  try {
    execFileSync(getNpmExecutable(), ['install', '-g', CODEGRAPH_PACKAGE], {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: CODEGRAPH_INSTALL_TIMEOUT_MS,
      shell: process.platform === 'win32',
    });
    return isCommandAvailable(CODEGRAPH_COMMAND) ? 'installed' : 'failed';
  } catch (error) {
    console.error(`    Failed to install CodeGraph CLI: ${(error as Error).message}`);
    printCommandErrorDetails(error);
    return 'failed';
  }
}

export { installCodeGraph, CODEGRAPH_COMMAND, CODEGRAPH_PACKAGE, type CodeGraphInstallStatus };
