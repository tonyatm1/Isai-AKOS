// ISAI BRAIN ORCHESTRATOR

import { memory } from "./memory.js";
import { emotion } from "./emotion.js";
import { relationship } from "./relationship.js";
import { ReflectionEngine } from "./reflection.js";
import { InitiativeEngine } from "./initiative.js";

export class IsaiBrain {
  constructor() {
    this.memory = memory;
    this.emotion = emotion;
    this.relationship = relationship;

    this.reflection = new ReflectionEngine({
      memory: this.memory,
      emotion: this.emotion,
      relationship: this.relationship
    });

    this.initiative = new InitiativeEngine({
      memory: this.memory,
      emotion: this.emotion,
      relationship: this.relationship
    });
  }

  async process(input = {}) {
    const text = input.text || "";

    const observation = {
      text,
      userPresent: input.userPresent !== false,
      timestamp: new Date().toISOString()
    };

    const emotionalSignal = this.detectEmotion(text);

    if (emotionalSignal) {
      this.emotion.react({
        type: emotionalSignal
      });
    } else {
      this.emotion.react({
        type: "conversation"
      });
    }

    this.relationship.interaction(
      input.meaningful
        ? "meaningful"
        : "conversation"
    );

    const reflection =
      this.reflection.analyze(observation);

    const decision =
      this.reflection.decide(reflection);

    if (text.trim()) {
      this.memory.add({
        text,
        category: "conversation",
        importance: input.importance ?? 0.4,
        source: "user_interaction"
      });
    }

    return {
      observation,

      emotionalState:
        this.emotion.getState(),

      relationship:
        this.relationship.getState(),

      reflection,

      decision
    };
  }

  evaluateInitiative(context = {}) {
    return this.initiative.evaluate(context);
  }

  recordInitiation() {
    this.initiative.recordInitiation();
  }

  detectEmotion(text) {
    const lower = text.toLowerCase();

    if (
      lower.includes("sad") ||
      lower.includes("hurt") ||
      lower.includes("lonely")
    ) {
      return "sad";
    }

    if (
      lower.includes("stress") ||
      lower.includes("worried") ||
      lower.includes("afraid")
    ) {
      return "stress";
    }

    if (
      lower.includes("happy") ||
      lower.includes("good") ||
      lower.includes("great")
    ) {
      return "happy";
    }

    return null;
  }

  getState() {
    return {
      emotion:
        this.emotion.getState(),

      relationship:
        this.relationship.getState(),

      memoryCount:
        this.memory.count(),

      initiative:
        this.initiative.getState()
    };
  }
}

export const isaiBrain =
  new IsaiBrain();
