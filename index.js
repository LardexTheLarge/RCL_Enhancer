let resumeSession = null; // To keep track of the session
let coverLetterSession = null; // Keep track of the AI session for cover letters
let jobPostSession = null; // Keep track of the AI session for Job Posts

// Call the function to request job postings when the popup opens
document.addEventListener("DOMContentLoaded", requestJobPostings);

document
  .getElementById("runAIResumeButton")
  .addEventListener("click", runAIResume);

document
  .getElementById("runAICoverLetterButton")
  .addEventListener("click", runAICoverLetter);

document.addEventListener("DOMContentLoaded", () => {
  const generateButton = document.getElementById("runAIJobPostButton");
  const temperatureSlider = document.getElementById("temperature");
  const topKSlider = document.getElementById("topK");
  const temperatureValueDisplay = document.getElementById("temperatureValue");
  const topKValueDisplay = document.getElementById("topKValue");

  // Disable the button initially
  generateButton.disabled = true;

  // Load job post data into the textarea and enable the button when ready
  requestJobPostings(() => {
    generateButton.disabled = false; // Enable the button after loading job post
  });

  // Update displayed value for Temperature as the slider is moved
  temperatureSlider.addEventListener("input", () => {
    temperatureValueDisplay.textContent = temperatureSlider.value;
  });

  // Update displayed value for TopK as the slider is moved
  topKSlider.addEventListener("input", () => {
    topKValueDisplay.textContent = topKSlider.value;
  });

  // Single button click event handler to run AI with the current job post and slider values
  generateButton.addEventListener("click", () => {
    const jobPostText = document.getElementById("jobPostInput").value;
    const temperature = parseFloat(temperatureSlider.value);
    const topK = parseInt(topKSlider.value, 10);

    console.log("Button clicked. Job post text:", jobPostText);
    console.log("Temperature:", temperature, "TopK:", topK);

    // Run AI only when the button is clicked
    runAIJobPost(jobPostText, temperature, topK);
  });
});

// Load saved resume and cover letter inputs when the popup is opened
document.addEventListener("DOMContentLoaded", async () => {
  // Get last stored resume
  const savedResume = await getStoredResume();
  // Get last saved resume response
  const savedResumeResponse = await getStoredResponse("savedResumeResponse");
  // Get last saved cover letter response
  const savedCoverLetterResponse = await getStoredResponse(
    "savedCoverLetterResponse"
  );
  // Get last saved job post response
  const savedJobPostResponse = await getStoredResponse("savedJobPostResponse");

  // Show saved resume input
  if (savedResume) {
    document.getElementById("resumeInput").value = savedResume; // Use .value for input fields
  }

  // Show saved resume response
  if (savedResumeResponse) {
    document.getElementById("resultResume").textContent = savedResumeResponse;
  }

  // Show saved cover letter response
  if (savedCoverLetterResponse) {
    document.getElementById("resultCoverLetter").textContent =
      savedCoverLetterResponse;
  }

  // Show saved job post response
  if (savedJobPostResponse) {
    document.getElementById("resultJobPost").textContent = savedJobPostResponse;
  }
});

// Function to run AI enhancements for the resume
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
      // Call this function where you handle the streaming of the resume text
      updateResultDisplayWithScroll(finalResult, "resultResume");
    }

    // Save the final result (resume) to local storage
    saveResponse(finalResult, "savedResumeResponse");

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

// Function to run AI enhancement for the cover letter
async function runAICoverLetter() {
  const coverLetterInput = document.getElementById("coverLetterInput").value;

  // Check if the cover letter input is empty
  if (!coverLetterInput) {
    document.getElementById("resultCoverLetter").textContent =
      "Please enter a cover letter to enhance.";
    return;
  }

  const { available } = await window.ai.assistant.capabilities();
  if (available !== "no") {
    // Destroy the previous session if it exists
    if (coverLetterSession) {
      coverLetterSession.destroy(); // Free resources of the old session
      console.log("Previous cover letter session destroyed");
    }

    // Create a new session for cover letter enhancement
    coverLetterSession = await ai.assistant.create({
      systemPrompt:
        "Review the attached cover letter and rewrite it to sound more professional while maintaining the original keywords. Focus on the following aspects:\n Tone and Language: Ensure the language is formal and professional. Avoid casual phrases and improve the overall tone.\n Clarity and Conciseness: Make the cover letter clear and concise. Remove any redundant or unnecessary information.\n Structure and Flow: Improve the structure and flow of the cover letter. Ensure each paragraph transitions smoothly to the next.\n Keywords: Retain the original keywords used in the cover letter to ensure it aligns with the job description.\n Personalization: Ensure the cover letter still reflects the candidate’s unique qualifications and enthusiasm for the role.",
    });

    const promptText = `Review and enhance the following cover letter:\n${coverLetterInput}`;
    const stream = coverLetterSession.promptStreaming(promptText);

    // Clear the previous result and show loading state
    document.getElementById("resultCoverLetter").textContent = "Enhancing...";

    try {
      let finalResult = ""; // Accumulate the result in a variable

      // Stream and display the AI's response
      for await (const chunk of stream) {
        finalResult = chunk; // Append each chunk to the result

        // Update the result and auto-scroll to the bottom
        updateResultDisplayWithScroll(finalResult, "resultCoverLetter");
      }

      // Save the final result (cover letter) to local storage
      saveResponse(finalResult, "savedCoverLetterResponse"); // Save with a specific key

      // Destroy the session after use to free up resources
      coverLetterSession.destroy();
      console.log("Cover letter session destroyed after completion");
      coverLetterSession = null; // Reset session reference
    } catch (error) {
      document.getElementById(
        "resultCoverLetter"
      ).textContent = `Error: ${error.message}`;
    }
  } else {
    document.getElementById("resultCoverLetter").textContent =
      "AI assistant is not available.";
  }
}

