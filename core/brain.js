import { Memory } from "./memory.js";
import { Emotion } from "./emotion.js";
import { Relationship } from "./relationship.js";
import { ReflectionEngine } from "./reflection.js";
import { InitiativeEngine } from "./initiative.js";

class IsaiBrain {
  constructor() {
    this.memory = new Memory();
    this.emotion = new Emotion();
    this.relationship = new Relationship();

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
    const text = String(input.text || "").trim();

    if (!text) {
      return {
        response: "Kanna, enna pesanum sollu."
      };
    }

    try {
      const emotionalSignal = this.detectEmotion(text);

      if (this.emotion?.update) {
        this.emotion.update(emotionalSignal);
      }

      if (this.relationship?.interact) {
        this.relationship.interact(text);
      }

      let reflection = null;
      let decision = null;

      if (this.reflection?.analyze) {
        reflection = this.reflection.analyze({
          text,
          emotionalSignal
        });
      }

      if (this.reflection?.decide) {
        decision = this.reflection.decide({
          text,
          reflection,
          emotionalSignal
        });
      }

      if (this.memory?.add) {
        this.memory.add({
          text,
          emotionalSignal,
          timestamp: Date.now()
        });
      }

      const response = await this.askAI({
        text,
        emotionalSignal,
        reflection,
        decision
      });

      return {
        response,
        emotionalState: this.getEmotionState(),
        relationship: this.getRelationshipState(),
        reflection,
        decision
      };

    } catch (error) {
      console.error("ISAI BRAIN ERROR:", error);

      return {
        response: this.localFallback(text)
      };
    }
  }

  async askAI(context) {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: context.text,

        emotionalSignal: context.emotionalSignal,

        memory: this.getRecentMemory(),

        emotion: this.getEmotionState(),

        relationship: this.getRelationshipState(),

        reflection: context.reflection,

        decision: context.decision
      })
    });

    if (!response.ok) {
      throw new Error(
        `AI API failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data || !data.response) {
      throw new Error("AI response missing");
    }

    return String(data.response).trim();
  }

  getRecentMemory() {
    try {
      if (this.memory?.getAll) {
        const memories = this.memory.getAll();

        if (Array.isArray(memories)) {
          return memories.slice(-10);
        }
      }
    } catch (error) {
      console.warn("Memory read failed:", error);
    }

    return [];
  }

  getEmotionState() {
    try {
      if (this.emotion?.getState) {
        return this.emotion.getState();
      }
    } catch (error) {
      console.warn("Emotion state failed:", error);
    }

    return {};
  }

  getRelationshipState() {
    try {
      if (this.relationship?.getState) {
        return this.relationship.getState();
      }
    } catch (error) {
      console.warn("Relationship state failed:", error);
    }

    return {};
  }

  detectEmotion(text) {
    const lower = text.toLowerCase();

    if (
      lower.includes("sad") ||
      lower.includes("hurt") ||
      lower.includes("lonely") ||
      lower.includes("cry") ||
      lower.includes("upset") ||
      lower.includes("kastam") ||
      lower.includes("pain")
    ) {
      return {
        type: "sad",
        intensity: 0.7
      };
    }

    if (
      lower.includes("stress") ||
      lower.includes("worried") ||
      lower.includes("afraid") ||
      lower.includes("tension") ||
      lower.includes("panic") ||
      lower.includes("bayam")
    ) {
      return {
        type: "stress",
        intensity: 0.7
      };
    }

    if (
      lower.includes("happy") ||
      lower.includes("good") ||
      lower.includes("great") ||
      lower.includes("excited") ||
      lower.includes("super")
    ) {
      return {
        type: "happy",
        intensity: 0.7
      };
    }

    return {
      type: "neutral",
      intensity: 0.2
    };
  }

  localFallback(text) {
    return `Kanna, un message enakku vandhudhu. Aana AI connection-la temporary problem irukku. Konjam later try pannalaam.`;
  }
}

export const isaiBrain = new IsaiBrain();
