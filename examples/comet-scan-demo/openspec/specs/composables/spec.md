# Composable: useProjectFilters

## Overview

任务过滤逻辑的 composable，管理过滤状态和派生列表。定义在 `src/composables/useProjectFilters.js`。

## CodeGraph 调用图

```
useProjectFilters.js
  imports ──▶ vue (edge 91, line 1)
  ├─ taskFilterOptions  (exported constant, line 3-8)
  ├─ isOpenTask()       (function, line 10-12)
  ├─ matchesFilter()    (function, line 14-25) ──calls──▶ isOpenTask (edge 92, line 16)
  └─ useProjectFilters(tasks) (exported function, line 27-38) ──calls──▶ matchesFilter (edge 93, line 29)
```

**Impact (CodeGraph):** 改动 `isOpenTask` 影响 4 symbols — useProjectFilters.js 内部链路。

## 导出

### `taskFilterOptions` (constant, exported)

```js
[
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]
```

### `useProjectFilters(tasks)` (function, exported)

**参数：** `tasks` — Vue `ref` 或 `computed`，值为任务数组。

**返回：**

| 字段            | 类型      | 说明                                              |
|-----------------|-----------|--------------------------------------------------|
| activeFilter    | `ref<string>` | 当前过滤值，初始 `'open'`                    |
| visibleTasks    | `computed<Array>` | 经 matchesFilter 过滤后的任务列表          |
| nextTask        | `computed<Task|null>` | 按 `priority` 升序排列的第一个任务     |
| taskFilterOptions | `Array`   | 静态选项列表                                       |

**精确调用链：**
```
useProjectFilters(tasks)
  └─ activeFilter = ref('open')
  └─ visibleTasks = computed(() =>
       tasks.value.filter(task => matchesFilter(task, activeFilter.value))
     )                                    ← edge 93: calls matchesFilter (line 29)
  └─ nextTask = computed(() =>
       visibleTasks.value.slice().sort((a, b) => a.priority - b.priority)[0] ?? null
     )
```

## 内部函数

### `isOpenTask(task)` — line 10-12

`true` 当 `task.status === 'todo' || task.status === 'in_progress'`。

**Callers (CodeGraph):** `matchesFilter` (line 16)

### `matchesFilter(task, filter)` — line 14-25

| filter 值   | 行为                                     |
|-------------|------------------------------------------|
| `'open'`    | 调用 `isOpenTask(task)`                  |
| `'blocked'` | `task.status === 'blocked'`              |
| `'done'`    | `task.status === 'done'`                 | 
| 其他（含 `'all'`） | `true`（不过滤）                  |

## 与 store 的语义差异

| 位置 | `open` 的定义 |
|------|-------------|
| `useProjectFilters.isOpenTask()` | `status === 'todo'` 或 `'in_progress'` |
| `projectStore.summarizeProject()` | `total - done`（包含 `blocked` 和 `todo` 和 `in_progress`）|

**两处对 "open" 的语义不同。** store 的 `open` 包含 blocked 任务，composable 的 `open` 不包含。待确认哪个为准。

## 待确认

- `nextTask` 的排序按 `priority` 升序 — 数字越小优先级越高。是否有意？
- `activeFilter` 硬编码初始值为 `'open'`，无持久化。
