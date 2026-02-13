import { store } from '../state/store';
import { startGameLoop, stopGameLoop, setSpeedMultiplier } from '../core/game-loop';
import { processMultipleTicks } from '../systems/life-cycle-system';
import { createTopBar, updateTopBar } from './top-bar';
import { createClickActionsPanel, updateClickActionsPanel } from './click-actions-panel';
import {
  createContinuousActionsPanel,
  updateContinuousActionsPanel,
} from './continuous-actions-panel';
import { createStatsPanel, updateStatsPanel } from './stats-panel';
import { createLifestylePanel, updateLifestylePanel } from './lifestyle-panel';
import { createSettingsPanel, updateSettingsPanel } from './settings-panel';
import { createMessageLogPanel, updateMessageLogPanel } from './message-log-panel';
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
  updateSettingsPanel();
  updateMessageLogPanel();
}

/**
 * Check if debug mode is enabled via URL parameter.
 */
function isDebugMode(): boolean {
  return new URLSearchParams(window.location.search).has('debug');
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

  const messageLogPanel = createMessageLogPanel();
  const lifestylePanel = createLifestylePanel();
  const statsPanel = createStatsPanel();
  const settingsPanel = createSettingsPanel();

  appendChildren(root, [topBar, messageLogPanel, columns, lifestylePanel, statsPanel, settingsPanel]);

  // Add debug panel if debug mode is enabled
  if (isDebugMode()) {
    const debugPanel = el('div', { className: 'panel' });
    debugPanel.appendChild(el('h3', { className: 'panel__title', text: 'Debug' }));
    const label = el('label', { text: 'Speed: ' });
    label.style.fontSize = '0.85rem';
    label.style.color = '#aaa';
    const speedInput = document.createElement('input');
    speedInput.type = 'number';
    speedInput.min = '1';
    speedInput.max = '100';
    speedInput.value = '1';
    speedInput.style.width = '60px';
    speedInput.style.marginLeft = '0.5rem';
    speedInput.style.background = '#0f3460';
    speedInput.style.color = '#eee';
    speedInput.style.border = '1px solid #aaa';
    speedInput.style.borderRadius = '4px';
    speedInput.style.padding = '0.25rem 0.4rem';
    speedInput.style.fontFamily = 'inherit';
    speedInput.addEventListener('input', () => {
      const val = parseInt(speedInput.value, 10);
      if (!isNaN(val) && val >= 1) {
        setSpeedMultiplier(val);
      }
    });
    label.appendChild(speedInput);
    debugPanel.appendChild(label);
    root.appendChild(debugPanel);
  }

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
