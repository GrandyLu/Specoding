## MODIFIED Requirements

### Requirement: ProjectDetailView SHALL render Focus Queue component

ProjectDetailView 在 ProjectSummaryCard 和 ProjectTaskList 之间 SHALL 渲染 FocusQueue 组件。FocusQueue 接收与 ProjectTaskList 相同的 `tasks` 数据源。

#### Scenario: Focus Queue 出现在 summary card 和 task list 之间
- **WHEN** 用户访问 `/projects/:projectId`
- **THEN** 页面布局顺序为：ProjectSummaryCard → FocusQueue → ProjectTaskList

#### Scenario: ProjectDetailView 仍然引用 ProjectTaskList
- **WHEN** 用户访问 `/projects/:projectId`
- **THEN** ProjectTaskList 组件正常渲染，筛选行为不受影响

#### Scenario: 无未完成任务时显示空状态
- **WHEN** 项目所有任务 status 均为 `done`
- **THEN** FocusQueue 区域显示 "No open work for this project."
