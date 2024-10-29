// Function to extract schema.org JobPosting markup from the page
function findJobPostingSchema() {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  let jobPostingData = [];

  scripts.forEach((script) => {
    try {
      const json = JSON.parse(script.innerText);

      // If it's a JobPosting schema, push it to the result array
      if (json["@type"] === "JobPosting") {
        jobPostingData.push(json);
      }
    } catch (e) {
      console.error("Error parsing JSON-LD:", e);
    }
  });

  // Return the extracted data
  return jobPostingData;
}

// Send the found JobPosting schema to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getJobPostings") {
    const jobPostings = findJobPostingSchema();
    sendResponse({ jobPostings: jobPostings });
  }
});
