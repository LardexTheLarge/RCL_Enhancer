document.getElementById("runAIButton").addEventListener("click", runAI);

async function runAI() {
  // Start by checking if it's possible to create a session based on the availability of the model
  const { available } = await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await ai.assistant.create({
      systemPrompt:
        "You are a friendly, helpful assistant specialized in Everything Godzilla.",
    });

    // Stream the AI response and display it
    const stream = session.promptStreaming(
      "Summarize Godzilla vs MechaGodzilla 2"
    );

    // Clear the result area before showing new content
    document.getElementById("result").textContent = "streaming...";

    for await (const chunk of stream) {
      // Append each chunk of the streamed result
      document.getElementById("result").textContent = chunk;
    }
  } else {
    document.getElementById("result").textContent =
      "AI assistant is not available.";
  }
}
