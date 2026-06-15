// src/core/architecture-generator.ts

import * as path from 'path';
import * as fs from 'fs/promises';

// 项目类型
export type ProjectType = 'frontend' | 'non-frontend';

// 导出项目类型和检测函数
export { detectProjectType, generateLayer1Diagram };

// 图层类型
export type LayerType = 'layer1' | 'layer2' | 'layer3' | 'callgraph';

// Mermaid 节点样式
export type NodeType = 'route' | 'page' | 'component' | 'controller' | 'service' | 'database';

// 路由映射
export interface RouteMapping {
  path: string;
  component: string;
  file: string;
}

// 组件信息
export interface ComponentInfo {
  name: string;
  filePath: string;
  props?: Record<string, string>;
  children: string[];
  stateManagement?: string;
  apiCalls?: string[];
}

// 公共组件
export interface CommonComponent {
  name: string;
  filePath: string;
  type: 'component' | 'util' | 'hook';
}

// 组件引用
export interface ComponentReference {
  component: CommonComponent;
  referenceCount: number;
  isHighFrequency: boolean;
}

// 调用节点
export interface CallNode {
  symbol: string;
  file: string;
  type: 'controller' | 'service' | 'database' | 'utility';
}

// 调用关系
export interface CallRelation {
  caller: CallNode;
  callee: CallNode;
}

// 分层调用图
export interface LayeredCallGraph {
  controllers: CallNode[];
  services: CallNode[];
  databases: CallNode[];
  utilities: CallNode[];
}

// 生成选项
export interface GenerationOptions {
  projectPath: string;
  interactive: boolean;
  skipVisualization: boolean;
  outputPath: string;
}

// 生成结果
export interface GenerationResult {
  success: boolean;
  layers: LayerType[];
  nodeCount: number;
  outputPath: string;
  errors: string[];
}

/**
 * 检查文件是否存在
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查目录是否存在
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 读取文件内容
 */
