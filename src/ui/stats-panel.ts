import { store } from '../state/store';
import { SKILLS } from '../data/skills';
import { JOBS } from '../data/jobs';
import { HOUSING_OPTIONS } from '../data/housing';
import { FOOD_OPTIONS } from '../data/food';
import {
  el,
  clearChildren,
  setText,
  formatNumber,
  progressBar,
  updateProgressBar,
} from './dom-helpers';

let skillsContainer: HTMLElement;
let jobsContainer: HTMLElement;
let lifestyleContainer: HTMLElement;
let lifestyleHousingEl: HTMLElement;
let lifestyleFoodEl: HTMLElement;
let prestigeContainer: HTMLElement;
let panel: HTMLElement;

// Cache refs for efficient updates
const skillRows = new Map<string, {
  row: HTMLElement;
  levelEl: HTMLElement;
  barEl: HTMLElement;
  xpEl: HTMLElement;
}>();
const jobRows = new Map<string, {
  levelEl: HTMLElement;
  barEl: HTMLElement;
  xpEl: HTMLElement;
  payEl: HTMLElement;
}>();

export function createStatsPanel(): HTMLElement {
  panel = el('div', { className: 'panel stats-panel' });

  // Skills section
  const skillsSection = el('div', { className: 'stats-panel__section' });
  skillsSection.appendChild(el('h3', { className: 'stats-panel__section-title', text: 'Skills' }));
  skillsContainer = el('div');
  skillsSection.appendChild(skillsContainer);

  // Jobs section
  const jobsSection = el('div', { className: 'stats-panel__section' });
  jobsSection.appendChild(el('h3', { className: 'stats-panel__section-title', text: 'Jobs' }));
  jobsContainer = el('div');
  jobsSection.appendChild(jobsContainer);

  // Lifestyle section
  const lifestyleSection = el('div', { className: 'stats-panel__section' });
  lifestyleSection.appendChild(el('h3', { className: 'stats-panel__section-title', text: 'Lifestyle' }));
  lifestyleContainer = el('div');
  lifestyleHousingEl = el('div', { className: 'stat-row', text: 'Sleeping Rough (Free)' });
  lifestyleFoodEl = el('div', { className: 'stat-row', text: 'Going Hungry (Free)' });
  lifestyleContainer.appendChild(lifestyleHousingEl);
  lifestyleContainer.appendChild(lifestyleFoodEl);
  lifestyleSection.appendChild(lifestyleContainer);

  // Prestige section
  const prestigeSection = el('div', { className: 'stats-panel__section' });
  prestigeSection.appendChild(el('h3', { className: 'stats-panel__section-title', text: 'Prestige' }));
  prestigeContainer = el('div');
  prestigeSection.appendChild(prestigeContainer);

  panel.appendChild(skillsSection);
  panel.appendChild(jobsSection);
  panel.appendChild(lifestyleSection);
  panel.appendChild(prestigeSection);

  buildSkillRows();
  buildJobRows();

  return panel;
}

function buildSkillRows(): void {
  clearChildren(skillsContainer);
  skillRows.clear();

  for (const skillDef of Object.values(SKILLS)) {
    const row = el('div', { className: 'stat-row' });
    const nameEl = el('span', { className: 'stat-row__name', text: skillDef.name });
    const levelEl = el('span', { className: 'stat-row__level', text: '0' });
    const barEl = progressBar(0);
    const xpEl = el('span', {
      className: 'stat-row__prestige',
      text: '',
    });

    row.appendChild(nameEl);
    row.appendChild(levelEl);
    row.appendChild(barEl);
    row.appendChild(xpEl);
    skillsContainer.appendChild(row);

    skillRows.set(skillDef.id, { row, levelEl, barEl, xpEl });
  }
}

function buildJobRows(): void {
  clearChildren(jobsContainer);
  jobRows.clear();

  for (const jobDef of Object.values(JOBS)) {
    const row = el('div', { className: 'stat-row' });
    const nameEl = el('span', { className: 'stat-row__name', text: jobDef.name });
    const levelEl = el('span', { className: 'stat-row__level', text: '0' });
    const barEl = progressBar(0);
    const xpEl = el('span', {
      className: 'stat-row__prestige',
      text: '',
    });

    const payEl = el('span', {
      className: 'stat-row__pay',
      text: `${jobDef.moneyPerTick} gold/day`,
    });

    row.appendChild(nameEl);
    row.appendChild(levelEl);
    row.appendChild(barEl);
    row.appendChild(xpEl);
    row.appendChild(payEl);
    jobsContainer.appendChild(row);

    jobRows.set(jobDef.id, { levelEl, barEl, xpEl, payEl });
  }
}

