import { scenes } from './story.js';
import { advance, initial, restore } from './engine.js';

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
  const next = advance(state, option);
  if (!next) return;
  history.push(option);
  state = next;
  if (scenes[state.id].end && !endings.includes(state.id)) endings.push(state.id);
  persist();
  render(true);
}

function restart() {
  history = [];
  state = initial;
  persist();
  render(true);
}

function render(moveFocus = false) {
  const scene = scenes[state.id];
  byId('screen').dataset.art = scene.art;
  byId('stamp').textContent = scene.stamp;
  byId('signal').textContent = scene.end ? '播送结束' : '信号在线';
  byId('progress').textContent = `结局记录 ${endings.length} / 4`;
  byId('reset').disabled = !history.length;

  story.replaceChildren();
  add(story, 'p', scene.chapter, 'chapter');
  const title = add(story, 'h1', scene.title);
  title.tabIndex = -1;
  const body = add(story, 'div', '', 'copy');
  if (scene.context) add(body, 'p', scene.context[state.frequency], 'context');
  for (const paragraph of scene.paragraphs) add(body, 'p', paragraph);
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
  } else {
    add(actions, 'button', scene.end ? '回到广播塔 ↻' : `${scene.button ?? '继续'} →`, 'primary')
      .addEventListener('click', scene.end ? restart : () => go(0));
  }
  if (moveFocus) {
    title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
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
render();
