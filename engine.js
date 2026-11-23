import { scenes } from './story.js';
import { contacts, minutesLeft } from './dispatch.js';

export const initial = { id: 'tower', frequency: null, calls: [], supplies: null };

export function advance(state, option) {
  const scene = scenes[state.id];
  if (scene.dispatch && option >= scene.choices.length) {
    const contact = option - scene.choices.length;
    if (!contacts[contact] || state.calls.includes(contact) || minutesLeft(state.calls) <= 0) return null;
    return { ...state, calls: [...state.calls, contact] };
  }
  if (scene.choices) {
    const choice = scene.choices[option];
    if (!choice) return null;
    const [, , id, decision] = choice;
    return { ...state, id, frequency: state.id === 'desk' ? decision : state.frequency };
  }
  if (state.id === 'rescue' || state.id === 'warn') {
    // Zero keeps saves from before the boat mission valid.
    if (option >= 1 && option <= 3) return { ...state, id: 'gate', supplies: option - 1 };
  }
  if (option !== 0) return null;
  const id = scene.next ?? scene.nextBy?.[state.frequency];
  return id ? { ...state, id } : null;
}

export function restore(history) {
  if (!Array.isArray(history) || history.length > Object.keys(scenes).length + contacts.length) return null;
  let state = initial;
  for (const step of history) {
    if (!Number.isInteger(step) || step < 0) return null;
    state = advance(state, step);
    if (!state) return null;
  }
  return state;
}
