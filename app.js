import { mountBoat } from './boat-ui.js';
import { scenes } from './story.js';
import { advance, initial, restore } from './engine.js';
import { callMinutes, contacts, minutesLeft, rescueMinutes } from './dispatch.js';

const key = 'last-signal:v1';
const byId = id => document.getElementById(id);
const story = byId('story');
let history = [];
let endings = [];
try {
  const save = JSON.parse(localStorage.getItem(key));
  if (save && restore(save.history)) history = save.history;
  if (Array.isArray(save?.endings)) endings = [...new Set(save.endings.filter(id => Object.hasOwn(scenes, id) && scenes[id].end))];
} catch {
  // Play works with storage disabled or after an invalid save.
}
let state = restore(history) ?? initial;
let audio;

function persist() {
  try { localStorage.setItem(key, JSON.stringify({ history, endings })); } catch {}
}

function add(parent, tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.append(node);
  return node;
}

function go(option) {
  const previous = state;
  const next = advance(state, option);
  if (!next) return;
  history.push(option);
  state = next;
  if (scenes[state.id].end && !endings.includes(state.id)) endings.push(state.id);
  persist();
  render(previous.id !== next.id);
  if (previous.id === next.id) byId('dispatch-summary').focus();
}

function restart() {
  history = [];
  state = initial;
  persist();
  render(true);
}

function renderQuickBoat() {
  story.replaceChildren();
  const back = add(story, 'a', '← 返回剧情', 'radio-link');
  back.href = '#radio';
  const panel = add(story, 'section', '', 'boat-panel');
  return mountBoat(panel, 'school', delivered => {
    panel.replaceChildren();
    const title = add(panel, 'h1', `物资送达 ${delivered}/2`);
    title.tabIndex = -1;
    add(panel, 'button', '再开一局', 'primary').addEventListener('click', () => render(true));
    title.focus();
  }, '查看本局结果');
}

