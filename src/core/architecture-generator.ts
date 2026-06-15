// src/core/architecture-generator.ts

import * as path from 'path';
import * as fs from 'fs/promises';

// 项目类型
type ProjectType = 'frontend' | 'non-frontend';

// 图层类型
type LayerType = 'layer1' | 'layer2' | 'layer3' | 'callgraph';

// Mermaid 节点样式
type NodeType = 'route' | 'page' | 'component' | 'controller' | 'service' | 'database';

// 路由映射
interface RouteMapping {
  path: string;
  component: string;
  file: string;
}

// 组件信息
interface ComponentInfo {
  name: string;
  filePath: string;
  props?: Record<string, string>;
  children: string[];
  stateManagement?: string;
  apiCalls?: string[];
}

// 公共组件
interface CommonComponent {
  name: string;
  filePath: string;
  type: 'component' | 'util' | 'hook';
}

// 组件引用
interface ComponentReference {
  component: CommonComponent;
  referenceCount: number;
  isHighFrequency: boolean;
}

// 调用节点
interface CallNode {
  symbol: string;
  file: string;
  type: 'controller' | 'service' | 'database' | 'utility';
}

// 调用关系
interface CallRelation {
  caller: CallNode;
  callee: CallNode;
}

// 分层调用图
interface LayeredCallGraph {
  controllers: CallNode[];
  services: CallNode[];
  databases: CallNode[];
  utilities: CallNode[];
}

// 生成选项
interface GenerationOptions {
  projectPath: string;
  interactive: boolean;
  skipVisualization: boolean;
  outputPath: string;
}

// 生成结果
interface GenerationResult {
  success: boolean;
  layers: LayerType[];
  nodeCount: number;
  outputPath: string;
  errors: string[];
}
