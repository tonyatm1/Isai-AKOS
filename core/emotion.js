// ISAI EMOTION ENGINE

const DEFAULT_EMOTION = {
  mood: "calm",
  affection: 0.50,
  concern: 0.00,
  curiosity: 0.50,
  energy: 0.50,
  loneliness: 0.00,
  happiness: 0.50
};

export class EmotionEngine {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem("isai_emotion_v1");
      return saved
        ? { ...DEFAULT_EMOTION, ...JSON.parse(saved) }
        : { ...DEFAULT_EMOTION };
    } catch {
      return { ...DEFAULT_EMOTION };
    }
  }

  save() {
    localStorage.setItem(
      "isai_emotion_v1",
      JSON.stringify(this.state)
    );
  }

  clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  update(changes = {}) {
    Object.keys(changes).forEach(key => {
      if (key === "mood") {
        this.state.mood = changes[key];
        return;
      }

      if (key in this.state) {
        this.state[key] = this.clamp(
          this.state[key] + changes[key]
        );
      }
    });

    this.save();

    return this.getState();
  }

  setMood(mood) {
    this.state.mood = mood;
    this.save();
    return this.state.mood;
  }

  react(event = {}) {
    const type = event.type || "neutral";

    switch (type) {
      case "happy":
        this.update({
          happiness: 0.12,
          energy: 0.05,
          affection: 0.04
        });
        this.setMood("happy");
        break;

      case "sad":
        this.update({
          concern: 0.12,
          happiness: -0.10,
          energy: -0.05
        });
        this.setMood("concerned");
        break;

      case "stress":
        this.update({
          concern: 0.18,
          energy: -0.08
        });
        this.setMood("concerned");
        break;

      case "long_absence":
        this.update({
          loneliness: 0.10,
          concern: 0.05,
          affection: 0.03
        });
        this.setMood("thoughtful");
        break;

      case "conversation":
        this.update({
          loneliness: -0.08,
          happiness: 0.05,
          energy: 0.03
        });
        this.setMood("connected");
        break;

      default:
        this.update({
          curiosity: 0.02
        });
    }

    return this.getState();
  }

  decay() {
    this.state.loneliness =
      this.clamp(this.state.loneliness * 0.98);

    this.state.concern =
      this.clamp(this.state.concern * 0.97);

    this.state.curiosity =
      this.clamp(this.state.curiosity * 0.99);

    this.save();

    return this.getState();
  }

  getState() {
    return { ...this.state };
  }
}

export const emotion = new EmotionEngine();
