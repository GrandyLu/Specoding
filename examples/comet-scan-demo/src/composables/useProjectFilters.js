import { computed, ref } from 'vue';

export const taskFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

function isOpenTask(task) {
  return task.status === 'todo' || task.status === 'in_progress';
}

function matchesFilter(task, filter) {
  if (filter === 'open') {
    return isOpenTask(task);
  }
  if (filter === 'blocked') {
    return task.status === 'blocked';
  }
  if (filter === 'done') {
    return task.status === 'done';
  }
  return true;
}

export function useProjectFilters(tasks) {
  const activeFilter = ref('open');
  const visibleTasks = computed(() => tasks.value.filter((task) => matchesFilter(task, activeFilter.value)));
  const nextTask = computed(() => visibleTasks.value.slice().sort((a, b) => a.priority - b.priority)[0] ?? null);

  return {
    activeFilter,
    visibleTasks,
    nextTask,
    taskFilterOptions,
  };
}
