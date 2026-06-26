## ADDED Requirements

### Requirement: Focus Queue composable SHALL filter and sort open tasks

`useFocusQueue(tasks)` composable SHALL 接收任务数组，返回排序后的未完成任务列表。未完成定义为 `task.status !== 'done'`（即包含 `todo`、`in_progress`、`blocked`）。

排序规则（按优先级从高到低）：
1. `blocked` 状态排在最前
2. 其次按 `priority` 字段升序（数字越小越优先）
3. 最后按 `title` 字母序（localeCompare）

#### Scenario: 只包含未完成任务
- **WHEN** 任务列表包含 status 为 `done`、`todo`、`in_progress`、`blocked` 的任务
- **THEN** Focus Queue 仅返回 status 非 `done` 的任务

#### Scenario: blocked 任务排在最前
- **WHEN** 任务列表包含 status 为 `todo`（priority 1）和 `blocked`（priority 3）的任务
- **THEN** blocked 任务排在 todo 任务之前

#### Scenario: priority 小的任务排在前面
- **WHEN** 两个任务 status 相同（均为 `todo`），priority 分别为 1 和 3
- **THEN** priority 为 1 的任务排在前面

#### Scenario: 同 status 同 priority 按标题字母序
- **WHEN** 两个任务 status 相同、priority 相同，title 分别为 "Alpha" 和 "Beta"
- **THEN** "Alpha" 排在 "Beta" 之前

### Requirement: Focus Queue composable SHALL 为每条任务生成推荐原因

`getRecommendation(task)` 函数 SHALL 根据任务状态和优先级返回推荐原因字符串：

| 条件（按优先级） | 返回值 |
|-----------------|--------|
| `status === 'blocked'` | `"Blocked work needs attention"` |
| `priority === 1` | `"High priority"` |
| 其他 | `"Ready to schedule"` |

#### Scenario: blocked 任务推荐原因为 Blocked work needs attention
- **WHEN** 任务 status 为 `blocked`，priority 为 2
- **THEN** 推荐原因为 `"Blocked work needs attention"`

#### Scenario: priority 1 非阻塞任务推荐原因为 High priority
- **WHEN** 任务 status 为 `todo`，priority 为 1
- **THEN** 推荐原因为 `"High priority"`

#### Scenario: 其他任务推荐原因为 Ready to schedule
- **WHEN** 任务 status 为 `in_progress`，priority 为 2
- **THEN** 推荐原因为 `"Ready to schedule"`

### Requirement: Focus Queue composable SHALL 返回空数组当无未完成任务

#### Scenario: 项目所有任务均已完成
- **WHEN** 所有任务 status 均为 `done`
- **THEN** Focus Queue 返回空数组
