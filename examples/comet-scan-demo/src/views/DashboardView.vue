<template>
  <section class="page">
    <header class="page-header">
      <p class="eyebrow">Portfolio</p>
      <h1>Project dashboard</h1>
    </header>
    <div class="card-grid">
      <RouterLink v-for="project in summaries" :key="project.id" :to="`/projects/${project.id}`">
        <ProjectSummaryCard :project="project" />
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import ProjectSummaryCard from '../components/ProjectSummaryCard.vue';
import { summarizeDashboard } from '../stores/projectStore';

const summaries = summarizeDashboard();
</script>
