export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json(
            { response: "Enna pesanum sollu, Akash." },
            { status: 400 }
          );
        }

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
                  content:
                    "You are Isai, the caring AI companion inside AKOS. " +
                    "Reply naturally and warmly. Understand the user's message " +
                    "and continue the conversation instead of repeating canned replies."
                },
                {
                  role: "user",
                  content: message
                }
              ],
              temperature: 0.7,
              max_tokens: 500
            })
          }
        );

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();

          return Response.json(
            {
              response: "Isai AI connection-la problem irukku.",
              error: errorText
            },
            { status: 502 }
          );
        }

        const data = await apiResponse.json();

        const response =
          data?.choices?.[0]?.message?.content?.trim();

        if (!response) {
          return Response.json(
            { response: "AI response empty-aa vandhudhu." },
            { status: 502 }
          );
        }

        return Response.json({
          response
        });

      } catch (error) {
        return Response.json(
          {
            response: "Isai Core-la connection problem vandhudhu."
          },
          { status: 500 }
        );
      }
    }

    return new Response("ISAI AKOS CORE ONLINE", {
      status: 200
    });
  }
};
