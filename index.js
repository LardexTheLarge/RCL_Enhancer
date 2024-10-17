let resumeSession = null; // To keep track of the session
let abortController = null; // To handle cancellation of streaming

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
    document.getElementById("resumeInput").value = savedResume;
  }
});

// Function to run AI enhancement for the resume
async function runAIResume() {
  const resumeInput = document.getElementById("resumeInput").value;

  if (!resumeInput) {
    document.getElementById("resultResume").textContent =
      "Please enter a resume to enhance.";
    return;
  }

  // Save the resume input to local storage
  saveResume(resumeInput);

  // Clear the previous result
  document.getElementById("resultResume").textContent = "Enhancing...";

  // Abort the previous stream if it exists
  if (abortController) {
    abortController.abort(); // Cancel any ongoing streaming
    console.log("Previous stream aborted");
  }

  // Destroy the previous session if it exists
  if (resumeSession) {
    resumeSession.destroy(); // Free resources of the old session
    console.log("Previous session destroyed");
  }

  // Create a new session
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

  // Create a new AbortController to manage the current streaming
  abortController = new AbortController();
  const signal = abortController.signal;

  try {
    // Send the resume to the AI and stream the response
    const promptText = `Enhance the following resume:\n${resumeInput}`;
    const stream = resumeSession.promptStreaming(promptText, { signal });

    let finalResult = ""; // Accumulate the result in a variable
    for await (const chunk of stream) {
      if (signal.aborted) {
        console.log("Stream aborted before completion");
        break;
      }
      finalResult = chunk; // Accumulate the result in a local variable
      updateResultDisplay(finalResult); // Efficiently update the DOM
    }

    document.getElementById("resultResume").textContent +=
      "\nEnhancement complete.";

    // Destroy the session after use to free up resources
    resumeSession.destroy();
    console.log("Session destroyed after completion");
    resumeSession = null; // Reset session reference
  } catch (error) {
    if (signal.aborted) {
      document.getElementById("resultResume").textContent =
        "Streaming was canceled.";
    } else {
      document.getElementById(
        "resultResume"
      ).textContent = `Error: ${error.message}`;
    }
  }
}

// Function to update the result display more efficiently
function updateResultDisplay(result) {
  document.getElementById("resultResume").textContent = result; // Update the text content with the accumulated result
}

// Save the resume to Chrome's local storage
function saveResume(resumeText) {
  console.log("Attempting to save resume"); // Log the resume text you're saving
  chrome.storage.local.set({ savedResume: resumeText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving resume:", chrome.runtime.lastError);
    } else {
      console.log("Resume saved successfully:");
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
        console.log("Retrieved resume from storage"); // Log the retrieved value
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
