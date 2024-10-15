document
  .getElementById("runAIResumeButton")
  .addEventListener("click", runAIResume);
document
  .getElementById("runAICoverLetterButton")
  .addEventListener("click", runAICoverLetter);

async function runAIResume() {
  const resumeInput = document.getElementById("resumeInput").value;
  const { available } = await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await ai.assistant.create({
      systemPrompt:
        "You are a professional assistant specializing in enhancing resumes. You provide clear, concise, and impactful suggestions to improve job applications.",
    });

    const promptText = `Enhance the following resume:\n${resumeInput}`;
    const stream = session.promptStreaming(promptText);

    document.getElementById("resultResume").textContent = "Enhancing...";

    for await (const chunk of stream) {
      document.getElementById("resultResume").textContent = chunk;
    }
  } else {
    document.getElementById("resultResume").textContent =
      "AI assistant is not available.";
  }
}

async function runAICoverLetter() {
  const coverLetterInput = document.getElementById("coverLetterInput").value;
  const { available } = await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await ai.assistant.create({
      systemPrompt:
        "You are a professional assistant specializing in enhancing cover letters. You provide clear, concise, and impactful suggestions to improve job applications.",
    });

    const promptText = `Enhance the following cover letter:\n${coverLetterInput}`;
    const stream = session.promptStreaming(promptText);

    document.getElementById("resultCoverLetter").textContent = "Enhancing...";

    for await (const chunk of stream) {
      document.getElementById("resultCoverLetter").textContent = chunk;
    }
  } else {
    document.getElementById("resultCoverLetter").textContent =
      "AI assistant is not available.";
  }
}
