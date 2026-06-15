// src/core/architecture-generator.ts

import * as path from 'path';
import * as fs from 'fs/promises';

// 项目类型
export type ProjectType = 'frontend' | 'non-frontend';

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
  return await fs.readFile(filePath, encoding);
}

/**
 * 写入文件
 */
async function writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, encoding);
}

/**
 * 追加内容到文件
 */
async function appendToFile(filePath: string, content: string, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  await fs.appendFile(filePath, content, encoding);
}

/**
 * 读取 JSON 文件
 */
async function readJsonFile<T = any>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  return JSON.parse(content) as T;
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
