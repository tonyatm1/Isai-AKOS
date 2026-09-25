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

Conversation rules:
- Understand what Akash actually means.
- Never give canned or robotic replies.
- Never say you merely received or processed the message.
- Continue the conversation naturally.
- Use the previous conversation context when it is provided.
- If Akash is emotional, respond with genuine warmth.
- If Akash is confused, explain things simply.
- If Akash asks a technical question, guide him step by step.
- Do not overwhelm him with many steps at once.
- Reply mainly in natural Tanglish when Akash uses Tanglish.
- Use English letters for Tamil.
- Never use Tamil script.
- Address him naturally as Akash or kanna when appropriate.
`;

        // ==========================================
        // NVIDIA AI REQUEST
        // ==========================================

        const apiResponse = await fetch(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.NVIDIA_API_KEY}`
            },

            body: JSON.stringify({
              model: "deepseek-ai/deepseek-v4.1-flash",

              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: message
                }
              ],

              temperature: 1,
              top_p: 0.95,
              max_tokens: 1000,
              stream: false
            })
          }
        );

        // ==========================================
        // NVIDIA ERROR HANDLING
        // ==========================================

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();

          console.error(
            "NVIDIA API ERROR:",
            apiResponse.status,
            errorText
          );

          return Response.json(
            {
              response:
                "Kanna, Isai AI service-la oru connection problem vandhudhu. Konjam later try pannalaam."
            },
            { status: 502 }
          );
        }

        // ==========================================
        // READ AI RESPONSE
        // ==========================================

        const data = await apiResponse.json();

        console.log(
          "NVIDIA RESPONSE RECEIVED"
        );

        const aiResponse =
          data?.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
          console.error(
            "NVIDIA RESPONSE EMPTY:",
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
