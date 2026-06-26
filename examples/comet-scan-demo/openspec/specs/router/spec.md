# 路由系统

## Overview

基于 Vue Router 4 的 SPA 路由，使用 HTML5 History 模式。定义在 `src/router/index.js`。

## CodeGraph 数据

- 节点：`routes` constant (line 6-26, exported), `router` constant (line 28-31)
- imports 边：`vue-router` (line 1), `DashboardView.vue` (line 2), `ProjectDetailView.vue` (line 3), `SettingsView.vue` (line 4)

## 路由定义

| path                 | name              | component           | props   | meta.title        | meta.navLabel |
|----------------------|-------------------|---------------------|---------|-------------------|---------------|
| `/`                  | `dashboard`       | DashboardView       | —       | `Dashboard`       | `Overview`    |
| `/projects/:projectId` | `project-detail` | ProjectDetailView   | `true`  | `Project Detail`  | `Project`     |
| `/settings`          | `settings`        | SettingsView        | —       | `Settings`        | `Settings`    |

**行为：**
- `createWebHistory()` — 无 `#` 前缀的 clean URL。
- `props: true` 仅在 `project-detail` 路由上，`projectId` 从 URL 参数注入为 component prop。
- `routes` 被导出，允许其他模块引用路由表。
- `router` 为默认导出，由 `main.js` 注入 App。

## CodeGraph 精确调用链

```
main.js (line 1) imports vue
main.js (line 2) imports App.vue
main.js (line 3) imports ./router
main.js (line 4) imports ./styles.css
→ createApp(App).use(router).mount('#app')
```

## 待确认

- `createWebHistory()` 需要服务器端配置 fallback 到 `index.html`。当前项目无服务器配置。
- 无路由守卫（navigation guards）。是否需要未找到项目的重定向？
- `SettingsView` 内容为静态 HTML，无响应式状态。
