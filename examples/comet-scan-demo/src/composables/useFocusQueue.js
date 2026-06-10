export function getRecommendation(task) {
  if (task.status === 'blocked') return 'Blocked work needs attention';
  if (task.priority === 1) return 'High priority';
  return 'Ready to schedule';
}

export function useFocusQueue(tasks) {
  const items = tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => {
      const aBlocked = a.status === 'blocked' ? 0 : 1;
      const bBlocked = b.status === 'blocked' ? 0 : 1;
      if (aBlocked !== bBlocked) return aBlocked - bBlocked;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.title.localeCompare(b.title);
    })
    .map((task) => ({ ...task, recommendation: getRecommendation(task) }));

  return { items, isEmpty: items.length === 0 };
}
