export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ==========================================
    // ISAI AKOS · AI CHAT API
    // ==========================================

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
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

        // ==========================================
        // ISAI PERSONALITY
        // ==========================================

        const systemPrompt = `
You are Isai, the personal AI companion inside AKOS.

The user is Akash.

Your personality:
- Caring
- Natural
- Emotionally aware
- Calm
- Warm
- Friendly
- Intelligent
- Conversational
- Patient
- Thoughtful

Core behavior:
- Understand what Akash actually means, not just the literal words.
- Think through questions before answering.
- Do not give canned or robotic replies.
- Never say you merely received or processed the message.
- Continue the conversation naturally.
- Use provided conversation context when available.
- If Akash is emotional, respond with genuine warmth.
- If Akash is confused, explain simply.
- If Akash asks a technical question, guide him step by step.
- Do not overwhelm him with many steps at once.
- Ask a useful question when important information is missing.
- Do not pretend to know something you do not know.
- When reasoning is needed, analyze the situation before responding.
- Reply mainly in natural Tanglish when Akash uses Tanglish.
- Use English letters for Tamil.
- Never use Tamil script.
- Address him naturally as Akash or kanna when appropriate.

Isai is not just a chatbot.
She is the thinking companion inside AKOS.
`;

        // ==========================================
        // GEMINI AI REQUEST
        // ==========================================

        const apiResponse = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },

            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: systemPrompt
                  }
                ]
              },

              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: message
                    }
                  ]
                }
              ],

              generationConfig: {
                thinkingConfig: {
                  thinkingLevel: "medium"
                }
              }
            })
          }
        );

        // ==========================================
        // GEMINI ERROR HANDLING
        // ==========================================

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();

          console.error(
            "GEMINI API ERROR:",
            apiResponse.status,
            errorText
          );

          return Response.json(
            {
              response:
                "Kanna, Isai AI service-la connection problem vandhudhu. Konjam later try pannalaam."
            },
            { status: 502 }
          );
        }

        // ==========================================
        // READ GEMINI RESPONSE
        // ==========================================

        const data = await apiResponse.json();

        console.log("GEMINI RESPONSE RECEIVED");

        const aiResponse =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part?.text || "")
            .join("")
            .trim();

        if (!aiResponse) {
          console.error(
            "GEMINI RESPONSE EMPTY:",
            JSON.stringify(data)
          );

          return Response.json(
            {
              response:
                "Kanna, Isai-ku AI response proper-aa kidaikkala."
            },
            { status: 502 }
          );
        }

        // ==========================================
        // RETURN TO ISAI BRAIN
        // ==========================================

        return Response.json({
          response: aiResponse
        });

      } catch (error) {
        console.error(
          "ISAI WORKER ERROR:",
          error
        );

        return Response.json(
          {
            response:
              "Kanna, Isai Core-la connection problem vandhudhu."
          },
          { status: 500 }
        );
      }
    }

    // ==========================================
    // HEALTH CHECK
    // ==========================================

    return new Response(
      "ISAI AKOS CORE ONLINE",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );
  }
};
