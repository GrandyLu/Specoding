<template>
  <section class="task-panel">
    <header>
      <div>
        <p class="eyebrow">Task focus</p>
        <h2>Visible tasks</h2>
      </div>
      <TaskFilterTabs v-model="activeFilter" :options="taskFilterOptions" />
    </header>

    <p v-if="nextTask" class="next-task">Next: {{ nextTask.title }}</p>
    <p v-else class="next-task">No task matches this filter.</p>

    <ul class="task-list">
      <li v-for="task in visibleTasks" :key="task.id">
        <span>{{ task.title }}</span>
        <strong>{{ task.status }}</strong>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import TaskFilterTabs from './TaskFilterTabs.vue';
import { useProjectFilters } from '../composables/useProjectFilters';

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
});

const taskSource = computed(() => props.tasks);
const { activeFilter, visibleTasks, nextTask, taskFilterOptions } = useProjectFilters(taskSource);
</script>
