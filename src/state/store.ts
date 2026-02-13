import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import {
  GameStateSchema,
  type GameState,
  type TimeState,
  type PlayerState,
  type SkillState,
  type JobState,
  type ReincarnationState,
} from '../../specs/schemas';
import { SKILLS } from '../data/skills';
import { JOBS } from '../data/jobs';
import { createInitialTimeState, STARTING_AGE } from '../core/time';

// --- Initial State Factories ---

function createInitialSkillStates(): SkillState[] {
  return Object.keys(SKILLS).map((skillId) => ({
    skillId,
    level: 0,
    xp: 0,
    xpToNextLevel: 10, // baseXP * (0 + 1) = 10 * 1 = 10
  }));
}

function createInitialJobStates(): JobState[] {
  return Object.keys(JOBS).map((jobId) => ({
    jobId,
    level: 0,
    xp: 0,
    xpToNextLevel: 10,
  }));
}

function createInitialReincarnationState(): ReincarnationState {
  return {
    livesLived: 0,
    totalDaysAllLives: 0,
    skillBonuses: Object.keys(SKILLS).map((skillId) => ({
      skillId,
      totalLevelsAllLives: 0,
    })),
    jobBonuses: Object.keys(JOBS).map((jobId) => ({
      jobId,
      totalLevelsAllLives: 0,
    })),
  };
}

const INITIAL_MESSAGE = "You've been walking the Slums when you found a strange looking amulet.";

function createInitialPlayerState(): PlayerState {
  return {
    money: 0,
    currentLocationId: 'slums',
    activeJobId: null,
    activeJobActionId: null,
    activeSkillActionId: null,
    currentHousingId: null,
    currentFoodId: null,
    storyFlags: {},
    clanIds: [],
    messageLog: [INITIAL_MESSAGE],
    pendingRelocation: null,
  };
}

export function createInitialGameState(): GameState {
  return {
    version: '0.1.0',
    time: createInitialTimeState(),
    player: createInitialPlayerState(),
    skills: createInitialSkillStates(),
    jobs: createInitialJobStates(),
    reincarnation: createInitialReincarnationState(),
    isRunning: false,
    isAlive: true,
  };
}

// --- Store Actions ---

export interface GameActions {
  updateTime: (time: Partial<TimeState>) => void;
  updatePlayer: (player: Partial<PlayerState>) => void;
  updateSkill: (skillId: string, updates: Partial<SkillState>) => void;
  updateJob: (jobId: string, updates: Partial<JobState>) => void;
  advanceDays: (days: number) => void;
  setRunning: (running: boolean) => void;
  addMessage: (message: string) => void;
  resetForReincarnation: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

const STORAGE_KEY = 'the-amulet-save';

export const store = createStore<GameStore>()(
  persist(
    (set) => ({
      ...createInitialGameState(),

      updateTime: (timeUpdates) =>
        set((state) => ({
          time: { ...state.time, ...timeUpdates },
        })),

      updatePlayer: (playerUpdates) =>
        set((state) => ({
          player: { ...state.player, ...playerUpdates },
        })),

      updateSkill: (skillId, updates) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.skillId === skillId ? { ...s, ...updates } : s,
          ),
        })),

      updateJob: (jobId, updates) =>
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.jobId === jobId ? { ...j, ...updates } : j,
          ),
        })),

      advanceDays: (days) =>
        set((state) => {
          const newDay = state.time.currentDay + days;
          const newAge = STARTING_AGE + Math.floor(newDay / 365);
          return {
            time: {
              ...state.time,
              currentDay: newDay,
              currentAge: newAge,
            },
          };
        }),

      setRunning: (running) => set({ isRunning: running }),

      addMessage: (message) =>
        set((state) => ({
          player: {
            ...state.player,
            messageLog: [...state.player.messageLog, message],
          },
        })),

      resetForReincarnation: () =>
        set((state) => ({
          time: createInitialTimeState(),
          player: {
            ...createInitialPlayerState(),
            storyFlags: { intro_complete: true },
            messageLog: [INITIAL_MESSAGE],
          },
          skills: createInitialSkillStates(),
          jobs: createInitialJobStates(),
          reincarnation: {
            ...state.reincarnation,
            livesLived: state.reincarnation.livesLived + 1,
            totalDaysAllLives:
              state.reincarnation.totalDaysAllLives + state.time.currentDay,
            skillBonuses: state.reincarnation.skillBonuses.map((sp) => {
              const currentSkill = state.skills.find(
                (s) => s.skillId === sp.skillId,
              );
              return {
                ...sp,
                totalLevelsAllLives:
                  sp.totalLevelsAllLives + (currentSkill?.level ?? 0),
              };
            }),
            jobBonuses: state.reincarnation.jobBonuses.map((jp) => {
              const currentJob = state.jobs.find(
                (j) => j.jobId === jp.jobId,
              );
              return {
                ...jp,
                totalLevelsAllLives:
                  jp.totalLevelsAllLives + (currentJob?.level ?? 0),
              };
            }),
          },
          isAlive: true,
          isRunning: false,
        })),

      resetGame: () => set(createInitialGameState()),
    }),
    {
      name: STORAGE_KEY,
      // Validate loaded state with Zod
      merge: (persistedState, currentState) => {
        const result = GameStateSchema.safeParse(persistedState);
        if (result.success) {
          return { ...currentState, ...result.data };
        }
        // Invalid data - use default state
        return currentState;
      },
    },
  ),
);
