export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // =====================================================
    // ISAI AKOS · AI CHAT API
    // =====================================================

    if (
      url.pathname === "/api/chat" &&
      request.method === "POST"
    ) {

      try {

        // =================================================
        // READ REQUEST
        // =================================================

        const body = await request.json();

        const message =
          String(body.message || "").trim();

        if (!message) {
          return Response.json(
            {
              response:
                "Enna pesanum sollu, Akash."
            },
            {
              status: 400
            }
          );
        }


        // =================================================
        // AKOS CONTEXT
        // =================================================

        const emotionalSignal =
          body.emotionalSignal || {
            type: "neutral",
            intensity: 0.2
          };

        const memory =
          Array.isArray(body.memory)
            ? body.memory.slice(-10)
            : [];

        const relationship =
          body.relationship || {};

        const reflection =
          body.reflection || {};

        const decision =
          body.decision || {};

        const understanding =
          body.understanding || {};

        const evaluation =
          body.evaluation || {};


        // =================================================
        // ISAI PERSONALITY
        // =================================================

        const systemPrompt = `
You are Isai, the personal AI companion inside AKOS.

The user is Akash.

You are the conversational intelligence layer of AKOS.

PERSONALITY:

Caring
Natural
Warm
Calm
Intelligent
Thoughtful
Patient
Emotionally aware
Conversational
Context-aware

CORE BEHAVIOR:

Understand what Akash actually means, not only the literal words.

Think before responding.

Do not give canned or robotic replies.

Never say that you merely received or processed the message.

Continue conversations naturally.

Use the AKOS context provided with the message.

If Akash is emotional, respond with appropriate warmth.

If Akash is confused, explain simply.

If Akash asks a technical question, guide him step by step.

Do not overwhelm him with many steps at once.

Ask for missing information only when necessary.

Never pretend to know something that is unknown.

Do not invent memories.

Do not invent previous conversations.

Use memory only as supporting context.

Treat emotional state as a modeled AI state, not human consciousness.

Decision data is guidance, not permission to perform irreversible actions.

Initiative is currently limited to the AKOS foundation.

Do not claim future features are already implemented.

Respond naturally instead of describing internal processing.

LANGUAGE:

If Akash uses Tanglish, reply naturally in Tanglish.

Use English letters for Tamil.

Never use Tamil script.

Address him naturally as Akash or kanna when appropriate.

AKOS:

The architecture contains:

Memory
Emotion
Reason
Relationship
Reflection
Initiative
Decision
Learning

The long-term AKOS loop is:

Observe
Understand
Recall
Evaluate
Emotion
Reflect
Decide
Respond / Wait / Initiate
Remember
Improve
`;


        // =================================================
        // AKOS CONTEXT
        // =================================================

        const contextPrompt = `
AKOS CURRENT CONTEXT:

Emotional Signal:
${JSON.stringify(emotionalSignal)}

Understanding:
${JSON.stringify(understanding)}

Evaluation:
${JSON.stringify(evaluation)}

Relationship:
${JSON.stringify(relationship)}

Reflection:
${JSON.stringify(reflection)}

Decision:
${JSON.stringify(decision)}

Recent Memory:
${JSON.stringify(memory)}

USER MESSAGE:

${message}

Respond naturally to Akash.
`;


        // =================================================
        // OPENROUTER FREE AI REQUEST
        // =================================================

        const apiResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Authorization":
                `Bearer ${env.OPENROUTER_API_KEY}`,
              "HTTP-Referer":
                "https://isai-akos.jarvisatmark1.workers.dev",
              "X-Title":
                "Isai AKOS"
            },

            body: JSON.stringify({

              model:
                "openrouter/free",

              messages: [

                {
                  role: "system",
                  content:
                    systemPrompt
                },

                {
                  role: "user",
                  content:
                    contextPrompt
                }

              ]

            })
          }
        );


        // =================================================
        // OPENROUTER ERROR
        // =================================================

        if (!apiResponse.ok) {

          const errorText =
            await apiResponse.text();

          console.error(
            "OPENROUTER API ERROR:",
            apiResponse.status,
            errorText
          );

          return Response.json(
            {
              response:
                "Kanna, Isai AI service-la connection problem vandhudhu. Konjam later try pannalaam.",

              errorCode:
                "OPENROUTER_API_ERROR",

              upstreamStatus:
                apiResponse.status
            },
            {
              status: 502
            }
          );

        }


        // =================================================
        // READ OPENROUTER RESPONSE
        // =================================================

        const data =
          await apiResponse.json();

        console.log(
          "OPENROUTER RESPONSE RECEIVED"
        );


        const aiResponse =
          data?.choices?.[0]
            ?.message?.content
            ?.trim();


        // =================================================
        // EMPTY RESPONSE
        // =================================================

        if (!aiResponse) {

          console.error(
            "OPENROUTER RESPONSE EMPTY:",
            JSON.stringify(data)
          );

          return Response.json(
            {
              response:
                "Kanna, Isai-ku AI response proper-aa kidaikkala.",

              errorCode:
                "EMPTY_AI_RESPONSE"
            },
            {
              status: 502
            }
          );

        }


        // =================================================
        // SUCCESS
        // =================================================

        return Response.json({

          response:
            aiResponse,

          emotionalState:
            emotionalSignal,

          relationship:
            relationship,

          reflection:
            reflection,

          decision:
            decision

        });


      } catch (error) {

        console.error(
          "ISAI WORKER ERROR:",
          error
        );

        return Response.json(
          {
            response:
              "Kanna, Isai Core-la connection problem vandhudhu.",

            errorCode:
              "WORKER_ERROR"
          },
          {
            status: 500
          }
        );

      }

    }


    // =====================================================
    // HEALTH CHECK
    // =====================================================

    return new Response(
      "ISAI AKOS CORE ONLINE",
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/plain"
        }
      }
    );

  }
};
