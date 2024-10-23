// Function to update the result display with auto-scroll to the bottom
function updateResultDisplayWithScroll(result, elementId) {
  const resultDiv = document.getElementById(elementId);
  resultDiv.textContent = result; // Update the content with the result
  resultDiv.scrollTop = resultDiv.scrollHeight; // Scroll to the bottom
}

// Save the AI response to Chrome's local storage
function saveResponse(responseText, storageKey = "savedResponse") {
  chrome.storage.local.set({ [storageKey]: responseText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving response:", chrome.runtime.lastError);
    } else {
      console.log(`Response saved successfully under key: ${storageKey}`);
    }
  });
}

// Retrieve the saved AI response from local storage
function getStoredResponse(storageKey = "savedResponse") {
  return new Promise((resolve) => {
    chrome.storage.local.get([storageKey], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving response:", chrome.runtime.lastError);
        resolve(null);
      } else {
        console.log(`Retrieved ${storageKey} from storage`); // Log the retrieved value
        resolve(result[storageKey] || "");
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
    chrome.storage.local.get("savedResumeInput", (result) => {
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

// Save the job post to Chrome's local storage
function saveJobPost(jobPostText) {
  console.log("Attempting to save job post"); // Log the job post text you're saving
  chrome.storage.local.set({ savedJobPost: jobPostText }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving job post:", chrome.runtime.lastError);
    } else {
      console.log("Job post saved successfully");
    }
  });
}

// Retrieve the saved resume from local storage
function getStoredInput(storageKey = "savedInput") {
  return new Promise((resolve) => {
    chrome.storage.local.get([storageKey], (result) => {
      if (chrome.runtime.lastError) {
        console.error(
          `Error retrieving ${storageKey}:`,
          chrome.runtime.lastError
        );
        resolve(null);
      } else {
        console.log(`Retrieved ${storageKey} from storage`); // Log the retrieved value
        resolve(result[storageKey] || ""); // Use empty string if undefined
      }
    });
  });
}
