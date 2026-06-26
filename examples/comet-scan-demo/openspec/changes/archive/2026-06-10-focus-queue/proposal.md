## Why

项目详情页（`/projects/:projectId`）当前通过 `ProjectTaskList` + `TaskFilterTabs` 展示任务列表和筛选，但用户无法快速判断「下一步该做什么」。需要一个优先级视图，帮助用户进入项目后立刻看到需要关注的工作。

## What Changes

- 在 `ProjectDetailView` 中摘要卡片与任务列表之间新增 **Focus Queue** 区域
- Focus Queue 仅展示当前项目的未完成任务（`todo`、`in_progress`、`blocked`），按以下规则排序：
  1. `blocked` 状态优先级最高
  2. 其次按 `priority` 字段升序（数字越小越优先）
  3. 最后按任务标题字母序
- 每条任务展示：标题、状态、优先级、推荐原因
- 推荐原因逻辑：
  - `blocked` → "Blocked work needs attention"
  - `priority === 1` → "High priority"
  - 其他 → "Ready to schedule"
- 无未完成任务时显示空状态："No open work for this project."
- 不改变现有路由（`/`、`/projects/:projectId`、`/settings`）
- 不破坏现有任务筛选行为（`ProjectTaskList` + `useProjectFilters`）

## Capabilities

### New Capabilities

- `focus-queue`: Focus Queue 组件和排序/推荐逻辑

### Modified Capabilities

- `views`: ProjectDetailView 新增 Focus Queue 区域

## Impact

- **新增文件**：`src/composables/useFocusQueue.js`、`src/components/FocusQueue.vue`
- **修改文件**：`src/views/ProjectDetailView.vue`（引入并渲染 FocusQueue）
- **修改文件**：`test/structure.test.js`（补充 Focus Queue 相关结构测试）
- **不影响**：路由定义、现有组件（ProjectSummaryCard、ProjectTaskList、TaskFilterTabs）、现有 composable（useProjectFilters）、store 函数