function render(moveFocus = false) {
  const quick = location.hash === '#boat';
  document.body.classList.toggle('quick-boat', quick);
  byId('screen').hidden = quick;
  byId('quick-entry').hidden = quick;
  byId('reset').hidden = quick;
  if (quick) {
    const board = renderQuickBoat();
    if (moveFocus) board.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return;
  }
  const scene = scenes[state.id];
  byId('screen').dataset.art = scene.art;
  const delay = state.calls.length * callMinutes;
  byId('stamp').textContent = ['gate', 'spill', 'dive'].includes(state.id)
    ? scene.stamp.replace(/^01:(\d{2})/, (_, minute) => `01:${Number(minute) + delay}`)
    : scene.stamp;
  byId('signal').textContent = scene.end ? '播送结束' : '信号在线';
  byId('progress').textContent = `结局记录 ${endings.length} / 4`;
  byId('reset').disabled = !history.length;

  story.replaceChildren();
  add(story, 'p', scene.chapter, 'chapter');
  const title = add(story, 'h1', scene.title);
  title.tabIndex = -1;
  const opening = state.id === 'tower';
  if (opening) {
    add(story, 'button', '接通值班室 →', 'primary opening-action')
      .addEventListener('click', () => go(0));
  }
  const mission = state.id === 'rescue' || state.id === 'warn';
  if (mission) {
    const panel = add(story, 'section', '', 'boat-panel');
    const board = mountBoat(panel, state.frequency, delivered => go(delivered + 1));
    if (moveFocus) board.focus();
  }
  const body = add(story, 'div', '', 'copy');
  if (state.supplies !== null && (scene.dispatch || scene.end)) {
    const report = [
      '两处安置点都没有收到物资。洪峰过后，坡上的志愿者把仅剩的保温毯一分为二，先给浑身湿透的孩子。',
      '只有一处安置点收到了物资。收到货的人留了一半给另一处，直到水退才沿旧路送过去。',
      '两处安置点都收到了物资。老师用灯给后续船队指路，坡上的志愿者也能马上给伤员保暖。',
    ];
    add(body, 'p', '物资回执：' + report[state.supplies], 'context');
  }
  if (scene.context) add(body, 'p', scene.context[state.frequency], 'context');
  scene.paragraphs.forEach((paragraph, index) => {
    add(body, 'p', paragraph);
    if (index === 0 && scene.end && state.calls.length) {
      const net = rescueMinutes(state.calls);
      const timing = net === 0 ? '提前调度刚好抵消了通话用掉的时间。'
        : `算上通话，相关救援比直接去闸门${net > 0 ? '早' : '晚'}了 ${Math.abs(net)} 分钟。`;
      add(body, 'p', timing + contacts[state.calls[0]].earlyAfter, 'context');
    }
  });
  if (scene.voice) {
    const quote = add(body, 'blockquote', '');
    add(quote, 'cite', scene.voice[0]);
    add(quote, 'p', scene.voice[1]);
  }
  if (scene.evidence) {
    const archive = add(story, 'div', '', 'archive');
    add(archive, 'p', '频道附件', 'chapter');
    for (const [label, entry] of scene.evidence) {
      const details = add(archive, 'details', '');
      add(details, 'summary', label);
      add(details, 'p', entry);
    }
  }
  if (scene.dispatch) renderDispatch(scene);
  const actions = add(story, 'div', '', 'actions');
  if (scene.choices) {
    add(actions, 'p', '决定下一步', 'chapter');
    scene.choices.forEach(([label, hint], index) => {
      const button = add(actions, 'button', '', 'choice');
      add(button, 'span', String(index + 1).padStart(2, '0'), 'choice-no');
      const content = add(button, 'span', '', 'choice-body');
      add(content, 'strong', label);
      add(content, 'small', hint);
      add(button, 'span', '↗', 'arrow').setAttribute('aria-hidden', 'true');
      button.addEventListener('click', () => go(index));
    });
  } else if (!mission && !opening) {
    add(actions, 'button', scene.end ? '回到广播塔 ↻' : `${scene.button ?? '继续'} →`, 'primary')
      .addEventListener('click', scene.end ? restart : () => go(0));
  }
  if (moveFocus && !mission) {
    title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function renderDispatch(scene) {
  const panel = add(story, 'section', '', 'dispatch');
  add(panel, 'h2', '开闸前联络');
  const left = minutesLeft(state.calls);
  const summary = add(panel, 'p', `剩余 ${left} 分钟 · 通话每次 ${callMinutes} 分钟`, 'chapter');
  summary.id = 'dispatch-summary';
  summary.tabIndex = -1;
  add(panel, 'p', '第一通还能安排对方提前行动，第二通只能核实情况。也可以跳过联络，直接决定。', 'dispatch-hint');
  for (const [order, id] of state.calls.entries()) {
    const call = contacts[id];
    const record = add(panel, 'div', '', 'dispatch-record');
    add(record, 'strong', `第 ${order + 1} 通 · ${call.name}`);
    add(record, 'p', order === 0 ? call.early : call.late);
  }
  const choices = add(panel, 'div', '', 'dispatch-options');
  contacts.forEach(({ name }, id) => {
    const called = state.calls.includes(id);
    const button = add(choices, 'button', called ? `${name} · 已联络` : `联络${name}`);
    button.disabled = called || left === 0;
    button.addEventListener('click', () => go(scene.choices.length + id));
  });
  if (left === 0) add(panel, 'p', '01:40 · 通话窗口已关闭，请选择开闸方案。', 'dispatch-hint');
}

async function toggleSound() {
  const button = byId('sound');
  button.disabled = true;
  try {
    if (audio?.state === 'running') {
      await audio.suspend();
    } else {
      if (!audio) {
        audio = new AudioContext();
        const buffer = audio.createBuffer(1, audio.sampleRate * 4, audio.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        const noise = audio.createBufferSource();
        const filter = audio.createBiquadFilter();
        const volume = audio.createGain();
        filter.type = 'lowpass';
        filter.frequency.value = 650;
        volume.gain.value = 0.075;
        noise.buffer = buffer;
        noise.loop = true;
        noise.connect(filter).connect(volume).connect(audio.destination);
        noise.start();
      }
      await audio.resume();
    }
    const on = audio.state === 'running';
    button.textContent = on ? '声音：开' : '声音：关';
    button.setAttribute('aria-pressed', String(on));
  } catch {
    button.textContent = '声音不可用';
    button.setAttribute('aria-pressed', 'false');
  } finally {
    button.disabled = false;
  }
}

byId('sound').addEventListener('click', toggleSound);
byId('reset').addEventListener('click', () => {
  if (scenes[state.id].end || window.confirm('从第一幕重新开始？已解锁的结局会保留。')) restart();
});
window.addEventListener('hashchange', () => render(true));
render();
