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

describe('Architecture Generator - Call Graph', () => {
  describe('generateCallGraphDiagram', () => {
    it('should generate call graph for non-frontend project', async () => {
      // Mock empty database result for simplicity
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as never);

      const { generateCallGraphDiagram } = await import('../../src/core/architecture-generator');
      const mermaid = await generateCallGraphDiagram('/test', '/test/codegraph.db');
      expect(mermaid).toContain('graph TD');
      // Should have style definitions
      expect(mermaid).toContain('classDef');
    });

    it('should apply color coding by layer', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as never);

      const { generateCallGraphDiagram } = await import('../../src/core/architecture-generator');
      const mermaid = await generateCallGraphDiagram('/test', '/test/codegraph.db');
      expect(mermaid).toContain('controllerStyle');
      expect(mermaid).toContain('serviceStyle');
      expect(mermaid).toContain('databaseStyle');
      expect(mermaid).toContain('utilityStyle');
    });
  });
});

describe('Architecture Generator - Mermaid Standards', () => {
  describe('validateMermaidSyntax', () => {
    it('should pass valid Mermaid syntax', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const valid = 'graph LR\n  A-->B';
      expect(() => validateMermaidSyntax(valid)).not.toThrow();
    });

    it('should fail invalid Mermaid syntax', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const invalid = 'A-->B'; // Missing graph direction
      expect(() => validateMermaidSyntax(invalid)).toThrow();
    });

    it('should detect unclosed quotes', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const invalid = 'graph LR\n  A["Unclosed quote]';
      expect(() => validateMermaidSyntax(invalid)).toThrow();
    });

    it('should detect mismatched subgraph/end', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const invalid = 'graph LR\n  subgraph A\n  B-->C';
      expect(() => validateMermaidSyntax(invalid)).toThrow();
    });

    it('should accept TD graph direction', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const valid = 'graph TD\n  A-->B';
      expect(() => validateMermaidSyntax(valid)).not.toThrow();
    });

    it('should accept RL graph direction', async () => {
      const { validateMermaidSyntax } = await import('../../src/core/architecture-generator');
      const valid = 'graph RL\n  A-->B';
      expect(() => validateMermaidSyntax(valid)).not.toThrow();
    });
  });

  describe('applyStandardizedNamespace', () => {
    it('should add prefix to node IDs', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A-->B\n  C-->D';
      const result = applyStandardizedNamespace(input, 'MyModule');
      expect(result).toContain('MyModule_A');
      expect(result).toContain('MyModule_B');
    });

    it('should preserve Mermaid keywords', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  subgraph A\n  end\n  classDef style';
      const result = applyStandardizedNamespace(input, 'MyModule');
      expect(result).toContain('subgraph A'); // Not MyModule_subgraph
      expect(result).toContain('classDef'); // Not MyModule_classDef
    });

    it('should not prefix keywords in edge definitions', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A-->B\n  C -.->D';
      const result = applyStandardizedNamespace(input, 'MyModule');
      expect(result).toContain('-->');
      expect(result).toContain('-.->');
      expect(result).toContain('MyModule_A');
      expect(result).toContain('MyModule_B');
    });

    it('should handle complex node labels with quotes', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A["Label with spaces"]-->B["Another label"]';
      const result = applyStandardizedNamespace(input, 'MyModule');
      expect(result).toContain('MyModule_A');
      expect(result).toContain('MyModule_B');
      expect(result).toContain('Label with spaces');
    });

    it('should handle already prefixed nodes', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  MyModule_A-->MyModule_B';
      const result = applyStandardizedNamespace(input, 'MyModule');
      // Should not double-prefix
      expect(result).toContain('MyModule_A');
      expect(result).not.toContain('MyModule_MyModule_A');
    });

    it('should handle empty lines and comments', async () => {
      const { applyStandardizedNamespace } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  %% Comment\n  A-->B\n\n  C-->D';
      const result = applyStandardizedNamespace(input, 'MyModule');
      expect(result).toContain('%% Comment');
      expect(result).toContain('MyModule_A');
      expect(result).toContain('MyModule_C');
    });
  });

  describe('applyFrontendColorCoding', () => {
    it('should add frontend color styles to diagram without styles', async () => {
      const { applyFrontendColorCoding } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A-->B';
      const result = applyFrontendColorCoding(input);
      expect(result).toContain('classDef routeStyle');
      expect(result).toContain('classDef pageStyle');
      expect(result).toContain('classDef componentStyle');
      expect(result).toContain('classDef stateStyle');
      expect(result).toContain('classDef apiStyle');
      expect(result).toContain('#e1f5fe'); // route color
      expect(result).toContain('#f3e5f5'); // page color
    });

    it('should not duplicate styles if already present', async () => {
      const { applyFrontendColorCoding } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  classDef routeStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n  A-->B';
      const result = applyFrontendColorCoding(input);
      // Should not add duplicate classDef lines
      const classDefCount = (result.match(/classDef/g) || []).length;
      expect(classDefCount).toBe(1);
    });
  });

  describe('applyNonFrontendColorCoding', () => {
    it('should add non-frontend color styles to diagram without styles', async () => {
      const { applyNonFrontendColorCoding } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A-->B';
      const result = applyNonFrontendColorCoding(input);
      expect(result).toContain('classDef controllerStyle');
      expect(result).toContain('classDef serviceStyle');
      expect(result).toContain('classDef databaseStyle');
      expect(result).toContain('classDef utilityStyle');
      expect(result).toContain('#e3f2fd'); // controller color
      expect(result).toContain('#e8f5e9'); // service color
    });

    it('should not duplicate styles if already present', async () => {
      const { applyNonFrontendColorCoding } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  classDef controllerStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px\n  A-->B';
      const result = applyNonFrontendColorCoding(input);
      // Should not add duplicate classDef lines
      const classDefCount = (result.match(/classDef/g) || []).length;
      expect(classDefCount).toBe(1);
    });
  });

  describe('applyMermaidStandards', () => {
    it('should apply all standards for frontend projects', async () => {
      const { applyMermaidStandards } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  Route-->Page';
      const result = applyMermaidStandards(input, 'frontend', 'MyApp');
      expect(result).toContain('MyApp_Route');
      expect(result).toContain('MyApp_Page');
      expect(result).toContain('classDef routeStyle');
      expect(result).toContain('classDef pageStyle');
    });

    it('should apply all standards for non-frontend projects', async () => {
      const { applyMermaidStandards } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  Controller-->Service';
      const result = applyMermaidStandards(input, 'non-frontend', 'MyAPI');
      expect(result).toContain('MyAPI_Controller');
      expect(result).toContain('MyAPI_Service');
      expect(result).toContain('classDef controllerStyle');
      expect(result).toContain('classDef serviceStyle');
    });

    it('should validate syntax after applying standards', async () => {
      const { applyMermaidStandards } = await import('../../src/core/architecture-generator');
      const validInput = 'graph LR\n  A-->B';
      expect(() => applyMermaidStandards(validInput, 'frontend', 'MyApp')).not.toThrow();
    });

    it('should throw on invalid syntax after applying standards', async () => {
      const { applyMermaidStandards } = await import('../../src/core/architecture-generator');
      const invalidInput = 'A-->B'; // Missing graph direction
      expect(() => applyMermaidStandards(invalidInput, 'frontend', 'MyApp')).toThrow();
    });

    it('should use default namespace prefix if not provided', async () => {
      const { applyMermaidStandards } = await import('../../src/core/architecture-generator');
      const input = 'graph LR\n  A-->B';
      const result = applyMermaidStandards(input, 'frontend');
      expect(result).toContain('Project_A');
      expect(result).toContain('Project_B');
    });
  });
});

