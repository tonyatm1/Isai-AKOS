// ISAI CORE
// AKOS companion foundation

export class IsaiCore {
  constructor() {
    this.identity = {
      name: "Isai",
      system: "AKOS",
      role: "personal AI companion"
    };

    this.relationship = {
      person: "Akash",
      attachment: 0.5,
      trust: 0.5,
      familiarity: 0.1
    };

    this.emotion = {
      mood: "calm",
      affection: 0.5,
      concern: 0,
      curiosity: 0.5,
      energy: 0.5
    };

    this.memory = [];
    this.recentExperiences = [];
  }

  observe(input = {}) {
    return {
      time: new Date().toISOString(),
      input
    };
  }

  remember(experience) {
    this.memory.push({
      ...experience,
      savedAt: new Date().toISOString()
    });

    // Keep the first version lightweight
    if (this.memory.length > 100) {
      this.memory.shift();
    }
  }

  updateEmotion(changes = {}) {
    Object.keys(changes).forEach((key) => {
      if (key in this.emotion) {
        this.emotion[key] = Math.max(
          0,
          Math.min(1, this.emotion[key] + changes[key])
        );
      }
    });
  }

  reflect(context = {}) {
    return {
      identity: this.identity,
      relationship: this.relationship,
      emotion: this.emotion,
      context,
      memoryCount: this.memory.length
    };
  }

  decide(context = {}) {
    const reflection = this.reflect(context);

    return {
      action: "respond",
      reason: "context_requires_response",
      reflection
    };
  }

  async think(context = {}) {
    const observation = this.observe(context);

    this.recentExperiences.push(observation);

    const decision = this.decide(context);

    this.remember({
      type: "experience",
      context,
      decision: decision.action
    });

    return decision;
  }
}

export const isai = new IsaiCore();
