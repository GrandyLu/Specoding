# 数据层与 Store

## Overview

纯函数式 store（非 Pinia/Vuex），从静态数据模块读取项目与任务。定义在 `src/stores/projectStore.js`，数据源 `src/data/projects.js`。

## CodeGraph 调用图

```
projectStore.js
  imports ──▶ ../data/projects (edge 102, line 1)
  └─ listProjects()       (exported, line 3-5)
  └─ getProject(projectId) (exported, line 7-9) ──calls──▶ projects constant (edge 103, line 8)
  └─ listTasks(projectId) (exported, line 11-16) ──calls──▶ tasks constant (edge 104, line 15)
  └─ summarizeProject(project) (exported, line 18-31) ──calls──▶ listTasks (edge 105, line 19)
  └─ summarizeDashboard() (exported, line 33-35) ──calls──▶ projects (edge 106) + summarizeProject (edge 107, line 34)
```

## 数据模型

### projects (src/data/projects.js:1-23)

| Field       | Type   | 示例       |
|-------------|--------|-----------|
| id          | string | `'alpha'` |
| name        | string | `'Alpha Launch'` |
| owner       | string | `'Mira'`  |
| health      | string | `'at-risk'` |
| description | string | `'Prepare the launch dashboard...'` |

health 可选值（推断自数据）：`'at-risk'` | `'on-track'` | `'blocked'`

### tasks (src/data/projects.js:25-33)

| Field      | Type   | 示例           |
|------------|--------|---------------|
| id         | string | `'t-1'`       |
| projectId  | string | `'alpha'`     |
| title      | string | `'Write launch checklist'` |
| status     | string | `'done'`      |
| priority   | number | `2`           |

status 可选值（推断自数据）：`'todo'` | `'in_progress'` | `'blocked'` | `'done'`

## Store 函数

### `listProjects()` — line 3-5

返回 `projects` 数组引用（非拷贝）。

**Callers (CodeGraph):** `App.vue` (line 16)

### `getProject(projectId)` — line 7-9

通过 `.find()` 查找项目，未找到返回 `null`。

**Callers (CodeGraph):** `ProjectDetailView.vue` (line 34)

### `listTasks(projectId?)` — line 11-16

- `projectId` 为 falsy 时返回全量 `tasks` 数组。
- 否则按 `task.projectId === projectId` 过滤。

**Callers (CodeGraph):** `summarizeProject` (line 19), `ProjectDetailView.vue` (line 35)

### `summarizeProject(project)` — line 18-31

调用 `listTasks(project.id)` 获取项目任务，计算汇总指标：

| 返回字段   | 计算方式                                      |
|-----------|-----------------------------------------------|
| `...project` | 展开原始 project 字段                        |
| total     | `projectTasks.length`                         |
| done      | `status === 'done'` 的数量                    |
| open      | `total - done`（**注意：包含 blocked**）      |
| blocked   | `status === 'blocked'` 的数量                 |

**Callers (CodeGraph):** `summarizeDashboard` (line 34), `ProjectDetailView.vue` (line 36)
**Impact (CodeGraph):** 改动影响 7 symbols — projectStore.js + DashboardView.vue + ProjectDetailView.vue + router/index.js

### `summarizeDashboard()` — line 33-35

调用 `projects.map(project => summarizeProject(project))`。

**Callees (CodeGraph):** `projects` constant, `summarizeProject`
**Callers (CodeGraph):** `DashboardView.vue` (line 21)

## 待确认

- `listProjects()` 返回原始数组引用，调用方可直接修改。是否需要浅拷贝保护？
- `summarizeProject` 的 `open` 字段计算为 `total - done`，这包含了 `blocked` 状态的任务。与 `useProjectFilters.isOpenTask()` 的定义（`todo` + `in_progress`）语义不同。**待确认哪个是正确语义。**
- 数据完全静态，无异步加载。是否计划接入 API？