describe('Architecture Generator - Main Entry', () => {
  describe('generateArchitectureDiagram', () => {
    it('should generate diagram for frontend project', async () => {
      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as never);
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: { react: '^18.0.0' }
      }));

      const { generateArchitectureDiagram } = await import('../../src/core/architecture-generator');
      const result = await generateArchitectureDiagram('/test/frontend', true);
      expect(result.success).toBe(true);
      expect(result.layers).toContain('layer1');
    });

    it('should generate diagram for non-frontend project', async () => {
      // Reset all mocks
      vi.clearAllMocks();

      vi.spyOn(fs, 'access').mockResolvedValue(undefined as never);
      // Mock directory structure: project exists but no frontend directories
      vi.spyOn(fs, 'stat')
        .mockResolvedValueOnce({ isDirectory: () => true } as never) // Project root exists
        .mockRejectedValueOnce(new Error('not found')) // src/components doesn't exist
        .mockRejectedValueOnce(new Error('not found')); // src/views doesn't exist

      // Mock package.json without frontend dependencies
      vi.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify({
        dependencies: { express: '^4.0.0' }
      }));

      const { generateArchitectureDiagram } = await import('../../src/core/architecture-generator');
      const result = await generateArchitectureDiagram('/test/backend', true);
      expect(result.success).toBe(true);
      expect(result.layers).toContain('callgraph');
    });

    it('should handle missing codegraph.db gracefully', async () => {
      vi.clearAllMocks();
      vi.spyOn(fs, 'access').mockRejectedValue(new Error('not found'));
      vi.spyOn(fs, 'stat').mockRejectedValue(new Error('not found'));

      const { generateArchitectureDiagram } = await import('../../src/core/architecture-generator');
      const result = await generateArchitectureDiagram('/test/invalid', true);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should skip when COMET_SKIP_VIZ is set', async () => {
      vi.clearAllMocks();
      process.env.COMET_SKIP_VIZ = 'true';
      vi.spyOn(fs, 'stat').mockResolvedValue({ isDirectory: () => true } as never);

      const { generateArchitectureDiagram } = await import('../../src/core/architecture-generator');
      const result = await generateArchitectureDiagram('/test', true);
      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(0);
      delete process.env.COMET_SKIP_VIZ;
    });
  });
});
