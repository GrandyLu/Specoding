---
comet_change: focus-queue
role: technical-design
canonical_spec: openspec
archived-with: 2026-06-10-focus-queue
status: final
---

# Focus Queue — 项目详情页优先级视图

## 问题

项目详情页（`/projects/:projectId`）展示任务列表和筛选，但用户无法快速判断「下一步该做什么」。`useProjectFilters` 的 `nextTask` 仅展示一条建议，不区分 blocked 状态，且不够醒目。

## 方案

在 ProjectDetailView 的 ProjectSummaryCard 和 ProjectTaskList 之间新增 **Focus Queue** 区域，展示按优先级排序的未完成任务列表。

### 架构

```
ProjectDetailView
  ├── ProjectSummaryCard   (现有，不变)
  ├── FocusQueue           (新增)
  │    └── useFocusQueue   (新增 composable)
  └── ProjectTaskList      (现有，不变)
       └── TaskFilterTabs
       └── useProjectFilters
```

新增 2 个文件，修改 2 个文件：

| 文件 | 操作 |
|------|------|
| `src/composables/useFocusQueue.js` | 新增 |
| `src/components/FocusQueue.vue` | 新增 |
| `src/views/ProjectDetailView.vue` | 修改（引入 FocusQueue） |
| `test/structure.test.js` | 修改（补充 4 条测试） |

### `useFocusQueue(tasks)` composable

**输入：** 任务数组（原始 Array，非 ref）

**输出：**
```ts
{
  items: Array<{ ...task, recommendation: string }>,
  isEmpty: boolean
}
```

**逻辑：**

1. 过滤：`task.status !== 'done'`
2. 排序（comparator 链）：
   - `blocked` 排最前（`a.status === 'blocked' ? -1 : 1`）
   - 同 status 按 `priority` 升序
   - 同 status 同 priority 按 `title` 字母序（`localeCompare`）
3. 为每条任务附加 `recommendation` 字段：
   - `status === 'blocked'` → `"Blocked work needs attention"`
   - `priority === 1` → `"High priority"`
   - 其他 → `"Ready to schedule"`

**与现有 composable 的边界：**
- `useProjectFilters`：管理 activeFilter 状态 + visibleTasks + nextTask（响应式，用于筛选交互）
- `useFocusQueue`：一次性排序 + 推荐原因（非响应式，纯展示）

两者独立，不互相调用，不共享状态。

### `FocusQueue.vue` 组件

**Props：**
- `tasks: Array` — 任务数组

**行为：**
- 调用 `useFocusQueue(tasks)` 获取排序结果
- `items.length > 0` 时渲染任务列表（标题、状态、优先级、推荐原因）
- `items.length === 0` 时渲染空状态 `"No open work for this project."`

### `ProjectDetailView.vue` 修改

在 `<ProjectSummaryCard>` 和 `<ProjectTaskList>` 之间插入：

```vue
<FocusQueue :tasks="tasks" />
```

导入 FocusQueue 组件和 `tasks` 数据源复用现有 computed。

### "open" 语义对照

| 位置 | 定义 | 用于 |
|------|------|------|
| `projectStore.summarizeProject` | `total - done`（含 blocked） | 汇总卡片指标 |
| `useProjectFilters.isOpenTask` | `todo + in_progress`（不含 blocked） | 筛选标签 |
| `useFocusQueue` | `status !== 'done'`（含 blocked） | 优先级队列 |

三处语义不同但各有道理，不强制统一。在 `useFocusQueue` 中注释说明。

## 测试策略

在 `test/structure.test.js` 中新增 4 条结构测试（文件内容断言）：

1. Focus Queue composable 只包含未完成任务（`status !== 'done'`）
2. blocked 任务排在最前
3. priority 小的任务排在前面
4. ProjectDetailView 仍然引用 ProjectTaskList（不破坏现有功能）

测试方式：读取源文件内容做正则匹配，不引入 Vue test utils，与现有测试风格一致。

## 风险

| 风险 | 缓解 |
|------|------|
| 三套 "open" 语义可能混淆 | composable 内注释说明差异 |
| FocusQueue 与 ProjectTaskList 数据源相同但展示不同 | 明确分离：FocusQueue 做排序推荐，ProjectTaskList 做筛选交互 |
