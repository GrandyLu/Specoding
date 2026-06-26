<template>
  <article class="summary-card" :class="`health-${project.health}`">
    <div>
      <p class="eyebrow">{{ project.owner }}</p>
      <h2>{{ project.name }}</h2>
      <p>{{ project.description }}</p>
    </div>
    <dl class="metrics">
      <div>
        <dt>Open</dt>
        <dd>{{ project.open }}</dd>
      </div>
      <div>
        <dt>Done</dt>
        <dd>{{ project.done }}</dd>
      </div>
      <div>
        <dt>Blocked</dt>
        <dd>{{ project.blocked }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
});
</script>
