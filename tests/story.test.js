import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from '../story.js';
import { restore, initial } from '../engine.js';

test('all four routes close at distinct endings and expose no further action', () => {
  const endings = [['ending_flag', 'ending_bridge'], ['ending_rollcall', 'ending_bell']];
  for (const first of [0, 1]) {
    for (const second of [0, 1]) {
      const route = [0, first, 0, second, 0];
      const state = restore(route);
      assert.equal(state.id, endings[first][second]);
      assert.equal(scenes[state.id].end, true);
      assert.equal(restore([...route, 0]), null);
    }
  }
});

test('invalid saves cannot point into arbitrary scenes', () => {
  assert.deepEqual(restore([]), initial);
  for (const input of [null, [0, 3], [0, '1'], [0, -1]]) assert.equal(restore(input), null);
});
