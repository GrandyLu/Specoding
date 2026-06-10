<template>
  <section v-if="!isEmpty" class="focus-queue">
    <header>
      <p class="eyebrow">Priority</p>
      <h2>Focus Queue</h2>
    </header>
    <ol class="focus-list">
      <li v-for="task in items" :key="task.id" :class="`status-${task.status}`">
        <span class="task-title">{{ task.title }}</span>
        <span class="task-status">{{ task.status }}</span>
        <span class="task-priority">P{{ task.priority }}</span>
        <span class="task-recommendation">{{ task.recommendation }}</span>
      </li>
    </ol>
  </section>
  <section v-else class="focus-queue focus-queue--empty">
    <p>No open work for this project.</p>
  </section>
</template>

<script setup>
import { useFocusQueue } from '../composables/useFocusQueue';

const props = defineProps({
  tasks: {
    type: Array,
    required: true,
  },
});

const { items, isEmpty } = useFocusQueue(props.tasks);
</script>
