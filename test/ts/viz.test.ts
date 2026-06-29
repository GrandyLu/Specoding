import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { vizCommand } from '../../src/commands/viz.js';

describe('vizCommand', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'comet-viz-'));
    await fs.mkdir(path.join(tmpDir, 'src', 'components'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'frontend-fixture', dependencies: { react: '^18.0.0' } }),
    );
    await fs.writeFile(
      path.join(tmpDir, 'src', 'routes.ts'),
      "export const routes = [{ path: '/home', component: 'HomePage' }];\n",
    );
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes architecture.mmd inside the target project', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const result = await vizCommand(tmpDir, { yes: true });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe(path.join(tmpDir, '.codegraph', 'architecture.mmd'));
    await expect(
      fs.readFile(path.join(tmpDir, '.codegraph', 'architecture.mmd'), 'utf8'),
    ).resolves.toContain('graph LR');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('.codegraph/architecture.mmd'));
  });

  it('prints a machine-readable generation result in JSON mode', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const result = await vizCommand(tmpDir, { yes: true, json: true });

    expect(JSON.parse(String(log.mock.calls[0][0]))).toEqual(result);
    expect(result).toMatchObject({
      success: true,
      outputPath: path.join(tmpDir, '.codegraph', 'architecture.mmd'),
      layers: ['layer1'],
      errors: [],
    });
  });

  it('rejects an invalid project path with the generator error', async () => {
    await expect(vizCommand(path.join(tmpDir, 'missing'), { yes: true })).rejects.toThrow(
      'Invalid project path',
    );
  });

  it('is the shared visualization entry point used by comet init', async () => {
    const initSource = await fs.readFile(path.resolve('src', 'commands', 'init.ts'), 'utf8');

    expect(initSource).toContain("import { vizCommand } from './viz.js';");
    expect(initSource).toContain('await vizCommand(projectPath, { yes: options.yes })');
    expect(initSource).not.toContain("import('../core/architecture-generator.js')");
  });
});
