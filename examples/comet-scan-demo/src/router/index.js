import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ProjectDetailView from '../views/ProjectDetailView.vue';
import SettingsView from '../views/SettingsView.vue';

export const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard', navLabel: 'Overview' },
  },
  {
    path: '/projects/:projectId',
    name: 'project-detail',
    component: ProjectDetailView,
    props: true,
    meta: { title: 'Project Detail', navLabel: 'Project' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Settings', navLabel: 'Settings' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
