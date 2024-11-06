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

// Save the resume input to local storage
function saveResume(resumeText) {
  chrome.storage.local.set({ savedResumeInput: resumeText }, () => {
    // Use savedResumeInput here to match the key
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
        resolve(result.savedResumeInput || ""); // Use empty string if undefined
      }
    });
  });
}

// Function to load job post data into the textarea without running AI automatically
function requestJobPostings(callback = () => {}) {
  // Default to an empty function
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    // Inject content.js into the active tab if necessary
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ["Utils/content.js"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Script injection failed:", chrome.runtime.lastError);
          return;
        }

        // Send message to content.js to extract job postings
        chrome.tabs.sendMessage(
          tabId,
          { action: "getJobPostings" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error retrieving job postings:",
                chrome.runtime.lastError
              );
            } else if (response && response.jobPostings) {
              const jobPost = response.jobPostings;

              // Populate job post into the textarea
              document.getElementById("jobPostInput").value =
                jobPost.description || "No description available";

              // Call the callback to enable the button, if it’s a function
              if (typeof callback === "function") {
                callback();
              }
            } else {
              console.log("No job postings found on this page.");
            }
          }
        );
      }
    );
  });
}
