// Maps use # for debris, < > for currents, P for pier and A/B for drop points.
const maps = {
  school: [
    '#########',
    '#A..>..B#',
    '#.#.###.#',
    '#...<...#',
    '###.#.#.#',
    '#...P...#',
    '#########',
  ],
  embankment: [
    '#########',
    '#A...#..#',
    '#.#.>..B#',
    '#.#.###.#',
    '#...<...#',
    '#P..#...#',
    '#########',
  ],
};

export const headings = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

export function launch(route) {
  const map = maps[route];
  const y = map.findIndex(row => row.includes('P'));
  return { map, x: map[y].indexOf('P'), y, fuel: route === 'school' ? 30 : 26, cargo: true, delivered: [],
    notice: '船上已装好第一箱。每次划船消耗 1 格燃油。' };
}

export function steer(state, key) {
  const direction = headings[key];
  if (!direction || !state.fuel || state.delivered.length === 2) return state;
  const [dx, dy] = direction;
  let x = state.x + dx;
  const y = state.y + dy;
  const tile = state.map[y]?.[x];
  if (!tile || tile === '#') return { ...state, notice: '这里有障碍，换条航线。' };
  const drift = tile === '>' ? 1 : tile === '<' ? -1 : 0;
  if (drift && state.map[y][x + drift] !== '#') x += drift;
  const arrival = state.map[y][x];
  const fuel = state.fuel - 1;
  let { cargo, delivered } = state;
  let notice = drift ? '水流把船往箭头方向推了一格。' : '继续向送达点划。';
  if (arrival === 'P' && !cargo) {
    cargo = true;
    notice = '重新装货，前往另一个送达点。';
  }
  if (arrival === 'A' || arrival === 'B') {
    if (cargo && !delivered.includes(arrival)) {
      delivered = [...delivered, arrival];
      cargo = false;
      notice = delivered.length === 2 ? '两箱都送到了。' : '卸下一箱。回码头补货，再送另一处。';
    } else if (!delivered.includes(arrival)) {
      notice = '船上没有货，先回码头装一箱。';
    }
  }
  if (!fuel && delivered.length < 2) notice = '燃油用尽。你可以重新出航，或带着当前结果继续剧情。';
  return { ...state, x, y, fuel, cargo, delivered, notice };
}
