/*
 * =========================================================
 * ISAI · AKOS
 * CORE BRAIN
 *
 * Version: Clean AI Bridge
 *
 * Flow:
 * UI
 *  ↓
 * IsaiBrain
 *  ↓
 * /api/chat
 *  ↓
 * Cloudflare Worker
 *  ↓
 * NVIDIA AI
 * =========================================================
 */

class IsaiBrain {

  constructor() {

    this.ready = false;

    this.sessionStartedAt =
      Date.now();

    this.messageCount = 0;

    this.memory = [];

    this.emotion = {
      type: "neutral",
      intensity: 0.2
    };

    this.relationship = {
      interactions: 0
    };

    this.reflection = null;

    this.initiative = {
      enabled: false
    };

    console.log(
      "ISAI BRAIN: initializing..."
    );

  }


  /*
   * ---------------------------------------------------------
   * MAIN PROCESS
   * ---------------------------------------------------------
   */

  async process(input = {}) {

    const text =
      String(
        input.text || ""
      ).trim();


    if (!text) {

      return {
        response:
          "Kanna, enna pesanum sollu.",

        emotionalState:
          this.emotion,

        relationship:
          this.relationship,

        reflection:
          null,

        decision:
          null
      };

    }


    try {

      this.messageCount++;


      /*
       * Detect basic emotional signal
       */

      const emotionalSignal =
        this.detectEmotion(
          text
        );


      this.emotion =
        emotionalSignal;


      /*
       * Store lightweight memory
       */

      this.remember({
        text,
        emotionalSignal,
        timestamp:
          Date.now()
      });


      /*
       * Relationship state
       */

      this.relationship = {

        interactions:
          this.messageCount,

        lastInteraction:
          Date.now()

      };


      /*
       * Simple reflection layer
       */

      this.reflection = {

        inputLength:
          text.length,

        emotionalSignal,

        hasQuestion:
          text.includes("?"),

        recentMemoryCount:
          this.memory.length

      };


      /*
       * AI REQUEST
       */

      const response =
        await this.askAI({

          text,

          emotionalSignal,

          memory:
            this.getRecentMemory(),

          emotion:
            this.emotion,

          relationship:
            this.relationship,

          reflection:
            this.reflection

        });


      this.ready =
        true;


      return {

        response,

        emotionalState:
          this.emotion,

        relationship:
          this.relationship,

        reflection:
          this.reflection,

        decision:
          null

      };


    } catch (error) {

      console.error(
        "ISAI BRAIN ERROR:",
        error
      );


      /*
       * Important:
       * Never crash the UI.
       */

      return {

        response:
          "Kanna, Isai AI connection-la konjam problem vandhudhu. Konjam later try pannalaam.",

        emotionalState:
          this.emotion,

        relationship:
          this.relationship,

        reflection:
          this.reflection,

        decision:
          null

      };

    }

  }


  /*
   * ---------------------------------------------------------
   * AI BRIDGE
   * ---------------------------------------------------------
   */

  async askAI(context) {

    console.log(
      "ISAI → /api/chat"
    );


    const response =
      await fetch(
        "/api/chat",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              message:
                context.text,

              emotionalSignal:
                context.emotionalSignal,

              memory:
                context.memory,

              emotion:
                context.emotion,

              relationship:
                context.relationship,

              reflection:
                context.reflection

            })

        }
      );


    console.log(
      "ISAI API STATUS:",
      response.status
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "ISAI API ERROR:",
        errorText
      );


      throw new Error(
        `AI API failed: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "ISAI AI RESPONSE:",
      data
    );


    if (
      !data ||
      typeof data.response !== "string" ||
      !data.response.trim()
    ) {

      throw new Error(
        "AI response missing"
      );

    }


    return data.response.trim();

  }


  /*
   * ---------------------------------------------------------
   * MEMORY
   * ---------------------------------------------------------
   */

  remember(item) {

    this.memory.push(
      item
    );


    /*
     * Keep browser memory small
     */

    if (
      this.memory.length > 50
    ) {

      this.memory =
        this.memory.slice(-50);

    }

  }


  getRecentMemory() {

    return this.memory.slice(-10);

  }


  /*
   * ---------------------------------------------------------
   * EMOTION DETECTION
   * ---------------------------------------------------------
   */

  detectEmotion(text) {

    const lower =
      text.toLowerCase();


    if (
      lower.includes("sad") ||
      lower.includes("hurt") ||
      lower.includes("lonely") ||
      lower.includes("cry") ||
      lower.includes("upset") ||
      lower.includes("pain") ||
      lower.includes("kastam") ||
      lower.includes("sogam")
    ) {

      return {

        type:
          "sad",

        intensity:
          0.7

      };

    }


    if (
      lower.includes("stress") ||
      lower.includes("worried") ||
      lower.includes("afraid") ||
      lower.includes("tension") ||
      lower.includes("panic") ||
      lower.includes("bayam") ||
      lower.includes("fear")
    ) {

      return {

        type:
          "stress",

        intensity:
          0.7

      };

    }


    if (
      lower.includes("happy") ||
      lower.includes("good") ||
      lower.includes("great") ||
      lower.includes("excited") ||
      lower.includes("super") ||
      lower.includes("sandhosham")
    ) {

      return {

        type:
          "happy",

        intensity:
          0.7

      };

    }


    if (
      lower.includes("angry") ||
      lower.includes("mad") ||
      lower.includes("kovam")
    ) {

      return {

        type:
          "angry",

        intensity:
          0.7

      };

    }


    return {

      type:
        "neutral",

      intensity:
        0.2

    };

  }


  /*
   * ---------------------------------------------------------
   * CORE STATUS
   * ---------------------------------------------------------
   */

  getStatus() {

    return {

      ready:
        this.ready,

      messages:
        this.messageCount,

      memory:
        this.memory.length,

      emotion:
        this.emotion,

      uptime:
        Date.now() -
        this.sessionStartedAt

    };

  }

}


/*
 * =========================================================
 * SINGLE ISAI CORE INSTANCE
 * =========================================================
 */

export const isaiBrain =
  new IsaiBrain();


console.log(
  "ISAI BRAIN: ONLINE"
);
