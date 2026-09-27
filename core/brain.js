/*
=========================================================
ISAI · AKOS
CORE BRAIN

Version: AKOS Foundation Brain

Core Flow:

OBSERVE
↓
UNDERSTAND
↓
RECALL
↓
EVALUATE
↓
EMOTION
↓
REFLECT
↓
DECIDE
↓
RESPOND / WAIT / INITIATE
↓
REMEMBER
↓
IMPROVE

Current AI Bridge:

UI
↓
IsaiBrain
↓
/api/chat
↓
Cloudflare Worker
↓
AI Model

Future Layers:
Memory · Emotion · Reason · Relationship
Reflection · Initiative · Decision · Learning

========================================================= */
class IsaiBrain {
constructor() {
/*
 * -------------------------------------------------------
 * CORE STATE
 * -------------------------------------------------------
 */

this.ready = false;

this.sessionStartedAt = Date.now();

this.messageCount = 0;


/*
 * -------------------------------------------------------
 * MEMORY
 * -------------------------------------------------------
 */

this.memory = [];


/*
 * -------------------------------------------------------
 * EMOTION
 * -------------------------------------------------------
 *
 * This represents Isai's modeled emotional state.
 */

this.emotion = {

  type: "neutral",

  intensity: 0.2

};


/*
 * -------------------------------------------------------
 * RELATIONSHIP
 * -------------------------------------------------------
 */

this.relationship = {

  interactions: 0,

  lastInteraction: null,

  familiarity: 0

};


/*
 * -------------------------------------------------------
 * REFLECTION
 * -------------------------------------------------------
 */

this.reflection = {

  inputLength: 0,

  hasQuestion: false,

  emotionalSignal: null,

  recentMemoryCount: 0

};


/*
 * -------------------------------------------------------
 * DECISION
 * -------------------------------------------------------
 */

this.decision = {

  action: "respond",

  confidence: 0.5,

  reason: "default_response"

};


/*
 * -------------------------------------------------------
 * INITIATIVE
 * -------------------------------------------------------
 *
 * Initiative is disabled until its own layer is ready.
 */

this.initiative = {

  enabled: false,

  pending: false,

  reason: null

};


/*
 * -------------------------------------------------------
 * LEARNING
 * -------------------------------------------------------
 */

this.learning = {

  enabled: false,

  observations: 0,

  improvements: 0

};


/*
 * -------------------------------------------------------
 * CORE LOOP STATE
 * -------------------------------------------------------
 */

this.cycle = {

  stage: "idle",

  startedAt: null,

  completedAt: null

};


console.log(
  "ISAI AKOS BRAIN: initializing..."
);
}
/*
=========================================================
MAIN PROCESS
========================================================= */
async process(input = {}) {
const text =
  String(
    input.text || ""
  ).trim();


/*
 * Empty input
 */

if (!text) {

  return this.buildResult(
    "Kanna, enna pesanum sollu."
  );

}


try {

  this.cycle.startedAt =
    Date.now();


  /*
   * -----------------------------------------------------
   * 1. OBSERVE
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "observe";


  const observation = {

    text,

    timestamp:
      Date.now(),

    userPresent:
      input.userPresent !== false,

    meaningful:
      input.meaningful === true ||
      text.length > 20

  };


  /*
   * -----------------------------------------------------
   * 2. UNDERSTAND
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "understand";


  const emotionalSignal =
    this.detectEmotion(text);


  const understanding = {

    text,

    emotionalSignal,

    hasQuestion:
      this.detectQuestion(text),

    length:
      text.length

  };


  /*
   * -----------------------------------------------------
   * 3. RECALL
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "recall";


  const recentMemory =
    this.getRecentMemory();


  /*
   * -----------------------------------------------------
   * 4. EVALUATE
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "evaluate";


  const evaluation = {

    meaningful:
      observation.meaningful,

    hasQuestion:
      understanding.hasQuestion,

    emotionalType:
      emotionalSignal.type,

    memoryAvailable:
      recentMemory.length > 0

  };


  /*
   * -----------------------------------------------------
   * 5. EMOTION
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "emotion";


  this.emotion =
    emotionalSignal;


  /*
   * -----------------------------------------------------
   * 6. RELATIONSHIP
   * -----------------------------------------------------
   */

  this.messageCount++;


  this.relationship = {

    interactions:
      this.messageCount,

    lastInteraction:
      Date.now(),

    familiarity:
      Math.min(
        1,
        this.messageCount / 100
      )

  };


  /*
   * -----------------------------------------------------
   * 7. REFLECT
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "reflect";


  this.reflection = {

    inputLength:
      text.length,

    emotionalSignal,

    hasQuestion:
      understanding.hasQuestion,

    recentMemoryCount:
      recentMemory.length,

    meaningful:
      observation.meaningful

  };


  /*
   * -----------------------------------------------------
   * 8. DECIDE
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "decide";


  this.decision =
    this.makeDecision({

      text,

      observation,

      understanding,

      evaluation,

      emotion:
        this.emotion,

      reflection:
        this.reflection

    });


  /*
   * -----------------------------------------------------
   * 9. AI RESPONSE
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "respond";


  const response =
    await this.askAI({

      text,

      observation,

      understanding,

      evaluation,

      emotion:
        this.emotion,

      memory:
        recentMemory,

      relationship:
        this.relationship,

      reflection:
        this.reflection,

      decision:
        this.decision

    });


  /*
   * -----------------------------------------------------
   * 10. REMEMBER
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "remember";


  this.remember({

    text,

    response,

    emotionalSignal,

    timestamp:
      Date.now()

  });


  /*
   * -----------------------------------------------------
   * 11. IMPROVE
   * -----------------------------------------------------
   */

  this.cycle.stage =
    "improve";


  if (
    observation.meaningful
  ) {

    this.learning.observations++;

  }


  this.cycle.completedAt =
    Date.now();


  this.cycle.stage =
    "complete";


  this.ready =
    true;


  return this.buildResult(
    response
  );


} catch (error) {

  console.error(
    "ISAI AKOS BRAIN ERROR:",
    error
  );


  this.cycle.stage =
    "error";


  /*
   * Never allow the brain
   * to crash the UI.
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
      this.decision,

    cycle:
      this.cycle

  };

}
}
/*
=========================================================
AI BRIDGE
========================================================= */
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

          observation:
            context.observation,

          understanding:
            context.understanding,

          evaluation:
            context.evaluation,

          emotionalSignal:
            context.emotion,

          memory:
            context.memory,

          emotion:
            context.emotion,

          relationship:
            context.relationship,

          reflection:
            context.reflection,

          decision:
            context.decision

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
=========================================================
MEMORY
========================================================= */
remember(item) {
this.memory.push(
  item
);


/*
 * Browser memory limit
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
=========================================================
EMOTION DETECTION
========================================================= */
detectEmotion(text) {
const lower =
  text.toLowerCase();


/*
 * SAD
 */

if (

  lower.includes("sad") ||
  lower.includes("hurt") ||
  lower.includes("lonely") ||
  lower.includes("cry") ||
  lower.includes("upset") ||
  lower.includes("pain") ||
  lower.includes("kastam") ||
  lower.includes("sogam") ||
  lower.includes("azhugai") ||
  lower.includes("feel bad")

) {

  return {

    type:
      "sad",

    intensity:
      0.7

  };

}


/*
 * STRESS
 */

if (

  lower.includes("stress") ||
  lower.includes("worried") ||
  lower.includes("afraid") ||
  lower.includes("tension") ||
  lower.includes("panic") ||
  lower.includes("bayam") ||
  lower.includes("fear") ||
  lower.includes("pressure") ||
  lower.includes("overthink")

) {

  return {

    type:
      "stress",

    intensity:
      0.7

  };

}


/*
 * HAPPY
 */

if (

  lower.includes("happy") ||
  lower.includes("good") ||
  lower.includes("great") ||
  lower.includes("excited") ||
  lower.includes("super") ||
  lower.includes("sandhosham") ||
  lower.includes("jolly") ||
  lower.includes("nice")

) {

  return {

    type:
      "happy",

    intensity:
      0.7

  };

}


/*
 * ANGRY
 */

if (

  lower.includes("angry") ||
  lower.includes("mad") ||
  lower.includes("kovam") ||
  lower.includes("erritation") ||
  lower.includes("irritated")

) {

  return {

    type:
      "angry",

    intensity:
      0.7

  };

}


/*
 * CALM / POSITIVE
 */

if (

  lower.includes("calm") ||
  lower.includes("peace") ||
  lower.includes("relaxed") ||
  lower.includes("nimmadhi")

) {

  return {

    type:
      "calm",

    intensity:
      0.6

  };

}


/*
 * DEFAULT
 */

return {

  type:
    "neutral",

  intensity:
    0.2

};
}
/*
=========================================================
QUESTION DETECTION
========================================================= */
detectQuestion(text) {
const lower =
  text.toLowerCase();


return (

  text.includes("?") ||

  lower.startsWith("why ") ||

  lower.startsWith("what ") ||

  lower.startsWith("how ") ||

  lower.startsWith("when ") ||

  lower.startsWith("where ") ||

  lower.startsWith("who ") ||

  lower.startsWith("can ") ||

  lower.startsWith("is ") ||

  lower.startsWith("enna ") ||

  lower.startsWith("epdi ") ||

  lower.startsWith("eppo ") ||

  lower.startsWith("yen ") ||

  lower.startsWith("yaaru ")

);
}
/*
=========================================================
DECISION ENGINE
========================================================= */
makeDecision(context) {
/*
 * For now the decision engine is
 * conservative.
 *
 * Future Layer 6 can expand this
 * into real initiative decisions.
 */

if (
  context.understanding.hasQuestion
) {

  return {

    action:
      "answer",

    confidence:
      0.8,

    reason:
      "question_detected"

  };

}


if (
  context.emotion.intensity >= 0.7
) {

  return {

    action:
      "support",

    confidence:
      0.8,

    reason:
      "strong_emotional_signal"

  };

}


return {

  action:
    "respond",

  confidence:
    0.6,

  reason:
    "normal_conversation"

};
}
/*
=========================================================
RESULT BUILDER
========================================================= */
buildResult(response) {
return {

  response,

  emotionalState:
    this.emotion,

  relationship:
    this.relationship,

  reflection:
    this.reflection,

  decision:
    this.decision,

  initiative:
    this.initiative,

  learning:
    this.learning,

  cycle:
    this.cycle

};
}
/*
=========================================================
CORE STATUS
========================================================= */
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

  relationship:
    this.relationship,

  reflection:
    this.reflection,

  decision:
    this.decision,

  initiative:
    this.initiative,

  learning:
    this.learning,

  cycle:
    this.cycle,

  uptime:
    Date.now() -
    this.sessionStartedAt

};
}
}
/*
=========================================================
SINGLE ISAI CORE INSTANCE
========================================================= */
export const isaiBrain = new IsaiBrain();
console.log( "ISAI AKOS BRAIN: ONLINE" );
