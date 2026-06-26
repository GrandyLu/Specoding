import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getNpmExecutable, isCommandAvailable } from './openspec.js';
import { printCommandErrorDetails } from './command-error.js';

import type { InstallScope } from './types.js';

type CodeGraphInstallStatus = 'installed' | 'failed' | 'skipped';

const CODEGRAPH_COMMAND = 'codegraph';
const CODEGRAPH_PACKAGE = '@colbymchenry/codegraph';

function getPnpmExecutable(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function hasCodegraphProjectIndex(projectPath: string): boolean {
  const codegraphDir = path.join(projectPath, '.codegraph');
  try {
    if (!fs.statSync(codegraphDir).isDirectory()) return false;
    return fs.readdirSync(codegraphDir).some((entry) => entry !== '.gitignore');
  } catch {
    return false;
  }
}

function resolvePnpmGlobalCommand(command: string): string | null {
  try {
    const binDir = execFileSync(getPnpmExecutable(), ['bin', '-g'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 10_000,
      shell: process.platform === 'win32',
    }).trim();
    if (!binDir) return null;

    const candidates =
      process.platform === 'win32'
        ? [`${command}.cmd`, `${command}.exe`, `${command}.ps1`, command]
        : [command];

    for (const candidate of candidates) {
      const candidatePath = path.join(binDir, candidate);
      if (fs.existsSync(candidatePath)) return candidatePath;
    }
  } catch {
    // pnpm may not be installed or may not have a global bin configured.
  }

  return null;
}

function resolveCodegraphCommand(): string | null {
  if (isCommandAvailable(CODEGRAPH_COMMAND)) return CODEGRAPH_COMMAND;
  return resolvePnpmGlobalCommand(CODEGRAPH_COMMAND);
}

async function ensureCodegraphCli(
  projectPath: string,
  shouldInstall = true,
): Promise<string | null> {
  const existingCommand = resolveCodegraphCommand();
  if (existingCommand) return existingCommand;
  if (!shouldInstall) return null;

  console.log('    Installing CodeGraph CLI...');
  try {
    execFileSync(getNpmExecutable(), ['install', '-g', CODEGRAPH_PACKAGE], {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 180_000,
      shell: process.platform === 'win32',
    });
    return resolveCodegraphCommand();
  } catch (error) {
    console.error(`    Failed to install CodeGraph CLI: ${(error as Error).message}`);
    printCommandErrorDetails(error);
    return null;
  }
}

async function installCodegraph(
  projectPath: string,
  scope: InstallScope,
  shouldInstallCli = true,
): Promise<CodeGraphInstallStatus> {
  if (hasCodegraphProjectIndex(projectPath)) {
    console.log('    CodeGraph: existing .codegraph index detected');
    return 'skipped';
  }

  const codegraphCommand = await ensureCodegraphCli(projectPath, shouldInstallCli);
  if (!codegraphCommand) {
    if (!shouldInstallCli) {
      console.log('    CodeGraph CLI not installed, skipping setup');
      return 'skipped';
    }
    console.error(
      `    CodeGraph CLI not available. Install manually: npm install -g ${CODEGRAPH_PACKAGE}`,
    );
    return 'failed';
  }

  try {
    console.log('    Running: codegraph install --yes');
    execFileSync(codegraphCommand, ['install', '--yes'], {
      cwd: projectPath,
      stdio: 'inherit',
      timeout: 120_000,
      shell: process.platform === 'win32',
    });
  } catch (error) {
    console.error(`    CodeGraph install failed: ${(error as Error).message}`);
    printCommandErrorDetails(error);
    return 'failed';
  }

  if (scope === 'project') {
    try {
      console.log('    Running: codegraph init -i');
      execFileSync(codegraphCommand, ['init', '-i'], {
        cwd: projectPath,
        stdio: 'inherit',
        timeout: 300_000,
        shell: process.platform === 'win32',
      });
    } catch (error) {
      console.error(`    CodeGraph init failed: ${(error as Error).message}`);
      printCommandErrorDetails(error);
      return 'failed';
    }
  }

  return 'installed';
}

async function installCodeGraph(projectPath: string): Promise<CodeGraphInstallStatus> {
  return installCodegraph(projectPath, 'project', true);
}

export {
  CODEGRAPH_COMMAND,
  CODEGRAPH_PACKAGE,
  hasCodegraphProjectIndex,
  installCodeGraph,
  installCodegraph,
  resolveCodegraphCommand,
  type CodeGraphInstallStatus,
};
