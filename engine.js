import { scenes } from './story.js';

export const initial = { id: 'tower', frequency: null };

export function advance(state, option) {
  const scene = scenes[state.id];
  if (scene.choices) {
    const choice = scene.choices[option];
    if (!choice) return null;
    const [, , id, decision] = choice;
    return { id, frequency: state.id === 'desk' ? decision : state.frequency };
  }
  const id = scene.next ?? scene.nextBy?.[state.frequency];
  return id ? { ...state, id } : null;
}

export function restore(history) {
  if (!Array.isArray(history) || history.length > Object.keys(scenes).length) return null;
  let state = initial;
  for (const step of history) {
    if (!Number.isInteger(step) || step < 0) return null;
    state = advance(state, step);
    if (!state) return null;
  }
  return state;
}
