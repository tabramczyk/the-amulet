import { store } from '../state/store';
import { CONTINUOUS_ACTIONS } from '../data/actions';
import { LOCATIONS } from '../data/locations';
import { isRequirementMet, areActionRequirementsMet } from '../systems/action-system';
import { el, clearChildren, setText, formatRequirement } from './dom-helpers';

let jobSection: HTMLElement;
let skillSection: HTMLElement;
let jobListContainer: HTMLElement;
let skillListContainer: HTMLElement;
let jobActiveIndicator: HTMLElement;
let skillActiveIndicator: HTMLElement;
let panel: HTMLElement;

// Cache refs for efficient updates — avoids full DOM rebuild every tick
const jobActionCache = new Map<string, {
  item: HTMLElement;
  indicator: HTMLElement;
  reqEl: HTMLElement;
}>();
const skillActionCache = new Map<string, {
  item: HTMLElement;
  indicator: HTMLElement;
  reqEl: HTMLElement;
}>();
let lastLocationId: string | null = null;

export function createContinuousActionsPanel(): HTMLElement {
  panel = el('div', { className: 'panel' });
  panel.appendChild(el('h2', { className: 'panel__title', text: 'Continuous Actions' }));

  // Job Actions section
  jobSection = el('div', { className: 'continuous-actions-section' });
  jobSection.appendChild(el('h3', { className: 'continuous-actions-section__title', text: 'Job Actions' }));
  jobActiveIndicator = el('div', { className: 'continuous-action-active-indicator' });
  jobSection.appendChild(jobActiveIndicator);
  jobListContainer = el('div', { className: 'continuous-actions' });
  jobSection.appendChild(jobListContainer);

  // Skill Actions section
  skillSection = el('div', { className: 'continuous-actions-section' });
  skillSection.appendChild(el('h3', { className: 'continuous-actions-section__title', text: 'Skill Actions' }));
  skillActiveIndicator = el('div', { className: 'continuous-action-active-indicator' });
  skillSection.appendChild(skillActiveIndicator);
  skillListContainer = el('div', { className: 'continuous-actions' });
  skillSection.appendChild(skillListContainer);

  panel.appendChild(jobSection);
  panel.appendChild(skillSection);

  return panel;
}

function selectContinuousAction(actionId: string): void {
  const state = store.getState();
  const action = CONTINUOUS_ACTIONS[actionId];
  if (!action) return;

  if (action.category === 'job') {
    const newId = state.player.activeJobActionId === actionId ? null : actionId;
    state.updatePlayer({ activeJobActionId: newId });
    // Running if either action slot is active
    state.setRunning(newId !== null || state.player.activeSkillActionId !== null);
  } else {
    const newId = state.player.activeSkillActionId === actionId ? null : actionId;
    state.updatePlayer({ activeSkillActionId: newId });
    state.setRunning(state.player.activeJobActionId !== null || newId !== null);
  }
}

function buildActionRows(locationId: string): void {
  clearChildren(jobListContainer);
  clearChildren(skillListContainer);
  jobActionCache.clear();
  skillActionCache.clear();

  const allActions = Object.values(CONTINUOUS_ACTIONS).filter(
    (a) => a.locationId === locationId,
  );

  for (const action of allActions) {
    const item = el('div', { className: 'continuous-action-item' });
    item.addEventListener('click', () => selectContinuousAction(action.id));

    const indicator = el('div', { className: 'continuous-action-item__indicator' });
    const nameEl = el('span', { className: 'continuous-action-item__name', text: action.name });
    const descEl = el('span', { className: 'continuous-action-item__desc', text: action.description });
    const reqEl = el('span', { className: 'continuous-action-item__req' });

    const textWrap = el('div');
    textWrap.appendChild(nameEl);
    textWrap.appendChild(descEl);
    textWrap.appendChild(reqEl);

    item.appendChild(indicator);
    item.appendChild(textWrap);
    item.title = action.description;

    if (action.category === 'job') {
      jobListContainer.appendChild(item);
      jobActionCache.set(action.id, { item, indicator, reqEl });
    } else {
      skillListContainer.appendChild(item);
      skillActionCache.set(action.id, { item, indicator, reqEl });
    }
  }

  lastLocationId = locationId;
}

