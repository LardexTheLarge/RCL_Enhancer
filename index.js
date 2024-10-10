document.getElementById("runAIButton").addEventListener("click", runAI);

async function runAI() {
  // Start by checking if it's possible to create a session based on the availability of the model, and the characteristics of the device.
  const { available, defaultTemperature, defaultTopK, maxTopK } =
    await window.ai.assistant.capabilities();

  if (available !== "no") {
    const session = await window.ai.assistant.create();

    // // Prompt the model and wait for the whole result to come back.
    // const result = await session.prompt("Write me a poem");
    // document.getElementById("result").textContent = result;

    // Prompt the model and stream the result:
    const stream = session.promptStreaming("Describe Godzilla in 2 sentences");
    for await (const chunk of stream) {
      document.getElementById("result").textContent = chunk;
    }
  }
}