export function updateStatsPanel(): void {
  const state = store.getState();

  // Update skills
  for (const skillState of state.skills) {
    const cached = skillRows.get(skillState.skillId);
    if (!cached) continue;
    setText(cached.levelEl, String(skillState.level));
    const fraction = skillState.xpToNextLevel > 0
      ? skillState.xp / skillState.xpToNextLevel
      : 0;
    updateProgressBar(cached.barEl, fraction);
    setText(
      cached.xpEl,
      `${formatNumber(skillState.xp)}/${formatNumber(skillState.xpToNextLevel)}`,
    );

    // Build tooltip
    const skillDef = SKILLS[skillState.skillId];
    if (skillDef) {
      let tooltip = skillDef.description;
      tooltip += `\nSoft cap: ${skillDef.softCap}`;
      if (skillDef.type === 'meta') {
        tooltip += `\nCurrent bonus: +${skillState.level}% XP to all sources`;
      }
      const prestige = state.prestige.skillPrestige.find(sp => sp.skillId === skillState.skillId);
      if (prestige && prestige.totalLevelsAllLives > 0) {
        tooltip += `\nPrestige bonus: +${prestige.totalLevelsAllLives}% XP`;
      }
      cached.row.title = tooltip;
    }
  }

  // Update jobs
  for (const jobState of state.jobs) {
    const cached = jobRows.get(jobState.jobId);
    if (!cached) continue;
    setText(cached.levelEl, String(jobState.level));
    const fraction = jobState.xpToNextLevel > 0
      ? jobState.xp / jobState.xpToNextLevel
      : 0;
    updateProgressBar(cached.barEl, fraction);
    setText(
      cached.xpEl,
      `${formatNumber(jobState.xp)}/${formatNumber(jobState.xpToNextLevel)}`,
    );
  }

  // Update lifestyle display
  updateLifestyleDisplay();

  // Update prestige display
  updatePrestigeDisplay();
}

function updateLifestyleDisplay(): void {
  const state = store.getState();

  if (state.player.currentHousingId) {
    const housing = HOUSING_OPTIONS[state.player.currentHousingId];
    if (housing) {
      setText(lifestyleHousingEl, `Housing: ${housing.name} (${housing.dailyCost} gold/day, +${housing.xpBonusPercent}% XP)`);
    } else {
      setText(lifestyleHousingEl, 'Sleeping Rough (Free)');
    }
  } else {
    setText(lifestyleHousingEl, 'Sleeping Rough (Free)');
  }

  if (state.player.currentFoodId) {
    const food = FOOD_OPTIONS[state.player.currentFoodId];
    if (food) {
      setText(lifestyleFoodEl, `Food: ${food.name} (${food.dailyCost} gold/day, +${food.xpBonusPercent}% XP)`);
    } else {
      setText(lifestyleFoodEl, 'Going Hungry (Free)');
    }
  } else {
    setText(lifestyleFoodEl, 'Going Hungry (Free)');
  }
}

function updatePrestigeDisplay(): void {
  const state = store.getState();
  clearChildren(prestigeContainer);

  const hasPrestige =
    state.prestige.skillPrestige.some((sp) => sp.totalLevelsAllLives > 0) ||
    state.prestige.jobPrestige.some((jp) => jp.totalLevelsAllLives > 0);

  if (!hasPrestige) {
    prestigeContainer.appendChild(
      el('div', {
        className: 'stat-row',
        text: 'No prestige bonuses yet. Complete a life to earn them.',
      }),
    );
    return;
  }

  for (const sp of state.prestige.skillPrestige) {
    if (sp.totalLevelsAllLives <= 0) continue;
    const skillDef = SKILLS[sp.skillId];
    const name = skillDef?.name ?? sp.skillId;
    const bonus = sp.totalLevelsAllLives;
    const row = el('div', {
      className: 'stat-row',
      text: `+${bonus}% ${name} XP`,
    });
    prestigeContainer.appendChild(row);
  }

  for (const jp of state.prestige.jobPrestige) {
    if (jp.totalLevelsAllLives <= 0) continue;
    const jobDef = JOBS[jp.jobId];
    const name = jobDef?.name ?? jp.jobId;
    const bonus = jp.totalLevelsAllLives;
    const row = el('div', {
      className: 'stat-row',
      text: `+${bonus}% ${name} XP`,
    });
    prestigeContainer.appendChild(row);
  }
}
