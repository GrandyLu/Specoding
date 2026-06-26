// test/ts/architecture-generator-e2e.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Architecture Generator - E2E Tests', () => {
  let tempDir: string;

  beforeAll(async () => {
    // 创建临时测试目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'comet-test-'));
  });

  afterAll(async () => {
    // 清理临时目录
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should handle missing CodeGraph database gracefully', async () => {
    // 创建没有 CodeGraph 的项目
    const packageJson = { name: 'test-project' };
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );

    // 尝试生成架构图
    const { generateArchitectureDiagram } = await import('../../src/core/architecture-generator');
    const result = await generateArchitectureDiagram(tempDir, false);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should detect project type correctly for React project', async () => {
    // 创建模拟 React 项目
    const packageJson = {
      name: 'test-react-app',
      dependencies: { react: '^18.0.0' }
    };

    await fs.mkdir(path.join(tempDir, 'src', 'components'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );

    // 检测项目类型
    const { detectProjectType } = await import('../../src/core/architecture-generator');
    const type = await detectProjectType(tempDir);
    expect(type).toBe('frontend');
  });

  it('should detect project type correctly for non-frontend project', async () => {
    // 清理之前的测试文件，确保没有 src/components 目录
    await fs.rm(path.join(tempDir, 'src'), { recursive: true, force: true });

    // 创建模拟后端项目
    const packageJson = {
      name: 'test-backend-app',
      dependencies: { express: '^4.0.0' }
    };

    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );

    // 检测项目类型
    const { detectProjectType } = await import('../../src/core/architecture-generator');
    const type = await detectProjectType(tempDir);
    expect(type).toBe('non-frontend');
  });

  it('should validate Mermaid syntax correctly', async () => {
    const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');

    // 有效语法应该通过
    expect(() => validateMermaidSyntax('graph LR\n  A-->B')).not.toThrow();

    // 无效语法应该抛出错误
    expect(() => validateMermaidSyntax('A-->B')).toThrow();
  });

  it('should apply namespace standardization correctly', async () => {
    const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
    const input = 'graph LR\n  A-->B\n  C-->D';
    const result = applyStandardizedNamespace(input, 'MyModule');

    expect(result).toContain('MyModule_A');
    expect(result).toContain('MyModule_B');
    // 关键词应该保留
    expect(result).toContain('graph LR');
  });

  it('should handle empty route list gracefully', async () => {
    // 清理之前的测试文件
    await fs.rm(path.join(tempDir, 'src'), { recursive: true, force: true });

    // 创建空路由项目
    const packageJson = {
      name: 'test-empty-routes',
      dependencies: { react: '^18.0.0' }
    };

    await fs.mkdir(path.join(tempDir, 'src', 'components'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify(packageJson)
    );

    const { generateLayer1Diagram } = await import('../../src/core/architecture-generator');
    const mermaid = await generateLayer1Diagram(tempDir);

    // 应该返回有效的 Mermaid，即使没有路由
    expect(mermaid).toContain('graph LR');
  });
});
