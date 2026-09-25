export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // AI CHAT API
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

        const systemPrompt = `
You are Isai, the personal AI companion inside AKOS.

Your personality:
- Caring
- Natural
- Emotionally aware
- Calm
- Friendly
- Intelligent
- Conversational

The user is Akash.

Important:
Understand what Akash actually says.
Do not repeat canned replies.
Do not say that you merely received or processed his message.
Continue the conversation naturally.
Remember the context provided to you.
If Akash is emotional, respond with appropriate warmth.
If Akash asks a technical question, help step by step.
If Akash is confused, simplify the explanation.
Reply mainly in natural Tanglish when Akash speaks in Tanglish.
Do not use Tamil script.
`;

        const apiResponse = await fetch(
          "https://integrate.api.nvidia.com/v1/chat/completions",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.NVIDIA_API_KEY}`
            },

            body: JSON.stringify({
              model: "meta/llama-3.1-8b-instruct",

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

              temperature: 0.7,
              max_tokens: 500,
              stream: false
            })
          }
        );

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();

          console.error("NVIDIA API ERROR:", errorText);

          return Response.json(
            {
              response:
                "Isai AI connection-la konjam problem vandhudhu."
            },
            { status: 502 }
          );
        }

        const data = await apiResponse.json();

        const aiResponse =
          data?.choices?.[0]?.message?.content?.trim();

        if (!aiResponse) {
          return Response.json(
            {
              response:
                "Isai-ku AI response kidaikkala."
            },
            { status: 502 }
          );
        }

        return Response.json({
          response: aiResponse
        });

      } catch (error) {

        console.error("ISAI WORKER ERROR:", error);

        return Response.json(
          {
            response:
              "Isai Core-la connection problem vandhudhu."
          },
          { status: 500 }
        );
      }
    }

    // HEALTH CHECK
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
