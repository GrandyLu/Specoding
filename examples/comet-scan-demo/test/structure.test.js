import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

describe('Vue frontend structure', () => {
  it('declares the expected route to page component mapping', () => {
    const router = read('src/router/index.js');

    assert.match(router, /path:\s*'\/'/);
    assert.match(router, /component:\s*DashboardView/);
    assert.match(router, /path:\s*'\/projects\/:projectId'/);
    assert.match(router, /component:\s*ProjectDetailView/);
    assert.match(router, /path:\s*'\/settings'/);
    assert.match(router, /component:\s*SettingsView/);
  });

  it('keeps the project detail component chain explicit', () => {
    const projectDetail = read('src/views/ProjectDetailView.vue');
    const taskList = read('src/components/ProjectTaskList.vue');

    assert.match(projectDetail, /ProjectSummaryCard/);
    assert.match(projectDetail, /ProjectTaskList/);
    assert.match(taskList, /TaskFilterTabs/);
    assert.match(taskList, /useProjectFilters/);
  });

  it('keeps filter behavior in the composable', () => {
    const filters = read('src/composables/useProjectFilters.js');

    assert.match(filters, /function isOpenTask/);
    assert.match(filters, /function matchesFilter/);
    assert.match(filters, /tasks\.value\.filter/);
    assert.match(filters, /visibleTasks/);
    assert.match(filters, /nextTask/);
  });

  describe('Focus Queue', () => {
    it('filters out done tasks and sorts by blocked > priority > title', () => {
      const composable = read('src/composables/useFocusQueue.js');

      assert.match(composable, /status !== 'done'/);
      assert.match(composable, /status === 'blocked'/);
      assert.match(composable, /priority/);
      assert.match(composable, /localeCompare/);
    });

    it('sorts blocked tasks before others', async () => {
      const { useFocusQueue } = await import('../src/composables/useFocusQueue.js');

      const tasks = [
        { id: 'a', projectId: 'x', title: 'Alpha', status: 'todo', priority: 1 },
        { id: 'b', projectId: 'x', title: 'Blocked', status: 'blocked', priority: 3 },
        { id: 'c', projectId: 'x', title: 'Done', status: 'done', priority: 2 },
      ];

      const { items } = useFocusQueue(tasks);

      assert.equal(items.length, 2);
      assert.equal(items[0].id, 'b');
      assert.equal(items[1].id, 'a');
    });

    it('sorts by priority when status is the same', async () => {
      const { useFocusQueue } = await import('../src/composables/useFocusQueue.js');

      const tasks = [
        { id: 'a', projectId: 'x', title: 'Low', status: 'todo', priority: 3 },
        { id: 'b', projectId: 'x', title: 'High', status: 'todo', priority: 1 },
      ];

      const { items } = useFocusQueue(tasks);

      assert.equal(items[0].id, 'b');
      assert.equal(items[1].id, 'a');
    });

    it('ProjectDetailView still references ProjectTaskList', () => {
      const view = read('src/views/ProjectDetailView.vue');

      assert.match(view, /ProjectTaskList/);
      assert.match(view, /FocusQueue/);
    });
  });
});
