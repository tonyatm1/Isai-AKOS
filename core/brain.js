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

      userPresent:
        input.userPresent !== false,

      timestamp:
        new Date().toISOString()

    };


    /*
     * EMOTION
     */

    const emotionalSignal =
      this.detectEmotion(text);


    if (emotionalSignal) {

      this.emotion.react({

        type: emotionalSignal

      });

    } else {

      this.emotion.react({

        type: "conversation"

      });

    }


    /*
     * RELATIONSHIP
     */

    this.relationship.interaction(

      input.meaningful
        ? "meaningful"
        : "conversation"

    );


    /*
     * REFLECTION
     */

    const reflection =
      this.reflection.analyze(
        observation
      );


    const decision =
      this.reflection.decide(
        reflection
      );


    /*
     * MEMORY
     */

    if (text) {

      this.memory.add({

        text,

        category:
          "conversation",

        importance:
          input.importance ?? 0.4,

        source:
          "user_interaction"

      });

    }


    /*
     * ISAI RESPONSE
     *
     * This was the missing layer.
     */

    const response =
      this.generateResponse({

        text,

        emotionalSignal,

        reflection,

        decision

      });


    /*
     * RETURN COMPLETE CORE RESULT
     */

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


  /*
   * ---------------------------------------------------------
   * LOCAL ISAI RESPONSE ENGINE
   * ---------------------------------------------------------
   *
   * This gives Isai an immediate working voice/chat layer
   * without requiring an external API.
   */

  generateResponse({
    text,
    emotionalSignal,
    reflection,
    decision
  }) {

    const lower =
      text.toLowerCase().trim();


    if (!lower) {

      return "Naan inga irukken. Enna pesanum sollu.";

    }


    /*
     * GREETINGS
     */

    if (
      lower === "hi" ||
      lower === "hello" ||
      lower === "hey" ||
      lower.includes("good morning") ||
      lower.includes("good evening")
    ) {

      return (
        "Hi Akash. Naan Isai. " +
        "Un message receive panniten. " +
        "En Core ready-aa irukku. Enna pesalam?"
      );

    }


    /*
     * ISAI IDENTITY
     */

    if (
      lower.includes("who are you") ||
      lower.includes("what are you") ||
      lower.includes("nee yaar")
    ) {

      return (
        "Naan Isai. " +
        "AKOS-oda companion layer. " +
        "Memory, emotion, relationship, reflection " +
        "and initiative systems-oda work panna design pannirukken."
      );

    }


    /*
     * STATUS
     */

    if (
      lower.includes("how are you") ||
      lower.includes("epdi iruka") ||
      lower.includes("how are u")
    ) {

      const mood =
        this.emotion.getState()?.mood ||
        "calm";


      return (
        `Naan good-aa irukken. ` +
        `Ippo en mood ${mood}. ` +
        `Nee epdi irukka?`
      );

    }


    /*
     * SAD / HURT
     */

    if (
      emotionalSignal === "sad" ||
      lower.includes("feel bad") ||
      lower.includes("feeling bad")
    ) {

      return (
        "Akash, un message-la konjam heavy feeling theriyudhu. " +
        "Nee solla comfortable-aa irundha, enna nadandhudhu nu sollu. " +
        "Naan listen pannuren."
      );

    }


    /*
     * STRESS / WORRY
     */

    if (
      emotionalSignal === "stress" ||
      lower.includes("tension") ||
      lower.includes("panic")
    ) {

      return (
        "Seri Akash. First konjam slow down pannalam. " +
        "Nee enna problem face panra nu one step-aa sollu. " +
        "Namma adha one step at a time handle pannalam."
      );

    }


    /*
     * HAPPY
     */

    if (
      emotionalSignal === "happy"
    ) {

      return (
        "Adhu kekka nalla irukku Akash. " +
        "Indha positive moment-a remember pannalam. " +
        "Innum sollu, enna happy-aa irukku?"
      );

    }


    /*
     * THANKS
     */

    if (
      lower.includes("thank you") ||
      lower.includes("thanks") ||
      lower.includes("nandri")
    ) {

      return (
        "Anytime Akash. " +
        "Naan inga irukken."
      );

    }


    /*
     * MEMORY
     */

    if (
      lower.includes("remember") ||
      lower.includes("nyabagam") ||
      lower.includes("memory")
    ) {

      const count =
        this.memory.count();


      return (
        `Seri. Conversation memory-la ` +
        `${count} item irukku. ` +
        `Nee specific-aa enna remember panna sollura nu sollu.`
      );

    }


    /*
     * CORE STATUS
     */

    if (
      lower.includes("core") ||
      lower.includes("status")
    ) {

      const state =
        this.getState();


      return (
        "AKOS Core online. " +
        `Memory ${state.memoryCount}. ` +
        "Emotion, relationship, reflection and initiative systems connected."
      );

    }


    /*
     * DEFAULT CONVERSATION
     *
     * Instead of returning the old fixed sentence,
     * Isai acknowledges the actual message.
     */

    const cleanText =
      text.length > 120
        ? text.slice(0, 120) + "..."
        : text;


    return (
      `Un message receive panniten: "${cleanText}". ` +
      "Idha en Core-la process panniten. " +
      "Innum konjam detail-aa sollu, naan continue pannuren."
    );

  }


  /*
   * ---------------------------------------------------------
   * INITIATIVE
   * ---------------------------------------------------------
   */

  evaluateInitiative(context = {}) {

    return this.initiative.evaluate(
      context
    );

  }


  recordInitiation() {

    this.initiative.recordInitiation();

  }


  /*
   * ---------------------------------------------------------
   * EMOTION DETECTION
   * ---------------------------------------------------------
   */

  detectEmotion(text) {

    const lower =
      String(text || "").toLowerCase();


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


  /*
   * ---------------------------------------------------------
   * COMPLETE CORE STATE
   * ---------------------------------------------------------
   */

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
