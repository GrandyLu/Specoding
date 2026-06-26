## Context

项目详情页 `ProjectDetailView` 当前结构：

```
ProjectDetailView
  ├── ProjectSummaryCard  (汇总指标)
  └── ProjectTaskList     (任务列表 + 筛选)
       └── TaskFilterTabs
       └── useProjectFilters (筛选逻辑 + nextTask)
```

`useProjectFilters` 已有 `nextTask` 概念（按 priority 升序取第一个），但仅展示一条，且不区分 blocked 状态。用户需要更全面的优先级视图。

**约束：**
- 数据完全静态（`src/data/projects.js`），无异步
- Store 为纯函数模块，非响应式
- 项目使用 Vue 3 Composition API + `<script setup>`
- 已有三套 "open" 定义（store/composable/Focus Queue 各不同），需明确区分

## Goals / Non-Goals

**Goals:**
- 在项目详情页提供一目了然的优先级视图
- Focus Queue 逻辑独立封装，不侵入现有筛选行为
- 补充结构测试验证 Focus Queue 存在性和排序规则

**Non-Goals:**
- 不改变现有路由或导航结构
- 不修改 `useProjectFilters` 或 `ProjectTaskList`
- 不引入新的响应式 store 或 Pinia
- 不做拖拽排序或交互式优先级调整

## Decisions

### D1: Focus Queue 逻辑封装为独立 composable

**选择：** 新建 `src/composables/useFocusQueue.js`

**替代方案：** 扩展 `useProjectFilters`

**理由：** Focus Queue 的过滤条件（非 done）和排序规则（blocked 优先 → priority → 标题）与现有筛选（all/open/blocked/done + activeFilter 状态）完全不同。分离可避免职责混合，且 Focus Queue 不需要响应式状态切换。

### D2: FocusQueue 为独立 SFC 组件

**选择：** 新建 `src/components/FocusQueue.vue`

**理由：** 接收 `tasks` prop，内部调用 `useFocusQueue` 处理排序和推荐原因。与 `ProjectTaskList` 平级，由 `ProjectDetailView` 控制布局。

### D3: 推荐原因由纯函数计算

**选择：** composable 内部 `getRecommendation(task)` 函数

```js
function getRecommendation(task) {
  if (task.status === 'blocked') return 'Blocked work needs attention';
  if (task.priority === 1) return 'High priority';
  return 'Ready to schedule';
}
```

**理由：** 纯函数，易于测试。推荐原因映射明确，无需配置化。

### D4: "未完成" 定义为 status !== 'done'

**选择：** `task.status !== 'done'`（即 todo + in_progress + blocked）

**理由：** 与现有 `useProjectFilters.isOpenTask()`（todo + in_progress）不同。Focus Queue 需要包含 blocked 任务（blocked 排最前），因此不能用 `isOpenTask`。不修改 `isOpenTask` 避免影响现有筛选行为。

## Risks / Trade-offs

- **三套 "open" 语义并存** → Focus Queue 使用 `status !== 'done'` 最宽松的定义。在 composable 内注释说明语义差异。不统一三套定义为 Non-Goal。
- **FocusQueue 组件无空状态测试** → 结构测试仅验证文件存在和排序函数行为。渲染测试需要 Vue test utils，当前项目未引入。
