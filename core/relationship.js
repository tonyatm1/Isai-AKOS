// ISAI RELATIONSHIP ENGINE

const STORAGE_KEY = "isai_relationship_v1";

const DEFAULT_RELATIONSHIP = {
  person: "Akash",

  trust: 0.50,
  familiarity: 0.10,
  attachment: 0.50,

  meaningfulInteractions: 0,
  conversations: 0,

  firstMet: null,
  lastInteraction: null,

  importantMoments: []
};

export class RelationshipEngine {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        return {
          ...DEFAULT_RELATIONSHIP,
          ...JSON.parse(saved)
        };
      }
    } catch {}

    return {
      ...DEFAULT_RELATIONSHIP
    };
  }

  save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.state)
    );
  }

  clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  interaction(type = "conversation") {
    const now = new Date().toISOString();

    if (!this.state.firstMet) {
      this.state.firstMet = now;
    }

    this.state.lastInteraction = now;
    this.state.conversations++;

    this.state.familiarity =
      this.clamp(this.state.familiarity + 0.01);

    if (type === "meaningful") {
      this.state.meaningfulInteractions++;

      this.state.trust =
        this.clamp(this.state.trust + 0.02);

      this.state.attachment =
        this.clamp(this.state.attachment + 0.015);
    }

    this.save();

    return this.getState();
  }

  addImportantMoment(moment) {
    if (!moment || !moment.trim()) return;

    this.state.importantMoments.push({
      text: moment.trim(),
      createdAt: new Date().toISOString()
    });

    if (this.state.importantMoments.length > 50) {
      this.state.importantMoments.shift();
    }

    this.state.meaningfulInteractions++;

    this.save();
  }

  update(changes = {}) {
    const scalable = [
      "trust",
      "familiarity",
      "attachment"
    ];

    scalable.forEach(key => {
      if (key in changes) {
        this.state[key] = this.clamp(
          changes[key]
        );
      }
    });

    this.save();

    return this.getState();
  }

  getImportantMoments(limit = 10) {
    return [...this.state.importantMoments]
      .reverse()
      .slice(0, limit);
  }

  getState() {
    return JSON.parse(
      JSON.stringify(this.state)
    );
  }
}

export const relationship =
  new RelationshipEngine();
