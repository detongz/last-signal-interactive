import { launch, steer, headings } from './river.js';

const symbols = { '#': '▧', '.': '·', '>': '→', '<': '←', P: '港', A: 'A', B: 'B' };
const controls = { ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→' };
const labels = { ArrowUp: '上', ArrowLeft: '左', ArrowDown: '下', ArrowRight: '右' };

export function mountBoat(panel, route, finish) {
  function element(parent, tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    parent.append(node);
    return node;
  }
  let state = launch(route);
  element(panel, 'p', '可操作关卡', 'chapter');
  element(panel, 'h2', '驾驶救援艇');
  element(panel, 'p', '用方向键、WASD 或下方按钮开船。到 A 或 B 自动卸货，回「港」装第二箱。水流会顺箭头推船。', 'boat-help');
  const stats = element(panel, 'p', '', 'boat-stats');
  const board = element(panel, 'div', '', 'boat-map');
  board.tabIndex = 0;
  board.setAttribute('aria-label', '救援航道，使用方向键驾驶');
  const notice = element(panel, 'p', '', 'boat-notice');
  notice.setAttribute('aria-live', 'polite');
  const pad = element(panel, 'div', '', 'boat-controls');
  const buttons = Object.entries(controls).map(([key, icon]) => {
    const button = element(pad, 'button', icon);
    button.setAttribute('aria-label', labels[key]);
    button.addEventListener('click', () => move(key));
    return button;
  });
  const actions = element(panel, 'div', '', 'boat-actions');
  const retry = element(actions, 'button', '重新出航');
  retry.addEventListener('click', () => { state = launch(route); draw(); board.focus(); });
  const done = element(actions, 'button', '返回电台', 'primary');
  done.addEventListener('click', () => finish(state.delivered.length));
  panel.addEventListener('keydown', event => {
    const key = { w: 'ArrowUp', a: 'ArrowLeft', s: 'ArrowDown', d: 'ArrowRight' }[event.key.toLowerCase()] ?? event.key;
    if (!Object.hasOwn(headings, key)) return;
    event.preventDefault();
    move(key);
  });
  function move(key) {
    state = steer(state, key);
    draw();
    if (done.disabled === false) done.focus({ preventScroll: true });
  }
  function draw() {
    stats.textContent = `燃油 ${state.fuel}　·　送达 ${state.delivered.length}/2　·　${state.cargo ? '船上有货' : '空船'}`;
    notice.textContent = state.notice;
    board.replaceChildren(...state.map.flatMap((row, y) => [...row].map((tile, x) => {
      const cell = document.createElement('span');
      const onBoat = x === state.x && y === state.y;
      cell.className = onBoat ? 'tile boat-player'
        : 'tile ' + ({ '#': 'debris', P: 'pier', A: 'drop', B: 'drop', '<': 'current', '>': 'current' }[tile] ?? '');
      cell.textContent = onBoat ? '🚤' : state.delivered.includes(tile) ? '✓' : symbols[tile];
      cell.setAttribute('aria-hidden', 'true');
      return cell;
    })));
    const finished = !state.fuel || state.delivered.length === 2;
    buttons.forEach(button => { button.disabled = finished; });
    done.disabled = !finished;
    done.textContent = state.delivered.length === 2 ? '交付完成，返回电台 →' : '按当前结果返回电台 →';
  }
  draw();
  return board;
}