function updateActiveIndicator(
  indicatorEl: HTMLElement,
  activeActionId: string | null,
  currentLocationId: string,
): void {
  if (!activeActionId) {
    setText(indicatorEl, '');
    indicatorEl.style.display = 'none';
    return;
  }

  const action = CONTINUOUS_ACTIONS[activeActionId];
  if (!action || action.locationId === currentLocationId) {
    // Action is local — shown in the list itself, no need for indicator
    setText(indicatorEl, '');
    indicatorEl.style.display = 'none';
    return;
  }

  // Action is from a different location — show read-only indicator
  const loc = LOCATIONS[action.locationId];
  const locName = loc?.name ?? action.locationId;
  setText(indicatorEl, `Active: ${action.name} (${locName})`);
  indicatorEl.style.display = '';
}

function updateActionItems(
  cache: Map<string, { item: HTMLElement; indicator: HTMLElement; reqEl: HTMLElement }>,
  activeId: string | null,
  state: ReturnType<typeof store.getState>,
  locationId: string,
): void {
  const actions = Object.values(CONTINUOUS_ACTIONS).filter(
    (a) => a.locationId === locationId,
  );

  for (const action of actions) {
    const cached = cache.get(action.id);
    if (!cached) continue;

    const isActive = activeId === action.id;
    const canDo =
      state.isAlive &&
      areActionRequirementsMet(
        action.requirements,
        state.skills,
        state.jobs,
        state.player.storyFlags,
        state.time.currentAge,
        state.player.clanIds,
      );

    // Hide actions with unmet story flag or clan requirements entirely
    const hasUnmetStoryFlag = action.requirements.some(
      (req) => req.type === 'storyFlag' && !isRequirementMet(req, state.skills, state.jobs, state.player.storyFlags, state.time.currentAge, state.player.clanIds)
    );
    const hasUnmetClan = action.requirements.some(
      (req) => req.type === 'clan' && !state.player.clanIds.includes(req.clanId)
    );
    cached.item.style.display = (hasUnmetStoryFlag || hasUnmetClan) ? 'none' : '';

    cached.item.className = isActive
      ? 'continuous-action-item continuous-action-item--active'
      : 'continuous-action-item';

    cached.item.style.opacity = canDo ? '' : '0.5';
    cached.item.style.cursor = canDo ? 'pointer' : 'not-allowed';
    cached.item.style.pointerEvents = canDo ? '' : 'none';

    if (!canDo) {
      const unmet = action.requirements
        .filter((req) => !isRequirementMet(req, state.skills, state.jobs, state.player.storyFlags, state.time.currentAge, state.player.clanIds))
        .map(formatRequirement);
      setText(cached.reqEl, unmet.length > 0 ? `Requires: ${unmet.join(', ')}` : '');
    } else {
      setText(cached.reqEl, '');
    }
  }
}

export function updateContinuousActionsPanel(): void {
  const state = store.getState();
  const locationId = state.player.currentLocationId;
  const activeJobId = state.player.activeJobActionId;
  const activeSkillId = state.player.activeSkillActionId;

  // Rebuild DOM only when location changes
  if (locationId !== lastLocationId) {
    buildActionRows(locationId);
  }

  // Update active indicators for actions from other locations
  updateActiveIndicator(jobActiveIndicator, activeJobId, locationId);
  updateActiveIndicator(skillActiveIndicator, activeSkillId, locationId);

  // Update cached elements in-place
  updateActionItems(jobActionCache, activeJobId, state, locationId);
  updateActionItems(skillActionCache, activeSkillId, state, locationId);
}
