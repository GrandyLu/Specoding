export const projects = [
  {
    id: 'alpha',
    name: 'Alpha Launch',
    owner: 'Mira',
    health: 'at-risk',
    description: 'Prepare the launch dashboard and sales handoff.',
  },
  {
    id: 'bravo',
    name: 'Bravo Migration',
    owner: 'Ken',
    health: 'on-track',
    description: 'Move customer reporting workflows to the new data model.',
  },
  {
    id: 'cobalt',
    name: 'Cobalt Support',
    owner: 'Nia',
    health: 'blocked',
    description: 'Reduce support queue time for enterprise accounts.',
  },
];

export const tasks = [
  { id: 't-1', projectId: 'alpha', title: 'Write launch checklist', status: 'done', priority: 2 },
  { id: 't-2', projectId: 'alpha', title: 'Review dashboard filters', status: 'in_progress', priority: 1 },
  { id: 't-3', projectId: 'alpha', title: 'Confirm launch owner', status: 'todo', priority: 3 },
  { id: 't-4', projectId: 'bravo', title: 'Map legacy report fields', status: 'done', priority: 2 },
  { id: 't-5', projectId: 'bravo', title: 'Validate migration preview', status: 'todo', priority: 1 },
  { id: 't-6', projectId: 'cobalt', title: 'Unblock billing export', status: 'blocked', priority: 1 },
  { id: 't-7', projectId: 'cobalt', title: 'Document escalation path', status: 'todo', priority: 2 },
];
