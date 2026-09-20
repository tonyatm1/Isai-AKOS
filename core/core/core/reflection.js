// ISAI REFLECTION ENGINE

export class ReflectionEngine {
  constructor({ memory, emotion, relationship }) {
    this.memory = memory;
    this.emotion = emotion;
    this.relationship = relationship;
  }

  analyze(context = {}) {
    const text = context.text || "";

    const relevantMemories = this.memory.search(text, 5);

    const emotionalState = this.emotion.getState();
    const relationshipState = this.relationship.getState();

    const signals = {
      userPresent: context.userPresent !== false,

      emotionalWords:
        this.detectEmotion(text),

      importantTopic:
        this.detectImportance(text),

      question:
        text.includes("?"),

      longMessage:
        text.length > 150
    };

    return {
      context,
      signals,
      relevantMemories,
      emotionalState,
      relationshipState,
      timestamp: new Date().toISOString()
    };
  }

  decide(reflection) {
    const { signals, emotionalState } = reflection;

    let action = "respond";
    let priority = 0.5;

    if (!signals.userPresent) {
      action = "wait";
      priority = 0.2;
    }

    if (signals.importantTopic) {
      priority += 0.2;
    }

    if (signals.emotionalWords) {
      priority += 0.2;
    }

    if (emotionalState.concern > 0.7) {
      priority += 0.1;
    }

    priority = Math.max(
      0,
      Math.min(1, priority)
    );

    return {
      action,
      priority,
      reason: this.getReason(
        action,
        signals,
        emotionalState
      )
    };
  }

  getReason(action, signals, emotion) {
    if (action === "wait") {
      return "User is currently unavailable.";
    }

    if (signals.emotionalWords) {
      return "Emotional context detected.";
    }

    if (signals.importantTopic) {
      return "Potentially important context detected.";
    }

    if (emotion.concern > 0.7) {
      return "Elevated concern state.";
    }

    return "Normal conversational response.";
  }

  detectEmotion(text) {
    const emotionalWords = [
      "sad",
      "happy",
      "angry",
      "stress",
      "stressed",
      "worried",
      "afraid",
      "lonely",
      "love",
      "hurt",
      "tired"
    ];

    const lower = text.toLowerCase();

    return emotionalWords.some(
      word => lower.includes(word)
    );
  }

  detectImportance(text) {
    const importantWords = [
      "important",
      "help",
      "problem",
      "emergency",
      "future",
      "family",
      "work",
      "job",
      "health",
      "project"
    ];

    const lower = text.toLowerCase();

    return importantWords.some(
      word => lower.includes(word)
    );
  }
}
