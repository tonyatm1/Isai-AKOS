// ISAI INITIATIVE ENGINE

const STORAGE_KEY = "isai_initiative_v1";

const DEFAULT_STATE = {
  lastDecision: null,
  lastInitiatedAt: null,
  attempts: 0,
  cooldownUntil: null
};

export class InitiativeEngine {
  constructor({ memory, emotion, relationship }) {
    this.memory = memory;
    this.emotion = emotion;
    this.relationship = relationship;
    this.state = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved
        ? { ...DEFAULT_STATE, ...JSON.parse(saved) }
        : { ...DEFAULT_STATE };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.state)
    );
  }

  canInitiate() {
    if (!this.state.cooldownUntil) {
      return true;
    }

    return Date.now() >=
      new Date(this.state.cooldownUntil).getTime();
  }

  evaluate(context = {}) {
    const emotion = this.emotion.getState();
    const relationship = this.relationship.getState();

    const recentMemories =
      this.memory.getRecent(10);

    let score = 0;
    const reasons = [];

    // Stronger relationship gives more context
    score += relationship.familiarity * 0.15;
    score += relationship.attachment * 0.15;

    // Emotional state can create a reason to check in
    if (emotion.concern > 0.65) {
      score += 0.25;
      reasons.push("elevated concern");
    }

    if (emotion.curiosity > 0.70) {
      score += 0.10;
      reasons.push("high curiosity");
    }

    if (emotion.loneliness > 0.65) {
      score += 0.10;
      reasons.push("extended absence");
    }

    // Recent meaningful memories matter
    const meaningfulMemory =
      recentMemories.some(
        memory =>
          memory.importance >= 0.75
      );

    if (meaningfulMemory) {
      score += 0.20;
      reasons.push("meaningful memory");
    }

    // External context can add a reason
    if (context.reason) {
      score += 0.20;
      reasons.push("contextual reason");
    }

    score = Math.max(
      0,
      Math.min(1, score)
    );

    const allowed = this.canInitiate();

    const shouldInitiate =
      allowed && score >= 0.55;

    const decision = {
      shouldInitiate,
      score,
      reasons,
      generatedAt: new Date().toISOString()
    };

    this.state.lastDecision = decision;
    this.save();

    return decision;
  }

  recordInitiation() {
    const now = new Date();

    this.state.lastInitiatedAt =
      now.toISOString();

    this.state.attempts++;

    // Prevent repeated messages
    this.state.cooldownUntil =
      new Date(
        now.getTime() + 30 * 60 * 1000
      ).toISOString();

    this.save();
  }

  getState() {
    return {
      ...this.state
    };
  }
}

export const initiativeState = null;
