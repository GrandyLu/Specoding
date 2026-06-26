# 组件体系

## Overview

5 个 Vue 3 SFC 组件（Composition API + `<script setup>`），无 Pinia/Vuex。

## CodeGraph 组件调用图

```
App (src/App.vue)
  ├── SidebarNav        (component calls, edge 126)
  └── <RouterView>      (vue-router)

DashboardView (src/views/DashboardView.vue)
  └── ProjectSummaryCard (component calls, edge 128)

ProjectDetailView (src/views/ProjectDetailView.vue)
  ├── ProjectSummaryCard (component calls, edge 129)
  └── ProjectTaskList    (component calls, edge 130)
       └── TaskFilterTabs (component calls, edge 127)
```

## 各组件详情

### App (src/App.vue:1-16)

**职责：** 应用外壳，左侧 SidebarNav + 右侧 RouterView。

**Props:** 无

**Imports (CodeGraph):**
- `RouterView` from `vue-router` (line 11)
- `SidebarNav` from `./components/SidebarNav.vue` (line 13)
- `listProjects` from `./stores/projectStore` (line 13)

**Calls (CodeGraph):** `listProjects()` (line 16) → `projects` constant

**行为：** 调用 `listProjects()` 获取项目列表，通过 `:projects` prop 传入 SidebarNav。

### SidebarNav (src/components/SidebarNav.vue:1-23)

**职责：** 左侧导航栏，包含 Dashboard 链接、各项目链接、Settings 链接。

**Props:**
- `projects: Array` (required) — 项目列表

**Imports (CodeGraph):** `RouterLink` from `vue-router` (line 15)

**行为：** 遍历 `projects`，为每个项目生成 `/projects/${project.id}` 的 RouterLink。固定链接：`/` (Dashboard) 和 `/settings` (Settings)。

### ProjectSummaryCard (src/components/ProjectSummaryCard.vue:1-32)

**职责：** 显示单个项目的汇总卡片（owner、name、description、open/done/blocked 指标）。

**Props:**
- `project: Object` (required) — 包含 `owner`, `name`, `description`, `open`, `done`, `blocked`, `health` 字段

**Imports (CodeGraph):** 无外部导入

**行为：** 纯展示组件，使用 `project.health` 作为 CSS class (`health-${project.health}`)。

**Callers (CodeGraph):** DashboardView, ProjectDetailView

### ProjectTaskList (src/components/ProjectTaskList.vue:1-37)

**职责：** 任务列表面板，含过滤标签和"下一个任务"提示。

**Props:**
- `tasks: Array` (required) — 任务数组

**Imports (CodeGraph):**
- `computed` from `vue` (line 24)
- `TaskFilterTabs` from `./TaskFilterTabs.vue` (line 25)
- `useProjectFilters` from `../composables/useProjectFilters` (line 26)

**Calls (CodeGraph):** `useProjectFilters(taskSource)` (line 36)

**行为：** 将 `props.tasks` 包装为 computed，传入 `useProjectFilters` composable。展示 `visibleTasks` 和 `nextTask`。

### TaskFilterTabs (src/components/TaskFilterTabs.vue:1-28)

**职责：** 过滤标签按钮组，v-model 双向绑定当前选中过滤值。

**Props:**
- `modelValue: String` (required) — 当前选中值
- `options: Array` (required) — 选项列表 `{ value, label }`

**Emits:** `update:modelValue`

**行为：** 遍历 options 渲染按钮，点击时 emit 新值。

## 待确认

- App 在 `<script setup>` 顶层调用 `listProjects()` — 非响应式，项目数据变更不会触发更新。**推断为有意设计（静态数据），待确认。**
- ProjectSummaryCard 的 `health` CSS class 对应样式未在组件内定义。**待确认 `styles.css` 是否包含对应样式。**
