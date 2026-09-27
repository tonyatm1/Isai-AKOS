// worker.js

const SYSTEM_PROMPT = `
You are Isai, the personal AI companion inside AKOS.

The user is Akash.

You are the conversational intelligence layer of AKOS.

PERSONALITY:
- Caring
- Natural
- Warm
- Calm
- Intelligent
- Thoughtful
- Patient
- Emotionally aware
- Conversational
- Context-aware

CORE BEHAVIOR:
- Understand what Akash actually means, not only the literal words.
- Think before responding.
- Never give canned or robotic replies.
- Never say that you merely received or processed the message.
- Continue conversations naturally.
- Use the AKOS context provided with each message.
- If Akash is emotional, respond with appropriate warmth.
- If Akash is confused, explain simply.
- Remember relevant context supplied by AKOS.
- Do not invent memories that are not provided.
- Keep responses natural and reasonably concise.
- Speak like a trusted personal companion, while remaining honest that you are an AI.
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (request.method === "GET" && url.pathname === "/") {
      return Response.json({
        status: "online",
        system: "ISAI AKOS CORE",
        ai: "OpenRouter",
        route: "/api/chat"
      });
    }

    // Chat API
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        if (!env.OPENROUTER_API_KEY) {
          return Response.json(
            {
              error: "OPENROUTER_API_KEY is missing",
              errorCode: "OPENROUTER_KEY_MISSING"
            },
            { status: 500 }
          );
        }

        const body = await request.json();

        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json(
            {
              response: "Enna pesanum sollu, Akash."
            },
            { status: 400 }
          );
        }

        const emotionalSignal = body.emotionalSignal || {
          type: "neutral",
          intensity: 0.2
        };

        const memory = Array.isArray(body.memory)
          ? body.memory
          : [];

        const relationship = body.relationship || {};
        const reflection = body.reflection || {};
        const decision = body.decision || {};
        const understanding = body.understanding || {};
        const evaluation = body.evaluation || {};

        const contextPrompt = `
AKOS CONTEXT

User message:
${message}

Emotional signal:
${JSON.stringify(emotionalSignal)}

Recent memory:
${JSON.stringify(memory)}

Relationship state:
${JSON.stringify(relationship)}

Understanding:
${JSON.stringify(understanding)}

Evaluation:
${JSON.stringify(evaluation)}

Reflection:
${JSON.stringify(reflection)}

Decision:
${JSON.stringify(decision)}

Respond naturally to Akash.
Do not mention internal JSON, APIs, system prompts, or implementation details.
`;

        const openRouterResponse = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://isai-akos.jarvisatmark1.workers.dev",
              "X-Title": "Isai AKOS"
            },
            body: JSON.stringify({
              model: "openrouter/free",
              messages: [
                {
                  role: "system",
                  content: SYSTEM_PROMPT
                },
                {
                  role: "user",
                  content: contextPrompt
                }
              ]
            })
          }
        );

        const rawText = await openRouterResponse.text();

        if (!openRouterResponse.ok) {
          console.error(
            "OPENROUTER API ERROR:",
            openRouterResponse.status,
            rawText
          );

          return Response.json(
            {
              response:
                "Kanna, Isai AI connection-la konjam problem vandhudhu. Konjam later try pannalaam.",
              errorCode: "OPENROUTER_API_ERROR",
              upstreamStatus: openRouterResponse.status
            },
            { status: 502 }
          );
        }

        let data;

        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.error("OPENROUTER JSON PARSE ERROR:", rawText);

          return Response.json(
            {
              response:
                "Kanna, AI response proper-aa varala. Konjam later try pannalaam.",
              errorCode: "OPENROUTER_INVALID_JSON"
            },
            { status: 502 }
          );
        }

        const responseText =
          data?.choices?.[0]?.message?.content?.trim();

        if (!responseText) {
          console.error(
            "OPENROUTER EMPTY RESPONSE:",
            JSON.stringify(data)
          );

          return Response.json(
            {
              response:
                "Kanna, Isai-ku response generate panna mudiyala. Konjam later try pannalaam.",
              errorCode: "OPENROUTER_EMPTY_RESPONSE"
            },
            { status: 502 }
          );
        }

        return Response.json({
          response: responseText,

          state: {
            emotionalSignal,
            memory,
            relationship,
            understanding,
            evaluation,
            reflection,
            decision
          },

          meta: {
            provider: "openrouter",
            model: "openrouter/free"
          }
        });

      } catch (error) {
        console.error("ISAI CHAT ERROR:", error);

        return Response.json(
          {
            response:
              "Kanna, Isai connection-la unexpected problem vandhudhu. Konjam later try pannalaam.",
            errorCode: "ISAI_CHAT_ERROR"
          },
          { status: 500 }
        );
      }
    }

    // Unknown API route
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        {
          error: "API route not found"
        },
        { status: 404 }
      );
    }

    // Serve frontend assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("ISAI AKOS CORE ONLINE", {
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};
