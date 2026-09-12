const promptInput = document.getElementById("prompt");
const outputType = document.getElementById("outputType");
const generateBtn = document.getElementById("generateBtn");
const outputArea = document.getElementById("outputArea");

async function generateContent() {
  const prompt = promptInput.value.trim();
  const type = outputType.value;

  if (!prompt) {
    outputArea.innerHTML = `
      <div class="empty-output">
        <div>
          <h3>Please enter a prompt</h3>
          <p>Tell AI Master what you want to create.</p>
        </div>
      </div>
    `;

    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  outputArea.innerHTML = `
    <div class="empty-output">
      <div>
        <div class="empty-icon">⚙️</div>
        <h3>AI Master is working...</h3>
        <p>Creating your ${type} output.</p>
      </div>
    </div>
  `;

  try {

    /*
     * This endpoint will be created in the next backend phase.
     */
    const response = await fetch("/api/ai/generate", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt,
        type
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generation failed");
    }

    renderOutput(data);

  } catch (error) {

    outputArea.innerHTML = `
      <div class="empty-output">
        <div>
          <div class="empty-icon">⚠️</div>
          <h3>Generation failed</h3>
          <p>${escapeHtml(error.message)}</p>
        </div>
      </div>
    `;

  } finally {

    generateBtn.disabled = false;
    generateBtn.textContent = "✨ Generate";

  }
}


function renderOutput(data) {

  if (data.type === "audio" && data.url) {

    outputArea.innerHTML = `
      <h3>🔊 Audio Output</h3>

      <audio
        controls
        style="width:100%; margin-top:20px;"
        src="${data.url}">
      </audio>
    `;

    return;
  }


  if (data.type === "video" && data.url) {

    outputArea.innerHTML = `
      <h3>🎬 Video Output</h3>

      <video
        controls
        style="width:100%; margin-top:20px; border-radius:12px;"
        src="${data.url}">
      </video>
    `;

    return;
  }


  if (data.type === "image" && data.url) {

    outputArea.innerHTML = `
      <h3>🖼️ Image Output</h3>

      <img
        src="${data.url}"
        style="width:100%; margin-top:20px; border-radius:12px;"
        alt="Generated image"
      />
    `;

    return;
  }


  outputArea.innerHTML = `
    <div>
      <h3>🤖 AI Output</h3>

      <p style="margin-top:15px; line-height:1.7;">
        ${escapeHtml(data.content || "No output returned.")}
      </p>
    </div>
  `;
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


generateBtn.addEventListener("click", generateContent);


document.querySelectorAll(".action-card").forEach((card) => {

  card.addEventListener("click", () => {

    const type = card.dataset.type;

    outputType.value = type;

    promptInput.focus();

  });

});
