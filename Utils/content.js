// Function to extract and clean the job description from schema.org JobPosting markup
function findJobPostingSchema() {
  const scripts = document.querySelectorAll(
    'script[type="application/ld+json"]'
  );
  let jobPostingData = [];

  scripts.forEach((script) => {
    try {
      const json = JSON.parse(script.innerText);

      // If it's a JobPosting schema, add it to the jobPostingData array
      if (json["@type"] === "JobPosting") {
        jobPostingData.push(json);
      }
    } catch (e) {
      console.error("Error parsing JSON-LD:", e);
    }
  });

  if (jobPostingData.length > 0) {
    const jobPost = jobPostingData[0]; // Take the first job posting
    let description = jobPost.description;

    // Clean the description by removing HTML tags and decoding HTML entities
    description = cleanDescription(description);

    return {
      title: jobPost.title,
      company: jobPost.hiringOrganization.name,
      location:
        jobPost.jobLocation?.address?.addressLocality ||
        "Location not specified",
      description: description,
    };
  }

  return null; // Return null if no job posting was found
}

// Helper function to remove HTML tags and extra whitespace from a job description
function cleanDescription(description) {
  // Remove all HTML tags (e.g., <strong>, <br>) by replacing them with a single space
  let cleaned = description.replace(/<\/?[^>]+(>|$)/g, " ");

  // Decode HTML entities (e.g., &lt;, &gt;)
  const textArea = document.createElement("textarea");
  textArea.innerHTML = cleaned;
  cleaned = textArea.value;

  // Replace multiple spaces and newlines with a single space
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

// Send the found JobPosting schema to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getJobPostings") {
    const jobPostings = findJobPostingSchema();
    sendResponse({ jobPostings: jobPostings });
  }
});