async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  try {
    return await fs.readFile(filePath, encoding);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * 写入文件
 */
async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * 追加内容到文件
 */
async function appendToFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  try {
    await fs.appendFile(filePath, content, encoding);
  } catch (error) {
    throw new Error(`Failed to append to file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * 读取 JSON 文件
 */
async function readJsonFile<T = any>(filePath: string): Promise<T> {
  try {
    const content = await readFile(filePath);
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read or parse JSON file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * 分块数组
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 统计 Mermaid 节点数量
 */
function countNodes(mermaid: string): number {
  // 统计方括号内的节点定义（简单估算）
  const matches = mermaid.match(/\w+\[/g);
  return matches ? matches.length : 0;
}

/**
 * 从路径提取模块名
 */
function extractModuleFromPath(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);
  if (segments.length === 0) return 'root';
  if (segments[0].startsWith(':')) return 'dynamic';
  return segments[0];
}

/**
 * 检测项目类型（前端/非前端）
 * 混合检测策略：package.json + 目录结构
 */
async function detectProjectType(projectPath: string): Promise<ProjectType> {
  const hasPackageJson = await fileExists(path.join(projectPath, 'package.json'));

  if (!hasPackageJson) {
    // 检查目录结构
    const hasComponentsDir = await directoryExists(path.join(projectPath, 'src/components'));
    const hasViewsDir = await directoryExists(path.join(projectPath, 'src/views'));

    return (hasComponentsDir || hasViewsDir) ? 'frontend' : 'non-frontend';
  }

  // 读取 package.json 检查依赖
  try {
    const pkg = await readJsonFile<{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }>(
      path.join(projectPath, 'package.json')
    );
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

    const hasFrontendDeps = Object.keys(dependencies).some(dep =>
      dep === 'react' || dep === 'vue' || dep === 'angular' ||
      dep.startsWith('@react') || dep.startsWith('@vue') || dep.startsWith('@angular')
    );

    if (hasFrontendDeps) return 'frontend';
  } catch (error) {
    // package.json 读取失败，继续检查目录结构
  }

  // 再次检查目录结构（双重确认）
  const hasComponentsDir = await directoryExists(path.join(projectPath, 'src/components'));
  const hasViewsDir = await directoryExists(path.join(projectPath, 'src/views'));

  return (hasComponentsDir || hasViewsDir) ? 'frontend' : 'non-frontend';
}

/**
 * 扫描路由文件
 */
async function scanRouteFiles(projectPath: string): Promise<RouteMapping[]> {
  const routeFiles = [
    'src/router/index.ts',
    'src/router/index.js',
    'src/routes.ts',
    'src/routes.js',
    'src/pages/index.ts',
    'src/views/index.ts'
  ];

  const routes: RouteMapping[] = [];

  for (const file of routeFiles) {
    const filePath = path.join(projectPath, file);
    if (await fileExists(filePath)) {
      const fileRoutes = await extractRouteMappings(filePath);
      routes.push(...fileRoutes);
    }
  }

  return routes;
}

/**
 * 从路由文件提取路由映射
 */
async function extractRouteMappings(filePath: string): Promise<RouteMapping[]> {
  try {
    const content = await readFile(filePath);
    const routes: RouteMapping[] = [];

    // 简单的路由解析：查找 { path: 'xxx', component: 'xxx' } 模式
    // 支持多种格式：JSON ({'path':...}) 和 对象字面量 ({path:...})
    const routePattern = /{['"]?\s*path\s*['"]?\s*:\s*['"]([^'"]+)['"]\s*,\s*['"]?\s*component\s*['"]?\s*:\s*['"]([^'"]+)['"]\s*}/g;
    let match;

    while ((match = routePattern.exec(content)) !== null) {
      routes.push({
        path: match[1],
        component: match[2],
        file: filePath
      });
    }

    return routes;
  } catch (error) {
    console.warn(`Failed to parse route file ${filePath}: ${error}`);
    return [];
  }
}

/**
 * 智能分组路由
 */
function chunkByModule(routes: RouteMapping[]): RouteMapping[][] {
  if (routes.length === 0) {
    return [];
  }

  const chunks: RouteMapping[][] = [];
  const MAX_ROUTES_PER_CHUNK = 18;

  // 不分组，直接按数量分块
  for (let i = 0; i < routes.length; i += MAX_ROUTES_PER_CHUNK) {
    chunks.push(routes.slice(i, i + MAX_ROUTES_PER_CHUNK));
  }

  return chunks;
}

/**
 * 生成单个 Layer 1 图表
 */
function generateSingleLayer1Diagram(routes: RouteMapping[]): string {
  let mermaid = 'graph LR\n';

  // 添加样式定义
  mermaid += '  classDef routeStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n';
  mermaid += '  classDef pageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;\n\n';

  // 添加节点和边
  routes.forEach((route, index) => {
    const routeId = `Route_${index}`;
    const pageId = `Page_${index}`;

    mermaid += `  ${routeId}[${route.path}]:::routeStyle\n`;
    mermaid += `  ${pageId}[${route.component}]:::pageStyle\n`;
    mermaid += `  ${routeId} --> ${pageId}\n`;
  });

  return mermaid;
}

/**
 * 生成多个 Layer 1 图表（使用 subgraph）
 */
function generateMultiLayer1Diagram(chunks: RouteMapping[][]): string {
  let mermaid = 'graph LR\n\n';

  chunks.forEach((chunk, chunkIndex) => {
    mermaid += `  subgraph Module_${chunkIndex}\n`;

    chunk.forEach((route, index) => {
      const routeId = `Route_${chunkIndex}_${index}`;
      const pageId = `Page_${chunkIndex}_${index}`;

      mermaid += `    ${routeId}[${route.path}]:::routeStyle\n`;
      mermaid += `    ${pageId}[${route.component}]:::pageStyle\n`;
      mermaid += `    ${routeId} --> ${pageId}\n`;
    });

    mermaid += '  end\n\n';
  });

  // 添加样式定义
  mermaid += '  classDef routeStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n';
  mermaid += '  classDef pageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;\n';

  return mermaid;
}

/**
 * 生成 Layer 1 全局路由图
 */
async function generateLayer1Diagram(projectPath: string): Promise<string> {
  const routes = await scanRouteFiles(projectPath);
  const chunks = chunkByModule(routes);

  if (chunks.length === 1) {
    return generateSingleLayer1Diagram(chunks[0]);
  }

  return generateMultiLayer1Diagram(chunks);
}
