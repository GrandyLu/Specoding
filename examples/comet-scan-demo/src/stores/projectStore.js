import { projects, tasks } from '../data/projects';

export function listProjects() {
  return projects;
}

export function getProject(projectId) {
  return projects.find((project) => project.id === projectId) ?? null;
}

export function listTasks(projectId) {
  if (!projectId) {
    return tasks;
  }
  return tasks.filter((task) => task.projectId === projectId);
}

export function summarizeProject(project) {
  const projectTasks = listTasks(project.id);
  const done = projectTasks.filter((task) => task.status === 'done').length;
  const blocked = projectTasks.filter((task) => task.status === 'blocked').length;
  const open = projectTasks.length - done;

  return {
    ...project,
    total: projectTasks.length,
    done,
    open,
    blocked,
  };
}

export function summarizeDashboard() {
  return projects.map((project) => summarizeProject(project));
}
