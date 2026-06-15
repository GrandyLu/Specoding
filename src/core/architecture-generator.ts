// src/core/architecture-generator.ts

import * as path from 'path';
import * as fs from 'fs/promises';

// 项目类型
export type ProjectType = 'frontend' | 'non-frontend';

// 导出所有公共函数和类型
export {
  detectProjectType,
  generateLayer1Diagram,
  generateCallGraphDiagram,
  validateMermaidSyntax,
  applyStandardizedNamespace,
  applyFrontendColorCoding,
  applyNonFrontendColorCoding,
  applyMermaidStandards
};

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

  // 添加样式定义（必须在 subgraph 之前）
  mermaid += '  classDef routeStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px;\n';
  mermaid += '  classDef pageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;\n\n';

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

/**
 * 检测符号类型
 */
function detectSymbolType(symbol: string, filePath: string): CallNode['type'] {
  const lowerSymbol = symbol.toLowerCase();
  const lowerFile = filePath.toLowerCase();

  // 控制器检测
  if (lowerSymbol.includes('controller') ||
      lowerFile.includes('controller') ||
      lowerSymbol.includes('handler') ||
      lowerSymbol.includes('route')) {
    return 'controller';
  }

  // 数据库相关
  if (lowerSymbol.includes('db') ||
      lowerSymbol.includes('database') ||
      lowerSymbol.includes('repository') ||
      lowerSymbol.includes('model') ||
      lowerFile.includes('db')) {
    return 'database';
  }

  // 服务层
  if (lowerSymbol.includes('service') ||
      lowerSymbol.includes('business') ||
      lowerFile.includes('services')) {
    return 'service';
  }

  // 默认为工具类
  return 'utility';
}

/**
 * 查询调用关系图
 * 注意：这里简化实现，实际需要查询 codegraph.db
 */
async function queryCallGraph(dbPath: string): Promise<CallRelation[]> {
  // 简化实现：返回模拟数据
  // 实际实现需要使用 better-sqlite3 查询数据库
  return [];
}

/**
 * 按层次分组调用关系
 */
function layerCallGraph(relations: CallRelation[]): LayeredCallGraph {
  const layered = {
    controllers: [] as CallNode[],
    services: [] as CallNode[],
    databases: [] as CallNode[],
    utilities: [] as CallNode[]
  };

  const nodeMap = new Map<string, CallNode>();

  relations.forEach(rel => {
    if (!nodeMap.has(rel.caller.symbol)) {
      nodeMap.set(rel.caller.symbol, rel.caller);
    }
    if (!nodeMap.has(rel.callee.symbol)) {
      nodeMap.set(rel.callee.symbol, rel.callee);
    }
  });

  for (const [symbol, node] of nodeMap) {
    switch (node.type) {
      case 'controller':
        layered.controllers.push(node);
        break;
      case 'service':
        layered.services.push(node);
        break;
      case 'database':
        layered.databases.push(node);
        break;
      default:
        layered.utilities.push(node);
    }
  }

  return layered;
}

/**
 * 分块调用关系图
 */
function chunkCallGraph(layered: LayeredCallGraph, maxSize: number = 18): LayeredCallGraph[] {
  const allNodes = [
    ...layered.controllers.map(n => ({ ...n, type: 'controller' as const })),
    ...layered.services.map(n => ({ ...n, type: 'service' as const })),
    ...layered.databases.map(n => ({ ...n, type: 'database' as const })),
    ...layered.utilities.map(n => ({ ...n, type: 'utility' as const }))
  ];

  // 如果没有节点，返回一个空的 LayeredCallGraph
  if (allNodes.length === 0) {
    return [layered];
  }

  const nodeChunks = chunkArray(allNodes, maxSize);

  return nodeChunks.map(chunk => ({
    controllers: chunk.filter(n => n.type === 'controller'),
    services: chunk.filter(n => n.type === 'service'),
    databases: chunk.filter(n => n.type === 'database'),
    utilities: chunk.filter(n => n.type === 'utility')
  }));
}

/**
 * 生成单个调用关系图
 */
function generateSingleCallGraphDiagram(layered: LayeredCallGraph): string {
  let mermaid = 'graph TD\n\n';

  // 添加样式定义
  mermaid += '  classDef controllerStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;\n';
  mermaid += '  classDef serviceStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;\n';
  mermaid += '  classDef databaseStyle fill:#fffde7,stroke:#f9a825,stroke-width:2px;\n';
  mermaid += '  classDef utilityStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;\n\n';

  // 使用 subgraph 分组
  if (layered.controllers.length > 0) {
    mermaid += '  subgraph Controllers\n';
    layered.controllers.forEach((node, i) => {
      mermaid += `    Controller_${i}["${node.symbol}"]:::controllerStyle\n`;
    });
    mermaid += '  end\n\n';
  }

  if (layered.services.length > 0) {
    mermaid += '  subgraph Services\n';
    layered.services.forEach((node, i) => {
      mermaid += `    Service_${i}["${node.symbol}"]:::serviceStyle\n`;
    });
    mermaid += '  end\n\n';
  }

  if (layered.databases.length > 0) {
    mermaid += '  subgraph Database\n';
    layered.databases.forEach((node, i) => {
      mermaid += `    DB_${i}["${node.symbol}"]:::databaseStyle\n`;
    });
    mermaid += '  end\n\n';
  }

  return mermaid;
}

/**
 * 生成调用关系图
 */
async function generateCallGraphDiagram(projectPath: string, dbPath: string): Promise<string> {
  const callGraph = await queryCallGraph(dbPath);
  const layered = layerCallGraph(callGraph);
  const chunks = chunkCallGraph(layered, 18);

  if (chunks.length === 1) {
    return generateSingleCallGraphDiagram(chunks[0]);
  }

  // 多图情况：简化处理，返回第一张图
  return generateSingleCallGraphDiagram(chunks[0]);
}

