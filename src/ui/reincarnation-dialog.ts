import type { GameState } from '../../specs/schemas';
import {
  accumulateSkillReincarnation,
  accumulateJobReincarnation,
  calculateReincarnationBonus,
} from '../systems/reincarnation-system';
import { SKILLS } from '../data/skills';
import { JOBS } from '../data/jobs';

/**
 * Show a confirmation dialog before voluntary reincarnation.
 * Returns a Promise that resolves true if the player confirms, false if they cancel.
 * The dialog is removed from the DOM when the promise resolves.
 */
export function showReincarnationDialog(state: GameState): Promise<boolean> {
  return new Promise((resolve) => {
    // Overlay backdrop
    const overlay = document.createElement('div');
    overlay.className = 'reincarnation-dialog';

    // Card container
    const card = document.createElement('div');
    card.className = 'reincarnation-dialog__card';

    // Title
    const titleEl = document.createElement('h2');
    titleEl.className = 'reincarnation-dialog__title';
    titleEl.textContent = 'Touch the Amulet';

    // Explanation text
    const textEl = document.createElement('p');
    textEl.className = 'reincarnation-dialog__text';
    textEl.textContent =
      'The amulet\'s power will send you back in time. You will be reborn at age 16. All your skills, jobs, money, and progress will be lost.';

    // Reincarnation Bonuses section title
    const bonusesTitleEl = document.createElement('div');
    bonusesTitleEl.className = 'reincarnation-dialog__bonuses-title';
    bonusesTitleEl.textContent = 'Reincarnation Bonuses';

    // Compute projected bonuses
    const projectedSkillBonuses = accumulateSkillReincarnation(
      state.skills,
      state.reincarnation.skillBonuses,
    );
    const projectedJobBonuses = accumulateJobReincarnation(
      state.jobs,
      state.reincarnation.jobBonuses,
    );

    // Build bonus list container
    const bonusesList = document.createElement('div');

    // Skill bonuses
    for (const projectedBonus of projectedSkillBonuses) {
      const skillId = projectedBonus.skillId;
      const currentSkill = state.skills.find((s) => s.skillId === skillId);
      const currentBonus = state.reincarnation.skillBonuses.find((b) => b.skillId === skillId);

      const currentLevels = currentBonus?.totalLevelsAllLives ?? 0;
      const projectedLevels = projectedBonus.totalLevelsAllLives;

      // Only show if there is a current bonus or the skill has been leveled this life
      if (currentLevels === 0 && (currentSkill?.level ?? 0) === 0) continue;

      const skillName = SKILLS[skillId]?.name ?? skillId;
      const currentPct = Math.round((calculateReincarnationBonus(currentLevels) - 1) * 100);
      const projectedPct = Math.round((calculateReincarnationBonus(projectedLevels) - 1) * 100);

      const row = document.createElement('div');
      row.className = 'reincarnation-dialog__bonus-item';
      row.textContent = `${skillName}: +${currentPct}% → +${projectedPct}% XP`;
      bonusesList.appendChild(row);
    }

    // Job bonuses
    for (const projectedBonus of projectedJobBonuses) {
      const jobId = projectedBonus.jobId;
      const currentJob = state.jobs.find((j) => j.jobId === jobId);
      const currentBonus = state.reincarnation.jobBonuses.find((b) => b.jobId === jobId);

      const currentLevels = currentBonus?.totalLevelsAllLives ?? 0;
      const projectedLevels = projectedBonus.totalLevelsAllLives;

      // Only show if there is a current bonus or the job has been leveled this life
      if (currentLevels === 0 && (currentJob?.level ?? 0) === 0) continue;

      const jobName = JOBS[jobId]?.name ?? jobId;
      const currentPct = Math.round((calculateReincarnationBonus(currentLevels) - 1) * 100);
      const projectedPct = Math.round((calculateReincarnationBonus(projectedLevels) - 1) * 100);

      const row = document.createElement('div');
      row.className = 'reincarnation-dialog__bonus-item';
      row.textContent = `${jobName}: +${currentPct}% → +${projectedPct}% XP`;
      bonusesList.appendChild(row);
    }

    // Buttons row
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'reincarnation-dialog__buttons';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'reincarnation-dialog__btn reincarnation-dialog__btn--confirm';
    confirmBtn.textContent = 'Touch the Amulet';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'reincarnation-dialog__btn reincarnation-dialog__btn--cancel';
    cancelBtn.textContent = 'Step Away';

    buttonsEl.appendChild(confirmBtn);
    buttonsEl.appendChild(cancelBtn);

    // Assemble card
    card.appendChild(titleEl);
    card.appendChild(textEl);
    card.appendChild(bonusesTitleEl);
    card.appendChild(bonusesList);
    card.appendChild(buttonsEl);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    function cleanup(result: boolean): void {
      document.body.removeChild(overlay);
      resolve(result);
    }

    confirmBtn.addEventListener('click', () => cleanup(true));
    cancelBtn.addEventListener('click', () => cleanup(false));
  });
}
