import { store } from '../state/store';
import { startGameLoop, stopGameLoop } from '../core/game-loop';
import { processMultipleTicks } from '../systems/life-cycle-system';
import { createTopBar, updateTopBar } from './top-bar';
import { createClickActionsPanel, updateClickActionsPanel } from './click-actions-panel';
import {
  createContinuousActionsPanel,
  updateContinuousActionsPanel,
} from './continuous-actions-panel';
import { createStatsPanel, updateStatsPanel } from './stats-panel';
import { createLifestylePanel, updateLifestylePanel } from './lifestyle-panel';
import { el, appendChildren } from './dom-helpers';

/**
 * Game tick handler called by the game loop.
 * Uses the life-cycle system's pure function to compute new state.
 */
function onTick(ticks: number): void {
  const currentState = store.getState();
  const newState = processMultipleTicks(currentState, ticks);

  // Apply the computed state diff to the store
  store.getState().updateTime(newState.time);
  store.getState().updatePlayer(newState.player);
  for (const skill of newState.skills) {
    store.getState().updateSkill(skill.skillId, skill);
  }
  for (const job of newState.jobs) {
    store.getState().updateJob(job.jobId, job);
  }
  if (!newState.isRunning) {
    store.getState().setRunning(false);
    stopGameLoop();
  }
}

/**
 * Update all UI panels.
 */
function renderUpdate(): void {
  updateTopBar();
  updateClickActionsPanel();
  updateContinuousActionsPanel();
  updateLifestylePanel();
  updateStatsPanel();
}

/**
 * Initialize the main game UI into the #app element.
 */
export function initApp(root: HTMLElement): void {
  const topBar = createTopBar();

  const columns = el('div', { className: 'game-columns' });
  const clickPanel = createClickActionsPanel();
  const continuousPanel = createContinuousActionsPanel();
  columns.appendChild(clickPanel);
  columns.appendChild(continuousPanel);

  const lifestylePanel = createLifestylePanel();
  const statsPanel = createStatsPanel();

  appendChildren(root, [topBar, columns, lifestylePanel, statsPanel]);

  // Initial render
  renderUpdate();

  // Subscribe to store changes for UI updates triggered by user interactions
  store.subscribe(() => {
    renderUpdate();

    // Manage game loop based on running state
    const state = store.getState();
    if (state.isRunning && (state.player.activeJobActionId || state.player.activeSkillActionId)) {
      startGameLoop(onTick);
    } else {
      stopGameLoop();
    }
  });
}
