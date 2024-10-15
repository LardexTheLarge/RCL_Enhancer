document.getElementById("runAIButton").addEventListener("click", runAI);

async function runAI() {
  // Get the user input from the text areas
  const resumeInput = document.getElementById("resumeInput").value;

  // Start by checking if it's possible to create a session based on the availability of the model
  const { available } = await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await ai.assistant.create({
      systemPrompt:
        "You are a professional assistant specializing in enhancing resumes. You provide clear, concise, and impactful suggestions to improve job applications.",
    });

    // Construct the prompt dynamically using the user's input
    const promptText = `Enhance the following resume and cover letter: \n\nResume:\n${resumeInput}`;

    // Stream the AI response and display it
    const stream = session.promptStreaming(promptText);

    // Clear the result area before showing new content
    document.getElementById("result").textContent = "Enhancing...";

    for await (const chunk of stream) {
      // Append each chunk of the streamed result
      document.getElementById("result").textContent = chunk;
    }
  } else {
    document.getElementById("result").textContent =
      "AI assistant is not available.";
  }
}
