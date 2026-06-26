# comet-scan-vue-demo — 项目总览

## 简介

Vue 3 SPA 项目任务看板。3 页面路由、5 共享组件、1 composable、1 纯函数 store。基于 Vite 构建。

## 技术栈

- **Framework:** Vue 3.5 + Composition API (`<script setup>`)
- **Router:** Vue Router 4.4 (HTML5 History)
- **Build:** Vite 5.4 + @vitejs/plugin-vue
- **模块系统:** ESM (`"type": "module"`)
- **测试:** `node:test` + `node:assert/strict`（结构测试）
- **Store:** 纯函数模块（非 Pinia/Vuex）
- **Node:** >= 20

## CodeGraph 索引

| 指标       | 值                              |
|------------|--------------------------------|
| 文件数     | 15 (vue: 8, javascript: 7)     |
| 节点数     | 74 (import: 30, file: 14, constant: 13, function: 9, component: 8) |
| 边数       | 130 (contains: 82, imports: 30, calls: 18) |
| unresolved | 0                              |

## 完整调用图 (CodeGraph callees/callers + DB edges)

```
main.js
  imports ──▶ vue, App.vue, ./router, ./styles.css
  → createApp(App).use(router).mount('#app')

App.vue
  imports ──▶ vue-router (RouterView), SidebarNav, projectStore
  calls ──▶ listProjects()
  template ──▶ <SidebarNav :projects> + <RouterView>

SidebarNav.vue
  imports ──▶ vue-router (RouterLink)
  props: projects: Array

DashboardView.vue
  imports ──▶ vue-router (RouterLink), ProjectSummaryCard, projectStore
  calls ──▶ summarizeDashboard()
  template ──▶ <ProjectSummaryCard> × N (wrapped in RouterLink)

ProjectDetailView.vue
  imports ──▶ vue (computed), vue-router, ProjectSummaryCard, ProjectTaskList, projectStore
  calls ──▶ getProject(), listTasks(), summarizeProject()
  template ──▶ <ProjectSummaryCard> + <ProjectTaskList> (or "not found")

ProjectTaskList.vue
  imports ──▶ vue (computed), TaskFilterTabs, useProjectFilters
  calls ──▶ useProjectFilters()
  template ──▶ <TaskFilterTabs> + task list

TaskFilterTabs.vue
  props: modelValue, options
  emits: update:modelValue

useProjectFilters.js
  imports ──▶ vue (computed, ref)
  calls: useProjectFilters ──▶ matchesFilter ──▶ isOpenTask

projectStore.js
  imports ──▶ ../data/projects (projects, tasks)
  calls: summarizeDashboard ──▶ projects + summarizeProject
  calls: summarizeProject ──▶ listTasks
  calls: getProject ──▶ projects.find()
  calls: listTasks ──▶ tasks.filter()
```

## 路由 → 组件映射

| path                  | component           | imports 边 (DB) |
|-----------------------|---------------------|-----------------|
| `/`                   | DashboardView       | edge 99         |
| `/projects/:projectId`| ProjectDetailView   | edge 100        |
| `/settings`           | SettingsView        | edge 101        |

## Impact 分析 (CodeGraph)

| 改动目标            | 影响范围                                       |
|---------------------|-----------------------------------------------|
| `projects` 数据     | 11 symbols — projects.js + projectStore + App + DashboardView + ProjectDetailView + main.js |
| `summarizeProject`  | 7 symbols — projectStore + DashboardView + ProjectDetailView + router/index.js |
| `listTasks`         | 5 symbols — projectStore + ProjectDetailView  |
| `isOpenTask`        | 4 symbols — useProjectFilters.js 内部链路      |

## 能力 Spec

| 能力        | 文件                                      | 说明                    |
|-------------|-------------------------------------------|------------------------|
| 路由系统    | `openspec/specs/router/spec.md`           | Vue Router 配置         |
| 数据层/Store| `openspec/specs/data-store/spec.md`       | 数据模型 + store 函数    |
| 组件体系    | `openspec/specs/components/spec.md`       | 5 个 SFC 组件           |
| Composable  | `openspec/specs/composables/spec.md`      | useProjectFilters       |
| 页面视图    | `openspec/specs/views/spec.md`            | 3 个页面视图             |

## 测试覆盖

`test/structure.test.js` — 结构断言测试（不依赖 npm install）：

| 场景                                       | 状态   |
|--------------------------------------------|--------|
| 路由表包含 3 条 path + component 映射      | 已覆盖 |
| ProjectDetailView 引用 ProjectSummaryCard + ProjectTaskList | 已覆盖 |
| ProjectTaskList 引用 TaskFilterTabs + useProjectFilters | 已覆盖 |
| useProjectFilters 包含 isOpenTask + matchesFilter + filter + visibleTasks + nextTask | 已覆盖 |

**未覆盖：**
- Store 函数的业务逻辑（summarizeProject 计算正确性、listTasks 过滤行为）
- 组件渲染输出
- 路由导航行为
- Composable 响应式状态变化

## 不确定性清单

### 待确认推断

1. **`open` 语义不一致** — store 的 `open = total - done`（含 blocked），composable 的 `open = todo + in_progress`（不含 blocked）。两处语义矛盾。
2. **非响应式 store 调用** — App、DashboardView 在 `<script setup>` 顶层直接调用 store 函数，数据变更不会触发 UI 更新。是否有意设计？
3. **SettingsView 无功能** — checkbox 无状态绑定，推断为占位 UI。
4. **`priority` 排序方向** — `nextTask` 按 `priority` 升序（数字小优先）。是否有意？
5. **`listProjects()` 返回原始引用** — 调用方可直接修改数据。是否需要保护？
6. **`health` CSS class** — `health-at-risk` / `health-on-track` / `health-blocked` 样式需在 `styles.css` 中定义。

### CodeGraph 盲区

7. **路由表内部结构未深度解析** — `routes` constant 被识别但 path→component 映射未展开为独立节点。
8. **SettingsView 内容为空** — 无内部 symbols。
9. **CSS 文件未索引** — `styles.css` 不在索引中。
10. **template 中的数据绑定未追踪** — 如 `v-for="project in summaries"` 中的数据流。

### 代码结构盲区

11. 无业务逻辑单元测试（仅结构断言）
12. 无 E2E / 组件渲染测试
13. 无错误边界处理（项目 ID 不存在时的 computed 可能返回 null）
