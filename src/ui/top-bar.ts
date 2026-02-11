import { store } from '../state/store';
import { LOCATIONS } from '../data/locations';
import { HOUSING_OPTIONS } from '../data/housing';
import { FOOD_OPTIONS } from '../data/food';
import { CONTINUOUS_ACTIONS } from '../data/actions';
import { DAYS_PER_YEAR } from '../core/time';
import { el, setText, formatNumber } from './dom-helpers';

let ageValue: HTMLElement;
let dayValue: HTMLElement;
let moneyValue: HTMLElement;
let balanceValue: HTMLElement;
let locationLabel: HTMLElement;
let livesLabel: HTMLElement;
let container: HTMLElement;

export function createTopBar(): HTMLElement {
  container = el('div', { className: 'top-bar' });

  // Age stat
  const ageStat = el('div', { className: 'top-bar__stat' });
  ageStat.appendChild(el('span', { className: 'top-bar__label', text: 'Age:' }));
  ageValue = el('span', { className: 'top-bar__value', text: '16' });
  ageStat.appendChild(ageValue);

  // Day stat
  const dayStat = el('div', { className: 'top-bar__stat' });
  dayStat.appendChild(el('span', { className: 'top-bar__label', text: 'Day:' }));
  dayValue = el('span', { className: 'top-bar__value', text: '0' });
  dayStat.appendChild(dayValue);

  // Money stat
  const moneyStat = el('div', { className: 'top-bar__stat' });
  moneyStat.appendChild(el('span', { className: 'top-bar__label', text: 'Gold:' }));
  moneyValue = el('span', { className: 'top-bar__value', text: '0' });
  moneyStat.appendChild(moneyValue);

  // Balance stat
  const balanceStat = el('div', { className: 'top-bar__stat' });
  balanceStat.appendChild(el('span', { className: 'top-bar__label', text: 'Net:' }));
  balanceValue = el('span', { className: 'top-bar__value', text: '0' });
  balanceStat.appendChild(balanceValue);

  // Location
  locationLabel = el('span', { className: 'top-bar__location', text: 'The Slums' });

  // Lives
  livesLabel = el('span', { className: 'top-bar__lives', text: '' });

  container.appendChild(ageStat);
  container.appendChild(dayStat);
  container.appendChild(moneyStat);
  container.appendChild(balanceStat);
  container.appendChild(locationLabel);
  container.appendChild(livesLabel);

  return container;
}

export function updateTopBar(): void {
  const state = store.getState();
  setText(ageValue, String(state.time.currentAge));
  setText(dayValue, formatNumber((state.time.currentDay % DAYS_PER_YEAR) + 1));
  setText(moneyValue, formatNumber(state.player.money));

  const loc = LOCATIONS[state.player.currentLocationId];
  setText(locationLabel, loc?.name ?? state.player.currentLocationId);

  // Calculate daily balance
  let earnings = 0;
  for (const actionId of [state.player.activeJobActionId, state.player.activeSkillActionId]) {
    if (actionId) {
      const action = CONTINUOUS_ACTIONS[actionId];
      if (action) {
        earnings += action.effects
          .filter((e): e is { type: 'addMoney'; amount: number } => e.type === 'addMoney')
          .reduce((sum, e) => sum + e.amount, 0);
      }
    }
  }
  const housingCost = state.player.currentHousingId
    ? (HOUSING_OPTIONS[state.player.currentHousingId]?.dailyCost ?? 0)
    : 0;
  const foodCost = state.player.currentFoodId
    ? (FOOD_OPTIONS[state.player.currentFoodId]?.dailyCost ?? 0)
    : 0;
  const net = earnings - housingCost - foodCost;
  const sign = net >= 0 ? '+' : '';
  setText(balanceValue, `${sign}${net} gold/day`);
  balanceValue.className = net >= 0 ? 'top-bar__value top-bar__value--positive' : 'top-bar__value top-bar__value--negative';

  const lives = state.prestige.livesLived;
  setText(livesLabel, lives > 0 ? `Lives: ${lives}` : '');
}
