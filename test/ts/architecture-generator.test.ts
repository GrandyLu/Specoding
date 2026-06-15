// test/ts/architecture-generator.test.ts

import { describe, it, expect, vi } from 'vitest';
import fs from 'fs/promises';

// Mock fs 模块
vi.mock('fs/promises');

describe('Architecture Generator - Project Type Detection', () => {
  describe('detectProjectType', () => {
    it('should detect React frontend project by package.json', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: { react: '^18.0.0' }
      }));

      // Implementation will be tested after import
      const { detectProjectType } = await import('../../src/core/architecture-generator');
      const type = await detectProjectType('/test/react-project');
      expect(type).toBe('frontend');
    });

    it('should detect Vue frontend project', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: { vue: '^3.0.0' }
      }));

      const { detectProjectType } = await import('../../src/core/architecture-generator');
      const type = await detectProjectType('/test/vue-project');
      expect(type).toBe('frontend');
    });

    it('should detect Angular frontend project', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: { '@angular/core': '^16.0.0' }
      }));

      const { detectProjectType } = await import('../../src/core/architecture-generator');
      const type = await detectProjectType('/test/angular-project');
      expect(type).toBe('frontend');
    });

    it('should detect non-frontend project without package.json', async () => {
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('not found'));
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('not found'));

      const { detectProjectType } = await import('../../src/core/architecture-generator');
      const type = await detectProjectType('/test/go-project');
      expect(type).toBe('non-frontend');
    });

    it('should detect frontend by directory structure', async () => {
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('no package.json'));
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as never);

      const { detectProjectType } = await import('../../src/core/architecture-generator');
      const type = await detectProjectType('/test/static-site');
      expect(type).toBe('frontend');
    });
  });
});

describe('Architecture Generator - Layer 1 Routes', () => {
  describe('generateLayer1Diagram', () => {
    it('should generate simple route diagram', async () => {
      // Mock project structure
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'readFile').mockResolvedValue(`
        export const routes = [
          { path: '/home', component: 'HomePage' },
          { path: '/about', component: 'AboutPage' }
        ];
      `);

      const { generateLayer1Diagram } = await import('../../src/core/architecture-generator');
      const mermaid = await generateLayer1Diagram('/test');
      expect(mermaid).toContain('graph LR');
      expect(mermaid).toContain('Route_0');
      expect(mermaid).toContain('home');
    });

    it('should chunk large route sets with 18-node limit', async () => {
      // Mock 25 routes (should trigger chunking: 18 + 7)
      const routes = Array.from({ length: 25 }, (_, i) => ({
        path: `/route${i}`,
        component: `Component${i}`
      }));

      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      const routeContent = `export const routes = ${JSON.stringify(routes)};`;
      vi.spyOn(fs, 'readFile').mockResolvedValue(routeContent);

      const { generateLayer1Diagram } = await import('../../src/core/architecture-generator');
      const mermaid = await generateLayer1Diagram('/test');

      // Should use subgraph for chunking
      expect(mermaid).toContain('subgraph');
      // Should have multiple modules (25 routes / 18 per chunk = 2 modules)
      expect(mermaid.match(/subgraph/g)?.length).toBeGreaterThan(1);
      // Each subgraph should have styled nodes
      expect(mermaid).toContain(':::routeStyle');
      expect(mermaid).toContain(':::pageStyle');
    });
  });
});
