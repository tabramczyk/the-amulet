import { store } from '../state/store';
import { LOCATIONS } from '../data/locations';
import { DAYS_PER_YEAR } from '../core/time';
import { el, setText, formatNumber } from './dom-helpers';
import { getDailyEarnings, getDailyExpenses } from '../systems/economy-system';

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
  const earnings = getDailyEarnings(state.player.activeJobActionId, state.player.activeSkillActionId, state.jobs, state.skills);
  const expenses = getDailyExpenses(state.player.currentHousingId, state.player.currentFoodId);
  const net = earnings - expenses;
  const sign = net >= 0 ? '+' : '';
  setText(balanceValue, `${sign}${net} gold/day`);
  balanceValue.className = net >= 0 ? 'top-bar__value top-bar__value--positive' : 'top-bar__value top-bar__value--negative';

  const lives = state.reincarnation.livesLived;
  setText(livesLabel, `Life: ${lives + 1}`);
}
