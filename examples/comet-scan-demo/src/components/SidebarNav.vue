<template>
  <aside class="sidebar">
    <RouterLink class="brand" to="/">Comet Vue Demo</RouterLink>
    <nav aria-label="Primary navigation">
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink v-for="project in projects" :key="project.id" :to="`/projects/${project.id}`">
        {{ project.name }}
      </RouterLink>
      <RouterLink to="/settings">Settings</RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  projects: {
    type: Array,
    required: true,
  },
});
</script>