/**
 * Mermaid 语法验证
 */
function validateMermaidSyntax(mermaid: string): void {
  const errors: string[] = [];

  // 检查基本语法错误
  if (!mermaid.startsWith('graph LR') && !mermaid.startsWith('graph TD') && !mermaid.startsWith('graph RL')) {
    errors.push('Mermaid diagram must start with graph direction (LR/TD/RL)');
  }

  // 检查未闭合的引号
  const quoteCount = (mermaid.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    errors.push('Unclosed quotes in Mermaid diagram');
  }

  // 检查 subgraph 配对
  const subgraphCount = (mermaid.match(/subgraph/g) || []).length;
  const endCount = (mermaid.match(/\bend\b/g) || []).length;
  if (subgraphCount !== endCount) {
    errors.push('Mismatched subgraph/end pairs');
  }

  if (errors.length > 0) {
    throw new Error(`Mermaid syntax validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * 应用标准化命名空间
 */
function applyStandardizedNamespace(mermaid: string, prefix: string): string {
  const keywords = new Set(['graph', 'subgraph', 'end', 'classDef', 'class', 'style', 'linkStyle', 'LR', 'TD', 'RL', 'fill', 'stroke', '%%']);

  // 分割行进行处理
  const lines = mermaid.split('\n');
  const processedLines = lines.map(line => {
    // 跳过空行、注释行和样式定义行
    if (!line.trim() || line.trim().startsWith('%%') || line.includes('classDef') || line.includes('fill:') || line.includes('stroke:')) {
      return line;
    }

    // 特殊处理 subgraph 行：不前缀化 subgraph 后面的名称
    if (line.trim().startsWith('subgraph ') || line.trim() === 'end') {
      return line;
    }

    // 处理每一行：识别节点ID并添加前缀
    // 节点ID通常出现在这些模式中：
    // - 作为边的起点或终点：A-->B, A-.->B
    // - 在方括号前：A[...]
    // - 在圆括号前：A(...)
    // - 在大括号前：A{...}

    // 先处理引号内的内容，保护它们不被替换
    const quoteContents: string[] = [];
    let protectedLine = line;

    // 替换引号内容为占位符
    protectedLine = protectedLine.replace(/"([^"]*)"/g, (match, content) => {
      quoteContents.push(content);
      return `"__QUOTE_${quoteContents.length - 1}__"`;
    });

    // 现在可以安全地替换节点ID
    // 使用更精确的正则表达式来识别节点ID
    protectedLine = protectedLine.replace(/([A-Za-z_]\w*)(?=\s*(?:-->|\.->|-\.->|\[|\(|\{))/g, (match) => {
      // 跳过关键词
      if (keywords.has(match)) return match;
      // 跳过已经前缀的
      if (match.startsWith(`${prefix}_`)) return match;
      // 添加前缀
      return `${prefix}_${match}`;
    });

    // 替换箭头符号后的节点ID
    protectedLine = protectedLine.replace(/(-->|\.->|-\.->)\s*([A-Za-z_]\w*)(?=\s*(?:\[|\(|\{|$))/g, (match, arrow, nodeId) => {
      // 跳过关键词
      if (keywords.has(nodeId)) return match;
      // 跳过已经前缀的
      if (nodeId.startsWith(`${prefix}_`)) return match;
      // 添加前缀
      return `${arrow} ${prefix}_${nodeId}`;
    });

    // 恢复引号内容
    protectedLine = protectedLine.replace(/"__QUOTE_(\d+)__"/g, (match, index) => {
      return `"${quoteContents[parseInt(index)]}"`;
    });

    return protectedLine;
  });

  return processedLines.join('\n');
}

/**
 * 应用颜色编码（前端样式）
 */
function applyFrontendColorCoding(mermaid: string): string {
  let result = mermaid;

  // 确保样式定义存在
  if (!result.includes('classDef')) {
    const styles = [
      '  classDef routeStyle fill:#e1f5fe,stroke:#01579b,stroke-width:2px',
      '  classDef pageStyle fill:#f3e5f5,stroke:#4a148c,stroke-width:2px',
      '  classDef componentStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px',
      '  classDef stateStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px',
      '  classDef apiStyle fill:#ffebee,stroke:#b71c1c,stroke-width:2px'
    ];

    const lines = result.split('\n');
    lines.splice(1, 0, ...styles);
    result = lines.join('\n');
  }

  return result;
}

/**
 * 应用颜色编码（非前端样式）
 */
function applyNonFrontendColorCoding(mermaid: string): string {
  let result = mermaid;

  if (!result.includes('classDef')) {
    const styles = [
      '  classDef controllerStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px',
      '  classDef serviceStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px',
      '  classDef databaseStyle fill:#fffde7,stroke:#f9a825,stroke-width:2px',
      '  classDef utilityStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px'
    ];

    const lines = result.split('\n');
    lines.splice(1, 0, ...styles);
    result = lines.join('\n');
  }

  return result;
}

/**
 * 应用 Mermaid 规范
 */
function applyMermaidStandards(
  mermaid: string,
  projectType: ProjectType,
  namespacePrefix: string = 'Project'
): string {
  let normalized = mermaid;

  // 1. 应用命名空间标准化
  normalized = applyStandardizedNamespace(normalized, namespacePrefix);

  // 2. 应用颜色编码
  normalized = projectType === 'frontend'
    ? applyFrontendColorCoding(normalized)
    : applyNonFrontendColorCoding(normalized);

  // 3. 验证 Mermaid 语法
  validateMermaidSyntax(normalized);

  return normalized;
}
