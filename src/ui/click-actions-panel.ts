import { store } from '../state/store';
import { CLICK_ACTIONS } from '../data/actions';
import type { ClickAction } from '../../specs/schemas';
import { isRequirementMet, areActionRequirementsMet } from '../systems/action-system';
import { applyClickActionEffects } from '../systems/life-cycle-system';
import { el, clearChildren, button, setText, formatRequirement } from './dom-helpers';

let listContainer: HTMLElement;
let panel: HTMLElement;

const actionCache = new Map<string, {
  btn: HTMLButtonElement;
  reqEl: HTMLElement;
}>();
let lastLocationId: string | null = null;

export function createClickActionsPanel(): HTMLElement {
  panel = el('div', { className: 'panel' });
  panel.appendChild(el('h2', { className: 'panel__title', text: 'Actions' }));
  listContainer = el('div', { className: 'click-actions' });
  panel.appendChild(listContainer);
  return panel;
}

function executeClickAction(action: ClickAction): void {
  const state = store.getState();
  const newState = applyClickActionEffects(state, action.effects, action.timeCostDays);

  // Apply computed state to store
  store.getState().updateTime(newState.time);
  store.getState().updatePlayer(newState.player);
  for (const skill of newState.skills) {
    store.getState().updateSkill(skill.skillId, skill);
  }

  // Handle reincarnation (triggerReincarnation sets isAlive=false)
  if (!newState.isAlive) {
    store.getState().resetForReincarnation();
  }
}

function buildClickActionRows(locationId: string): void {
  clearChildren(listContainer);
  actionCache.clear();

  const actions = Object.values(CLICK_ACTIONS).filter(
    (a) => a.locationId === locationId,
  );

  for (const action of actions) {
    const btn = button(action.name, () => executeClickAction(action), {
      className: 'click-action-btn',
      disabled: true,
      title: action.description,
    });

    if (action.timeCostDays > 0) {
      const cost = el('div', {
        className: 'click-action-btn__cost',
        text: `(${action.timeCostDays} day${action.timeCostDays !== 1 ? 's' : ''})`,
      });
      btn.appendChild(cost);
    }

    const reqEl = el('span', { className: 'click-action-btn__req' });
    btn.appendChild(reqEl);

    listContainer.appendChild(btn);
    actionCache.set(action.id, { btn, reqEl });
  }

  lastLocationId = locationId;
}

export function updateClickActionsPanel(): void {
  const state = store.getState();
  const locationId = state.player.currentLocationId;

  if (locationId !== lastLocationId) {
    buildClickActionRows(locationId);
  }

  const actions = Object.values(CLICK_ACTIONS).filter(
    (a) => a.locationId === locationId,
  );

  for (const action of actions) {
    const cached = actionCache.get(action.id);
    if (!cached) continue;

    const canDo =
      state.isAlive &&
      areActionRequirementsMet(
        action.requirements,
        state.skills,
        state.jobs,
        state.player.storyFlags,
        state.time.currentAge,
      );

    cached.btn.disabled = !canDo;

    if (!canDo && action.requirements.length > 0) {
      const unmet = action.requirements
        .filter((req) => !isRequirementMet(req, state.skills, state.jobs, state.player.storyFlags, state.time.currentAge))
        .map(formatRequirement);
      if (unmet.length > 0) {
        setText(cached.reqEl, `Requires: ${unmet.join(', ')}`);
      } else {
        setText(cached.reqEl, '');
      }
    } else {
      setText(cached.reqEl, '');
    }
  }
}
