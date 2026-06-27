import path from 'path';
import {
  generateArchitectureDiagram,
  type GenerationResult,
} from '../core/architecture-generator.js';

export interface VizOptions {
  yes?: boolean;
  json?: boolean;
}

export async function vizCommand(
  targetPath: string,
  options: VizOptions = {},
): Promise<GenerationResult> {
  const projectPath = path.resolve(targetPath);
  const outputPath = path.join(projectPath, '.codegraph', 'architecture.mmd');
  const result = await generateArchitectureDiagram(projectPath, !options.yes, outputPath);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  }

  if (!result.success) {
    throw new Error(result.errors.join('\n') || 'Architecture visualization failed');
  }

  if (!options.json) {
    console.log(`Architecture diagram generated: ${outputPath}`);
  }

  return result;
}
