async function runAI() {
  // Start by checking if it's possible to create a session based on the availability of the model, and the characteristics of the device.
  const { available, defaultTemperature, defaultTopK, maxTopK } =
    await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await window.ai.assistant.create();

    // Prompt the model and wait for the whole result to come back.
    const result = await session.prompt("Write me a poem");
    console.log(result);
  }
}

// Call the function to run the AI prompt
runAI();
