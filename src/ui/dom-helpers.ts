/**
 * DOM helper utilities for building UI elements safely.
 * All dynamic content uses textContent or DOM API (never innerHTML) per SEC-02.
 */

import type { ActionRequirement } from '../../specs/schemas';
import { SKILLS } from '../data/skills';
import { JOBS } from '../data/jobs';

/** Create an element with optional class names and text content. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts?: { className?: string; text?: string; id?: string },
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (opts?.className) element.className = opts.className;
  if (opts?.text) element.textContent = opts.text;
  if (opts?.id) element.id = opts.id;
  return element;
}

/** Append multiple children to a parent element. */
export function appendChildren(
  parent: HTMLElement,
  children: HTMLElement[],
): void {
  for (const child of children) {
    parent.appendChild(child);
  }
}

/** Remove all children from an element safely. */
export function clearChildren(parent: HTMLElement): void {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/** Create a button with a click handler and label. */
export function button(
  label: string,
  onClick: () => void,
  opts?: { className?: string; disabled?: boolean; title?: string },
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  if (opts?.className) btn.className = opts.className;
  if (opts?.disabled) btn.disabled = true;
  if (opts?.title) btn.title = opts.title;
  return btn;
}

/** Set text of an element only if changed (avoids unnecessary DOM writes). */
export function setText(element: HTMLElement, text: string): void {
  if (element.textContent !== text) {
    element.textContent = text;
  }
}

/** Format a number with commas. */
export function formatNumber(n: number): string {
  return Math.floor(n).toLocaleString();
}

/** Create a progress bar element (0-1 range). */
export function progressBar(
  fraction: number,
  opts?: { className?: string },
): HTMLElement {
  const container = el('div', { className: `progress-bar ${opts?.className ?? ''}`.trim() });
  const fill = el('div', { className: 'progress-bar__fill' });
  fill.style.width = `${Math.min(100, Math.max(0, fraction * 100))}%`;
  container.appendChild(fill);
  return container;
}

/** Update an existing progress bar fill width. */
export function updateProgressBar(
  container: HTMLElement,
  fraction: number,
): void {
  const fill = container.querySelector('.progress-bar__fill') as HTMLElement | null;
  if (fill) {
    fill.style.width = `${Math.min(100, Math.max(0, fraction * 100))}%`;
  }
}

/** Format an action requirement into human-readable text. */
export function formatRequirement(req: ActionRequirement): string {
  switch (req.type) {
    case 'skill': {
      const skill = SKILLS[req.skillId];
      const name = skill?.name ?? req.skillId;
      return `${name} Lv.${req.level}`;
    }
    case 'job': {
      const job = JOBS[req.jobId];
      const name = job?.name ?? req.jobId;
      return `${name} Lv.${req.level}`;
    }
    case 'storyFlag':
      return req.flag;
    case 'age': {
      if (req.minAge !== undefined && req.maxAge !== undefined) {
        return `Age ${req.minAge}-${req.maxAge}`;
      }
      if (req.minAge !== undefined) return `Age ${req.minAge}+`;
      if (req.maxAge !== undefined) return `Age ≤${req.maxAge}`;
      return 'Age requirement';
    }
  }
}
