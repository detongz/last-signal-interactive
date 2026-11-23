import test from 'node:test';
import assert from 'node:assert/strict';
import { launch, steer } from '../river.js';
import { restore } from '../engine.js';

const direction = { L: 'ArrowLeft', U: 'ArrowUp', D: 'ArrowDown', R: 'ArrowRight' };

test('both maps allow two full deliveries and record the result in the story save', () => {
  for (const [index, [route, routeKeys]] of [
    ['school', 'LUUUULLDDRRDDRRUURRUU'],
    ['embankment', 'UUUUDDDDURRUURRR'],
  ].entries()) {
    const result = [...routeKeys].reduce((boat, key) => steer(boat, direction[key]), launch(route));
    assert.deepEqual(result.delivered, ['A', 'B']);
    assert.ok(result.fuel > 0);
    assert.equal(restore([0, index, 3, 0, 0]).supplies, 2);
  }
});

test('obstacles do not spend fuel, a current moves the boat, and stranding still allows a story ending', () => {
  const start = launch('school');
  assert.equal(steer(start, 'ArrowDown').fuel, start.fuel);
  const drifted = [...'LUUR'].reduce((boat, key) => steer(boat, direction[key]), start);
  assert.equal(drifted.x, 3);
  assert.match(drifted.notice, /水流/);

  const stranded = [...'LR'.repeat(15)].reduce((boat, key) => steer(boat, direction[key]), start);
  assert.equal(stranded.fuel, 0);
  assert.equal(stranded.delivered.length, 0);
  const ending = restore([0, 0, 1, 1, 0]);
  assert.equal(ending.id, 'ending_bridge');
  assert.equal(ending.supplies, 0);
});