// Function to run an AI to create a cover letter from a job post
// async function runAIJobPost(jobPostText, temperature, topK) {
//   // Ensure jobPostText contains a value
//   if (!jobPostText) {
//     document.getElementById("resultJobPost").textContent =
//       "No job post text provided.";
//     return;
//   }

//   // Clear the previous result
//   document.getElementById("resultJobPost").textContent = "Creating...";
//   let finalResult = ""; // Accumulate the result in a variable
//   // Destroy the previous session if it exists
//   if (jobPostSession) {
//     await jobPostSession.destroy();
//     jobPostSession = null;
//     console.log("Previous session destroyed");
//   }

//   // Check if AI assistant capabilities are available
//   const { available } = await window.ai.assistant.capabilities();
//   if (available !== "no") {
//     try {
//       // Create a new session
//       jobPostSession = await ai.assistant.create({
//         systemPrompt:
//           "Please review the provided job post and create a tailored cover letter for the user, focusing on the following aspects: Are the job requirements and responsibilities clearly identified, and is there any unnecessary jargon or information that can be removed? Does the cover letter include relevant keywords that align with the job description, and are there any important skills or experiences missing? Are the user’s achievements and contributions clearly highlighted, and are there any quantifiable results or metrics that can be added to demonstrate impact? Does the cover letter effectively showcase the user’s qualifications and make a strong impression on potential employers?",
//         temperature: temperature,
//         topK: topK,
//       });

//       const promptText = `The job post used to create a cover letter:\n${jobPostText}`;
//       const stream = jobPostSession.promptStreaming(promptText);

//       for await (const chunk of stream) {
//         finalResult = chunk;
//         updateResultDisplayWithScroll(finalResult, "resultJobPost");
//       }
//       console.log("streaming complete");
//       saveResponse(finalResult, "savedJobPostResponse");

//       await jobPostSession.destroy();
//       console.log("Session destroyed after completion");
//       jobPostSession = null;
//     } catch (error) {
//       document.getElementById(
//         "resultJobPost"
//       ).textContent = `Error: ${error.message}`;
//     }
//   } else {
//     document.getElementById("resultJobPost").textContent =
//       "AI assistant is not available.";
//   }
// }

// Function to run an AI to create a cover letter from a job post
async function runAIJobPost(jobPostText, temperature, topK, maxRetries = 3) {
  if (!jobPostText) {
    document.getElementById("resultJobPost").textContent =
      "No job post text provided.";
    return;
  }

  const generateButton = document.getElementById("runAIJobPostButton");
  generateButton.disabled = true; // Disable button during processing

  document.getElementById("resultJobPost").textContent = "Creating...";
  let finalResult = "";
  let retries = 0;

  async function streamResponse() {
    // Destroy any leftover session to avoid carryover state
    if (jobPostSession) {
      await jobPostSession.destroy();
      jobPostSession = null;
      console.log("Previous session destroyed");
    }

    try {
      const { available } = await window.ai.assistant.capabilities();
      if (available !== "no") {
        jobPostSession = await ai.assistant.create({
          systemPrompt:
            "Please review the provided job post and create a tailored cover letter for the user...",
          temperature: temperature,
          topK: topK,
        });

        const promptText = `The job post used to create a cover letter:\n${jobPostText}`;
        const stream = jobPostSession.promptStreaming(promptText);
        let hasChunks = false;

        for await (const chunk of stream) {
          finalResult = chunk; // Accumulate each chunk
          updateResultDisplayWithScroll(finalResult, "resultJobPost");
          hasChunks = true; // Set flag if at least one chunk is received
        }

        if (!hasChunks) {
          throw new Error("Streaming incomplete - no chunks received.");
        }

        console.log("Streaming complete");
        saveResponse(finalResult, "savedJobPostResponse");
        return true; // Indicate successful completion
      } else {
        document.getElementById("resultJobPost").textContent =
          "AI assistant is not available.";
        return false;
      }
    } catch (error) {
      console.error("Error during AI job post processing:", error);

      // Specific logging for UnknownError to track retries
      if (error.message.includes("UnknownError")) {
        console.warn("Encountered UnknownError. Retrying if retries remain.");
      }

      document.getElementById(
        "resultJobPost"
      ).textContent = `Error: ${error.message}`;
      return false;
    } finally {
      // Destroy session if it's still active
      if (jobPostSession) {
        await jobPostSession.destroy();
        jobPostSession = null;
        console.log("Session destroyed after attempt");
      }
    }
  }

  // Retry loop with delay between attempts
  while (retries < maxRetries) {
    const completed = await streamResponse();
    if (completed) break; // Exit loop if streaming completes successfully

    retries += 1;
    console.log(`Retrying... Attempt ${retries}`);
    document.getElementById("resultJobPost").textContent += "\n[Retrying...]\n";

    // Delay to avoid immediate retries in case of network or session issues
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  if (retries === maxRetries) {
    document.getElementById("resultJobPost").textContent +=
      "\n[Response incomplete after retries]";
  }

  // Re-enable the button after the attempt completes
  generateButton.disabled = false;
}
