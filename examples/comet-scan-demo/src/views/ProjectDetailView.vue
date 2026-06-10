<template>
  <section v-if="project" class="page">
    <header class="page-header">
      <p class="eyebrow">{{ project.owner }}</p>
      <h1>{{ project.name }}</h1>
      <p>{{ project.description }}</p>
    </header>

    <ProjectSummaryCard :project="summary" />
    <FocusQueue :tasks="tasks" />
    <ProjectTaskList :tasks="tasks" />
  </section>

  <section v-else class="page">
    <h1>Project not found</h1>
    <RouterLink to="/">Back to dashboard</RouterLink>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import ProjectSummaryCard from '../components/ProjectSummaryCard.vue';
import FocusQueue from '../components/FocusQueue.vue';
import ProjectTaskList from '../components/ProjectTaskList.vue';
import { getProject, listTasks, summarizeProject } from '../stores/projectStore';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const project = computed(() => getProject(props.projectId));
const tasks = computed(() => listTasks(props.projectId));
const summary = computed(() => (project.value ? summarizeProject(project.value) : null));
</script>
