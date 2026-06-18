import { describe, expect, it } from 'vitest';
import { promises as fs } from 'fs';

const readmes = ['README.md', 'README-zh.md'];

describe('README assets', () => {
  it.each(readmes)('does not include old remote showcase images in %s', async (readmePath) => {
    const content = await fs.readFile(readmePath, 'utf-8');

    expect(content).not.toMatch(/\b(?:src|srcset)=["'](?:\.\/)?img\//);
    expect(content).not.toContain('github.com/rpamis/comet/blob/master/img/');
    expect(content).not.toContain('title-log.png');
    expect(content).not.toContain('runner.png');
    expect(content).not.toContain('wechat.jpg');
    expect(content).not.toContain('qq.jpg');
    expect(content).not.toContain('Bilibili');
    expect(content).not.toContain('DeepWiki');
    expect(content).not.toContain('Star History');
  });

  it('documents build_pause in README state examples and field descriptions', async () => {
    const en = await fs.readFile('README.md', 'utf-8');
    const zh = await fs.readFile('README-zh.md', 'utf-8');

    expect(en).toContain('build_pause: null');
    expect(en).toContain('`build_pause` records an internal build-phase pause point');
    expect(en).toContain('`plan-ready` means the plan has been generated');

    expect(zh).toContain('build_pause: null');
    expect(zh).toContain('`build_pause` 记录 build 阶段内部暂停点');
    expect(zh).toContain('`plan-ready` 表示 plan 已生成');
  });

  it('documents Comet architecture, CodeGraph evidence, and configurable context skills', async () => {
    const en = await fs.readFile('README.md', 'utf-8');
    const zh = await fs.readFile('README-zh.md', 'utf-8');

    for (const content of [en, zh]) {
      expect(content).toContain('CodeGraph');
      expect(content).toContain('comet-codegraph-context.sh');
      expect(content).toContain('COMET_CODEGRAPH_CONTEXT_FILE');
      expect(content).toContain('openspec/.comet/codegraph-context.md');
      expect(content).toContain('.codegraph/architecture.mmd');
      expect(content).toContain('--skip-viz');
      expect(content).toContain('/comet-scan');
      expect(content).toContain('context_skills:');
      expect(content).toContain('comet-guard.sh');
      expect(content).toContain('comet-state.sh');
      expect(content).toContain('comet-handoff.sh');
      expect(content).toContain('comet-archive.sh');
    }

    expect(en).toContain('Comet is a workflow harness');
    expect(en).toContain('CodeGraph evidence layer');
    expect(en).toContain('CodeGraph context is the primary code evidence');

    expect(zh).toContain('Comet 是一个工作流 harness');
    expect(zh).toContain('CodeGraph 证据层');
    expect(zh).toContain('CodeGraph context 是主要代码证据');
  });
});
