let resumeSession = null; // To keep track of the session

document
  .getElementById("runAIResumeButton")
  .addEventListener("click", runAIResume);
document
  .getElementById("loadLastResponseButton")
  .addEventListener("click", loadLastResponse); // Add event listener for loading last response

document
  .getElementById("runAICoverLetterButton")
  .addEventListener("click", runAICoverLetter);

// Load saved resume input when the popup is opened
document.addEventListener("DOMContentLoaded", async () => {
  const savedResume = await getStoredResume();
  const savedResponse = await getStoredResponse(); // Get last saved response
  if (savedResume) {
    document.getElementById("resumeInput").value = savedResume;
  }
  if (savedResponse) {
    document.getElementById("resultResume").textContent = savedResponse; // Show saved response
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
        "Please review the attached resume and provide detailed feedback on how it can be improved. Focus on the following aspects:\n Content and Clarity: Are the job descriptions clear and concise? Is there any unnecessary jargon or information that can be removed?\n Relevance and Keywords: Does the resume include relevant keywords that align with the job description? Are there any important skills or experiences missing?\n Achievements and Impact: Are the achievements and contributions clearly highlighted? Are there any quantifiable results or metrics that can be added to demonstrate impact?\n Overall Impression: Does the resume effectively showcase the candidate’s qualifications and make a strong impression on potential employers?",
    });
  } else {
    document.getElementById("resultResume").textContent =
      "AI assistant is not available.";
    return;
  }

  try {
    // Send the resume to the AI and stream the response
    const promptText = `The resume to be reviewed:\n${resumeInput}`;
    const stream = resumeSession.promptStreaming(promptText);

    let finalResult = ""; // Accumulate the result in a variable

    for await (const chunk of stream) {
      finalResult = chunk; // Append each chunk to the result
      document.getElementById("resultResume").textContent = finalResult;
    }

    // Save the final result to local storage
    saveResponse(finalResult);

    // Destroy the session after use to free up resources
    resumeSession.destroy();
    console.log("Session destroyed after completion");
    resumeSession = null; // Reset session reference
  } catch (error) {
    document.getElementById(
      "resultResume"
    ).textContent = `Error: ${error.message}`;
  }
}

// Function to load the last AI response from local storage
function loadLastResponse() {
  getStoredResponse().then((response) => {
    if (response) {
      document.getElementById("resultResume").textContent = response;
    } else {
      document.getElementById("resultResume").textContent =
        "No previous response found.";
    }
  });
}

// Save the AI response to Chrome's local storage
function saveResponse(responseText) {
  chrome.storage.local.set({ savedResponse: responseText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving response:", chrome.runtime.lastError);
    } else {
      console.log("Response saved successfully");
    }
  });
}

// Retrieve the saved AI response from local storage
function getStoredResponse() {
  return new Promise((resolve) => {
    chrome.storage.local.get("savedResponse", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving response:", chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(result.savedResponse || "");
      }
    });
  });
}

// Save the resume to Chrome's local storage
function saveResume(resumeText) {
  console.log("Attempting to save resume"); // Log the resume text you're saving
  chrome.storage.local.set({ savedResume: resumeText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving resume:", chrome.runtime.lastError);
    } else {
      console.log("Resume saved successfully");
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
