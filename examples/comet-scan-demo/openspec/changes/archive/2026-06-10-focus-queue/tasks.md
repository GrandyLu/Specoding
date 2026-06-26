## 1. Composable 实现

- [x] 1.1 创建 `src/composables/useFocusQueue.js`：实现 `getRecommendation(task)` 推荐原因函数
- [x] 1.2 实现 `useFocusQueue(tasks)` 主函数：过滤（status !== 'done'）+ 排序（blocked 优先 → priority 升序 → title 字母序）+ 为每条任务附加推荐原因

## 2. 组件实现

- [x] 2.1 创建 `src/components/FocusQueue.vue`：接收 `tasks` prop，调用 `useFocusQueue`，渲染排序后的任务列表（标题、状态、优先级、推荐原因）
- [x] 2.2 FocusQueue 空状态：无未完成任务时显示 "No open work for this project."

## 3. 集成到页面

- [x] 3.1 修改 `src/views/ProjectDetailView.vue`：在 ProjectSummaryCard 和 ProjectTaskList 之间引入 FocusQueue，传入相同 tasks 数据

## 4. 测试

- [x] 4.1 在 `test/structure.test.js` 中新增测试：验证 FocusQueue 只包含未完成任务
- [x] 4.2 新增测试：验证 blocked 任务排在最前
- [x] 4.3 新增测试：验证 priority 小的任务排在前面
- [x] 4.4 新增测试：验证 ProjectDetailView 仍然引用 ProjectTaskList
