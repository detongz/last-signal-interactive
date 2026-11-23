import test from 'node:test';
import assert from 'node:assert/strict';
import { scenes } from '../story.js';
import { restore, initial } from '../engine.js';
import { minutesLeft, rescueMinutes } from '../dispatch.js';

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

test('the same two calls in a different order change rescue timing', () => {
  const gate = [0, 1, 0];
  assert.equal(minutesLeft(restore(gate).calls), 4);
  assert.equal(minutesLeft(restore([...gate, 2]).calls), 2);

  const schoolFirst = restore([...gate, 2, 4]);
  const boatFirst = restore([...gate, 4, 2]);
  assert.deepEqual(schoolFirst.calls, [0, 2]);
  assert.equal(minutesLeft(schoolFirst.calls), 0);
  assert.equal(rescueMinutes(schoolFirst.calls), -1);
  assert.equal(rescueMinutes(boatFirst.calls), 0);
  assert.equal(rescueMinutes(restore([...gate, 3, 2]).calls), -2);
  assert.equal(restore([...gate, 2, 2]), null);
  assert.equal(restore([...gate, 2, 4, 3]), null);

  for (const first of [0, 1]) {
    for (const second of [0, 1]) {
      for (const a of [2, 3, 4]) {
        for (const b of [2, 3, 4].filter(value => value !== a)) {
          const start = [0, first, 0];
          const finish = [second, 0];
          assert.equal(restore([...start, a, b, ...finish]).id, restore([...start, ...finish]).id);
        }
      }
    }
  }
});
