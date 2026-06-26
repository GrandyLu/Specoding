---
change: focus-queue
design-doc: docs/superpowers/specs/2026-06-10-focus-queue-design.md
base-ref: 8f9a725c3bf56fb8df7c4fe342cf48749fd7ee1c
archived-with: 2026-06-10-focus-queue
---

# Focus Queue 实施计划

## 任务 1: 创建 useFocusQueue composable

**文件：** `src/composables/useFocusQueue.js`

**步骤：**
1. 创建 `getRecommendation(task)` 纯函数
2. 创建 `useFocusQueue(tasks)` 主函数：过滤 → 排序 → 附加 recommendation
3. 导出 `useFocusQueue` 和 `getRecommendation`

**验证：** 文件存在，导出两个函数

## 任务 2: 创建 FocusQueue 组件

**文件：** `src/components/FocusQueue.vue`

**步骤：**
1. 创建 SFC，接收 `tasks` prop
2. 调用 `useFocusQueue(tasks)` 获取排序结果
3. 渲染任务列表（标题、状态、优先级、推荐原因）
4. 空状态："No open work for this project."

**验证：** 文件存在，引用 useFocusQueue

## 任务 3: 集成到 ProjectDetailView

**文件：** `src/views/ProjectDetailView.vue`

**步骤：**
1. 导入 FocusQueue 组件
2. 在 ProjectSummaryCard 和 ProjectTaskList 之间插入 `<FocusQueue :tasks="tasks" />`

**验证：** 文件包含 FocusQueue import 和使用

## 任务 4: 补充结构测试

**文件：** `test/structure.test.js`

**步骤：**
1. 新增 describe 'Focus Queue' 块
2. 测试：composable 只包含未完成任务
3. 测试：blocked 任务排在最前
4. 测试：priority 小的排在前面
5. 测试：ProjectDetailView 仍引用 ProjectTaskList

**验证：** `npm test` 全部通过
