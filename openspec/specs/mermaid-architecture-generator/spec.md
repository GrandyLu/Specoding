## ADDED Requirements

### Requirement: Project type detection
系统 SHALL 在生成架构图前自动检测项目类型，判断是否为前端工程。

#### Scenario: Frontend project detection via package.json and dependencies
- **WHEN** 项目包含 package.json 且依赖 react/vue/angular
- **THEN** 系统识别为前端工程并启用三层架构生成

#### Scenario: Frontend project detection via directory structure
- **WHEN** 项目包含 src/components/ 或 src/views/ 目录结构
- **THEN** 系统识别为前端工程并启用三层架构生成

#### Scenario: Non-frontend project detection
- **WHEN** 项目不包含前端特征（无 package.json 或前端框架依赖）
- **THEN** 系统识别为非前端工程并生成调用关系图

### Requirement: Layer 1 global route graph generation
系统 SHALL 为前端工程自动生成全局路由图，展示路由到页面组件的映射关系。

#### Scenario: Auto-generate route graph on codegraph init
- **WHEN** 用户在前端项目运行 codegraph init
- **THEN** 系统扫描 router/index.ts、src/pages/、src/views/
- **AND** 生成 Layer 1 全局路由图使用 graph LR 格式
- **AND** 输出到 .codegraph/architecture.mmd

#### Scenario: Route graph node limit compliance
- **WHEN** 路由节点数量超过 20 个
- **THEN** 系统自动拆分为子图或分拆为多张图
- **AND** 使用 subgraph 分组相关路由

### Requirement: Layer 2 component tree generation
系统 SHALL 支持交互式选择特定模块，生成该模块的组件树和 Props 流向图。

#### Scenario: Interactive module selection
- **WHEN** Layer 1 生成完成后
- **THEN** 系统提示用户选择深入哪个模块（如 Orders/Users/Auth）
- **AND** 列出所有可用模块供选择

#### Scenario: Component tree generation for selected module
- **WHEN** 用户选择特定模块
- **THEN** 系统递归分析该模块的组件嵌套关系
- **AND** 使用 subgraph 隔离视图组件、状态管理、API 请求
- **AND** 追加 Layer 2 图到 .codegraph/architecture.mmd

#### Scenario: Props flow visualization
- **WHEN** 生成组件树时
- **THEN** 系统标注组件间的 Props 传递关系
- **AND** 使用箭头和标签显示数据流向

### Requirement: Layer 3 shared dependencies visualization
系统 SHALL 分析公共组件和工具库的依赖关系，生成被引用频次图。

#### Scenario: Common components dependency analysis
- **WHEN** 生成 Layer 3 图时
- **THEN** 系统扫描 src/components/common/ 和 src/utils/
- **AND** 计算每个公共组件被业务模块引用的频次
- **AND** 生成依赖关系图，高亮高频组件

#### Scenario: Hooks/composables visualization
- **WHEN** 项目使用 hooks（React）或 composables（Vue）
- **THEN** 系统在 Layer 3 图中包含 hooks/composables 的依赖关系

### Requirement: Non-frontend call graph generation
系统 SHALL 为非前端工程生成基于 callers/callees 的调用关系图。

#### Scenario: Call graph generation using codegraph data
- **WHEN** 用户在非前端项目运行 codegraph init
- **THEN** 系统查询 codegraph.db 中的 callers/callees 关系
- **AND** 生成单层调用关系图
- **AND** 输出到 .codegraph/architecture.mmd

#### Scenario: Call graph styling
- **WHEN** 生成调用关系图时
- **THEN** 系统使用不同颜色区分层次（控制器-蓝色，业务逻辑-绿色，数据库-黄色）

### Requirement: Mermaid diagram standards compliance
系统 SHALL 生成的 Mermaid 图符合可视化规范，确保图的可读性和可维护性。

#### Scenario: Node limit enforcement
- **WHEN** 单张图节点数量超过 15-20 个
- **THEN** 系统强制拆分为子图或多张图

#### Scenario: Color coding by type
- **WHEN** 生成架构图时
- **THEN** 系统使用 classDef 为不同类型节点着色
- **AND** 控制器/页面组件使用蓝色
- **AND** 业务组件使用绿色
- **AND** 数据库/API 调用使用黄色

#### Scenario: Standardized namespace
- **WHEN** 生成节点 ID
- **THEN** 系统使用模块前缀（如 User_Service、Order_Component）
- **AND** 防止同名类在不同模块时连线错乱

### Requirement: Interactive two-step generation
系统 SHALL 采用两步走交互生成方案，先生成 Layer 1，再按需生成 Layer 2/3。

#### Scenario: Step 1 - Layer 1 auto-generation
- **WHEN** codegraph init 完成
- **THEN** 系统自动生成 Layer 1 全局模块图
- **AND** 展示给用户并提示选择下一步

#### Scenario: Step 2 - Layer 2/3 on-demand generation
- **WHEN** Layer 1 展示完成
- **THEN** 系统提供选项"生成指定模块的深挖索引图"
- **AND** 用户选择后生成 Layer 2/3 图并追加到同一文件

### Requirement: Diagram update mechanism
系统 SHALL 支持用户手动更新架构图，重新运行 codegraph init 时覆盖旧图。

#### Scenario: Manual update via codegraph init
- **WHEN** 用户修改代码后重新运行 codegraph init
- **THEN** 系统覆盖 .codegraph/architecture.mmd
- **AND** 重新分析项目结构生成最新架构图

#### Scenario: Update failure handling
- **WHEN** 架构图生成失败
- **THEN** 系统输出错误信息但不影响 codegraph.db 生成
- **AND** 保留旧的 architecture.mmd（如果存在）

### Requirement: Integration with codegraph init
系统 SHALL 通过包装脚本集成到 codegraph init 流程，在索引生成完成后触发架构图生成。

#### Scenario: Trigger after codegraph init
- **WHEN** codegraph init 成功完成并生成 codegraph.db
- **THEN** 系统自动触发架构图生成脚本
- **AND** 输出 "Architecture diagram generated: .codegraph/architecture.mmd"

#### Scenario: Non-blocking architecture generation
- **WHEN** 架构图生成失败
- **THEN** codegraph init 仍然返回成功状态
- **AND** 不影响现有 CodeGraph 功能
