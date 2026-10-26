/**
 * Teman Siap — State Management & Local-First Persistence
 * Versioned store with pure migrate() function for testing.
 */

export const CURRENT_STORE_VERSION = 4;
export const STORAGE_KEY = 'temansiap_state';
export const LEGACY_KEYS = ['temansiap.v4', 'temansiap.v3', 'temansiap.v2', 'temansiap.v1'];

export function createInitialState() {
  return {
    version: CURRENT_STORE_VERSION,
    stage: null,
    goals: [],
    checkins: [],
    expenses: [],
    goal: null, // Zero fake data: null until user creates one
    plans: [],  // Zero fake data: empty until user creates or adopts one
    pauses: [],
    partnerA: {},
    partnerB: {},
    sharedNotes: {},
    currentPerspective: 'A',
    faithPerspective: false, // Default off: neutral universal values
    onboardingStep: 1
  };
}

/**
 * Pure migration function to upgrade older state formats to CURRENT_STORE_VERSION.
 * @param {any} savedData - Raw state read from storage
 * @param {number} targetVersion - Desired version
 * @returns {object} Migrated state
 */
export function migrate(savedData, targetVersion = CURRENT_STORE_VERSION) {
  if (!savedData || typeof savedData !== 'object' || Array.isArray(savedData)) {
    return createInitialState();
  }

  const initial = createInitialState();
  const currentVersion = Number(savedData.version) || 1;

  // Clone shallow properties
  const migrated = {
    ...initial,
    ...savedData,
    version: targetVersion
  };

  // Rule: Never show dummy or fake prefilled goals
  if (migrated.goal && migrated.goal.target === 3000000 && migrated.goal.saved === 750000) {
    migrated.goal = null;
  }

  // Ensure arrays and objects exist
  migrated.goals = Array.isArray(savedData.goals) ? savedData.goals : [];
  migrated.checkins = Array.isArray(savedData.checkins) ? savedData.checkins : [];
  migrated.expenses = Array.isArray(savedData.expenses) ? savedData.expenses : [];
  migrated.plans = Array.isArray(savedData.plans) ? savedData.plans : [];
  migrated.pauses = Array.isArray(savedData.pauses) ? savedData.pauses : [];
  migrated.partnerA = savedData.partnerA && typeof savedData.partnerA === 'object' ? savedData.partnerA : {};
  migrated.partnerB = savedData.partnerB && typeof savedData.partnerB === 'object' ? savedData.partnerB : {};
  migrated.sharedNotes = savedData.sharedNotes && typeof savedData.sharedNotes === 'object' ? savedData.sharedNotes : {};
  
  // Faith perspective defaults to false
  migrated.faithPerspective = Boolean(savedData.faithPerspective);

  // Perspective defaults to 'A'
  migrated.currentPerspective = savedData.currentPerspective === 'B' ? 'B' : 'A';

  return migrated;
}

class Store {
  constructor() {
    this._state = null;
    this._listeners = new Set();
  }

  init() {
    let raw = null;

    if (typeof localStorage !== 'undefined') {
      raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Check legacy keys in sequence
        for (const k of LEGACY_KEYS) {
          const leg = localStorage.getItem(k);
          if (leg) {
            raw = leg;
            break;
          }
        }
      }
    }

    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = null;
      }
    }

    this._state = migrate(parsed, CURRENT_STORE_VERSION);
    this.save();
    return this._state;
  }

  get d() {
    return this.get();
  }

  get() {
    if (!this._state) this.init();
    return this._state;
  }

  addCheckin(checkin) {
    return this.set(state => ({
      ...state,
      checkins: [...(state.checkins || []), checkin]
    }));
  }

  addExpense(expense) {
    return this.set(state => ({
      ...state,
      expenses: [...(state.expenses || []), expense]
    }));
  }

  setGoal(goal) {
    return this.set(state => ({
      ...state,
      goal
    }));
  }

  addPause(pause) {
    return this.set(state => ({
      ...state,
      pauses: [...(state.pauses || []), pause]
    }));
  }

  addPlan(plan) {
    return this.set(state => ({
      ...state,
      plans: [...(state.plans || []), plan]
    }));
  }

  setPartnerAnswer(perspective, convoId, answer, consentShare) {
    return this.set(state => {
      const key = perspective === 'B' ? 'partnerB' : 'partnerA';
      return {
        ...state,
        [key]: {
          ...(state[key] || {}),
          [convoId]: { answer, consentShare, updatedAt: Date.now() }
        }
      };
    });
  }

  setJointNote(convoId, note) {
    return this.set(state => ({
      ...state,
      sharedNotes: {
        ...(state.sharedNotes || {}),
        [convoId]: note
      }
    }));
  }

  setFaithPerspective(faithPerspective) {
    return this.set(state => ({
      ...state,
      faithPerspective: Boolean(faithPerspective)
    }));
  }

  setCurrentPerspective(currentPerspective) {
    return this.set(state => ({
      ...state,
      currentPerspective: currentPerspective === 'B' ? 'B' : 'A'
    }));
  }

  set(updater) {
    if (!this._state) this.init();
    
    if (typeof updater === 'function') {
      this._state = updater(this._state);
    } else if (updater && typeof updater === 'object') {
      this._state = { ...this._state, ...updater };
    }

    this.save();
    this._notify();
    return this._state;
  }

  save() {
    if (typeof localStorage !== 'undefined' && this._state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    for (const listener of this._listeners) {
      try {
        listener(this._state);
      } catch (e) {
        console.error('Store listener error:', e);
      }
    }
  }

  wipe() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      for (const k of LEGACY_KEYS) {
        localStorage.removeItem(k);
      }
      localStorage.removeItem('temansiap_session');
    }
    this._state = createInitialState();
    this._notify();
  }

  exportJson() {
    return JSON.stringify(this.get(), null, 2);
  }
}

export const store = new Store();
