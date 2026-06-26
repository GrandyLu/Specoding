<template>
  <div class="app-shell">
    <SidebarNav :projects="projects" />
    <main class="main-panel">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import SidebarNav from './components/SidebarNav.vue';
import { listProjects } from './stores/projectStore';

const projects = listProjects();
</script>
