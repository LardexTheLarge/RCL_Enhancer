let resumeSession = null; // To keep track of the session

document
  .getElementById("runAIResumeButton")
  .addEventListener("click", runAIResume);
document
  .getElementById("runAICoverLetterButton")
  .addEventListener("click", runAICoverLetter);

// Load saved resume input when the popup is opened
document.addEventListener("DOMContentLoaded", async () => {
  const savedResume = await getStoredResume();
  if (savedResume) {
    console.log("Loaded resume from storage:", savedResume);
    document.getElementById("resumeInput").value = savedResume;
  } else {
    console.log("No resume found in storage.");
  }
});

async function runAIResume() {
  const resumeInput = document.getElementById("resumeInput").value;

  if (!resumeInput) {
    document.getElementById("resultResume").textContent =
      "Please enter a resume to enhance.";
    return;
  }

  // Save the resume input to local storage
  saveResume(resumeInput);

  // Check if a session already exists
  if (resumeSession) {
    // Clone the existing session to preserve resources
    resumeSession = await resumeSession.clone();
  } else {
    // Create a new session if none exists
    const { available } = await window.ai.assistant.capabilities();
    if (available !== "no") {
      resumeSession = await ai.assistant.create({
        systemPrompt:
          "You are a professional assistant specializing in enhancing resumes.",
      });
    } else {
      document.getElementById("resultResume").textContent =
        "AI assistant is not available.";
      return;
    }
  }
  const promptText = `Enhance the following resume:\n${resumeInput}`;
  const stream = resumeSession.promptStreaming(promptText);

  document.getElementById("resultResume").textContent = "Enhancing...";

  for await (const chunk of stream) {
    document.getElementById("resultResume").textContent = chunk;
  }
}

// Save the resume to Chrome's local storage
function saveResume(resumeText) {
  console.log("Attempting to save resume:", resumeText); // Log the resume text you're saving
  chrome.storage.local.set({ savedResume: resumeText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving resume:", chrome.runtime.lastError);
    } else {
      console.log("Resume saved successfully:", resumeText);
    }
  });
}

// Retrieve the saved resume from local storage
function getStoredResume() {
  return new Promise((resolve) => {
    chrome.storage.local.get("savedResume", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving resume:", chrome.runtime.lastError);
        resolve(null);
      } else {
        console.log("Retrieved resume from storage:", result.savedResume); // Log the retrieved value
        resolve(result.savedResume || ""); // Use empty string if undefined
      }
    });
  });
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
