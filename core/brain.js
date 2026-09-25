// ISAI BRAIN ORCHESTRATOR
// AKOS Core + AI Response Layer

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

    this.reflection =
      new ReflectionEngine({
        memory: this.memory,
        emotion: this.emotion,
        relationship: this.relationship
      });

    this.initiative =
      new InitiativeEngine({
        memory: this.memory,
        emotion: this.emotion,
        relationship: this.relationship
      });

  }


  async process(input = {}) {

    const text =
      String(input.text || "").trim();

    const observation = {
      text,
      userPresent: input.userPresent !== false,
      timestamp: new Date().toISOString()
    };


    // -------------------------
    // EMOTION
    // -------------------------

    const emotionalSignal =
      this.detectEmotion(text);

    this.emotion.react({
      type: emotionalSignal || "conversation"
    });


    // -------------------------
    // RELATIONSHIP
    // -------------------------

    this.relationship.interaction(
      input.meaningful
        ? "meaningful"
        : "conversation"
    );


    // -------------------------
    // REFLECTION
    // -------------------------

    const reflection =
      this.reflection.analyze(
        observation
      );

    const decision =
      this.reflection.decide(
        reflection
      );


    // -------------------------
    // MEMORY
    // -------------------------

    if (text) {

      this.memory.add({

        text,

        category: "conversation",

        importance:
          input.importance ?? 0.4,

        source: "user_interaction"

      });

    }


    // -------------------------
    // AI RESPONSE
    // -------------------------

    let response;

    try {

      response =
        await this.askAI({

          text,
          emotionalSignal,
          reflection,
          decision

        });

    } catch (error) {

      console.error(
        "ISAI AI ERROR:",
        error
      );

      response =
        this.localFallback({
          text,
          emotionalSignal
        });

    }


    // -------------------------
    // COMPLETE CORE RESULT
    // -------------------------

    return {

      observation,

      response,

      emotionalState:
        this.emotion.getState(),

      relationship:
        this.relationship.getState(),

      reflection,

      decision

    };

  }


  // =========================================================
  // AI CONNECTION
  // =========================================================

  async askAI(context = {}) {

    const response =
      await fetch("/api/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message:
            context.text,

          emotionalSignal:
            context.emotionalSignal,

          memory:
            this.getRecentMemory(),

          emotion:
            this.emotion.getState(),

          relationship:
            this.relationship.getState(),

          reflection:
            context.reflection,

          decision:
            context.decision

        })

      });


    if (!response.ok) {

      throw new Error(
        `AI endpoint error: ${response.status}`
      );

    }


    const data =
      await response.json();


    if (
      !data ||
      typeof data.response !== "string" ||
      !data.response.trim()
    ) {

      throw new Error(
        "AI endpoint returned no response"
      );

    }


    return data.response.trim();

  }


  // =========================================================
  // RECENT MEMORY
  // =========================================================

  getRecentMemory() {

    try {

      if (
        typeof this.memory.getAll === "function"
      ) {

        const items =
          this.memory.getAll();

        if (Array.isArray(items)) {

          return items.slice(-10);

        }

      }

    } catch (error) {

      console.warn(
        "Memory read error:",
        error
      );

    }

    return [];

  }


  // =========================================================
  // LOCAL FALLBACK
  // =========================================================

  localFallback({
    text,
    emotionalSignal
  }) {

    if (!text) {

      return (
        "Naan inga irukken. " +
        "Enna pesanum sollu."
      );

    }


    if (
      emotionalSignal === "sad"
    ) {

      return (
        "Akash, un message-la heavy feeling " +
        "theriyudhu. Nee comfortable-aa irundha " +
        "enna nadandhudhu nu sollu. Naan listen pannuren."
      );

    }


    if (
      emotionalSignal === "stress"
    ) {

      return (
        "Seri Akash. Konjam slow down pannalam. " +
        "Nee face panra problem-a one step-aa sollu. " +
        "Namma together-aa paakalam."
      );

    }


    if (
      emotionalSignal === "happy"
    ) {

      return (
        "Adhu kekka nalla irukku Akash. " +
        "Innum sollu, enna happy-aa irukku?"
      );

    }


    return (
      "Un message receive panniten. " +
      "AI connection ready aana, naan idha " +
      "full-aa process panni reply pannuren."
    );

  }


  // =========================================================
  // INITIATIVE
  // =========================================================

  evaluateInitiative(context = {}) {

    return this.initiative.evaluate(
      context
    );

  }


  recordInitiation() {

    this.initiative.recordInitiation();

  }


  // =========================================================
  // EMOTION DETECTION
  // =========================================================

  detectEmotion(text) {

    const lower =
      String(text || "").toLowerCase();


    if (
      lower.includes("sad") ||
      lower.includes("hurt") ||
      lower.includes("lonely") ||
      lower.includes("cry") ||
      lower.includes("upset")
    ) {

      return "sad";

    }


    if (
      lower.includes("stress") ||
      lower.includes("worried") ||
      lower.includes("afraid") ||
      lower.includes("tension") ||
      lower.includes("panic")
    ) {

      return "stress";

    }


    if (
      lower.includes("happy") ||
      lower.includes("good") ||
      lower.includes("great") ||
      lower.includes("excited")
    ) {

      return "happy";

    }


    return null;

  }


  // =========================================================
  // COMPLETE CORE STATE
  // =========================================================

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


// ===========================================================
// ISAI INSTANCE
// ===========================================================

export const isaiBrain =
  new IsaiBrain();
