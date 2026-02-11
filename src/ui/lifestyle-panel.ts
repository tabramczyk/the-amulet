import { store } from '../state/store';
import { HOUSING_OPTIONS } from '../data/housing';
import { FOOD_OPTIONS } from '../data/food';
import { el, clearChildren } from './dom-helpers';

let panel: HTMLElement;
let housingContainer: HTMLElement;
let foodContainer: HTMLElement;
let lastLocationId: string | null = null;

// Cache for housing buttons
const housingCache = new Map<string | 'none', { btn: HTMLButtonElement }>();
// Cache for food buttons
const foodCache = new Map<string | 'none', { btn: HTMLButtonElement }>();

export function createLifestylePanel(): HTMLElement {
  panel = el('div', { className: 'panel lifestyle-panel' });

  // Housing section (left)
  const housingSection = el('div', { className: 'lifestyle-section' });
  housingSection.appendChild(el('h3', { className: 'lifestyle-section__title', text: 'Housing' }));
  housingContainer = el('div', { className: 'lifestyle-options' });
  housingSection.appendChild(housingContainer);

  // Food section (right)
  const foodSection = el('div', { className: 'lifestyle-section' });
  foodSection.appendChild(el('h3', { className: 'lifestyle-section__title', text: 'Food' }));
  foodContainer = el('div', { className: 'lifestyle-options' });
  foodSection.appendChild(foodContainer);

  panel.appendChild(housingSection);
  panel.appendChild(foodSection);

  buildFoodButtons(); // Food is global, build once

  return panel;
}

function buildHousingButtons(locationId: string): void {
  clearChildren(housingContainer);
  housingCache.clear();

  // "None" option
  const noneBtn = document.createElement('button');
  noneBtn.className = 'lifestyle-option';
  noneBtn.textContent = 'Sleeping Rough (Free)';
  noneBtn.addEventListener('click', () => {
    store.getState().updatePlayer({ currentHousingId: null });
  });
  housingContainer.appendChild(noneBtn);
  housingCache.set('none', { btn: noneBtn });

  // Location-specific options
  for (const option of Object.values(HOUSING_OPTIONS)) {
    if (option.locationId !== locationId) continue;
    const btn = document.createElement('button');
    btn.className = 'lifestyle-option';
    btn.textContent = `${option.name} (${option.dailyCost} gold/day, +${option.xpBonusPercent}% XP)`;
    btn.title = option.description;
    btn.addEventListener('click', () => {
      store.getState().updatePlayer({ currentHousingId: option.id });
    });
    housingContainer.appendChild(btn);
    housingCache.set(option.id, { btn });
  }

  lastLocationId = locationId;
}

function buildFoodButtons(): void {
  clearChildren(foodContainer);
  foodCache.clear();

  // "None" option
  const noneBtn = document.createElement('button');
  noneBtn.className = 'lifestyle-option';
  noneBtn.textContent = 'Going Hungry (Free)';
  noneBtn.addEventListener('click', () => {
    store.getState().updatePlayer({ currentFoodId: null });
  });
  foodContainer.appendChild(noneBtn);
  foodCache.set('none', { btn: noneBtn });

  // All food options (global)
  for (const option of Object.values(FOOD_OPTIONS)) {
    const btn = document.createElement('button');
    btn.className = 'lifestyle-option';
    btn.textContent = `${option.name} (${option.dailyCost} gold/day, +${option.xpBonusPercent}% XP)`;
    btn.title = option.description;
    btn.addEventListener('click', () => {
      store.getState().updatePlayer({ currentFoodId: option.id });
    });
    foodContainer.appendChild(btn);
    foodCache.set(option.id, { btn });
  }
}

export function updateLifestylePanel(): void {
  const state = store.getState();
  const locationId = state.player.currentLocationId;

  // Rebuild housing buttons on location change
  if (locationId !== lastLocationId) {
    buildHousingButtons(locationId);
  }

  // Update housing active state
  const activeHousing = state.player.currentHousingId;
  for (const [id, cached] of housingCache) {
    const isActive = (id === 'none' && activeHousing === null) || id === activeHousing;
    cached.btn.className = isActive ? 'lifestyle-option lifestyle-option--active' : 'lifestyle-option';
  }

  // Update food active state
  const activeFood = state.player.currentFoodId;
  for (const [id, cached] of foodCache) {
    const isActive = (id === 'none' && activeFood === null) || id === activeFood;
    cached.btn.className = isActive ? 'lifestyle-option lifestyle-option--active' : 'lifestyle-option';
  }
}
