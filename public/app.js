const promptInput =
  document.getElementById("prompt");

const generateBtn =
  document.getElementById("generateBtn");

const chatMessages =
  document.getElementById("chatMessages");

const typingIndicator =
  document.getElementById("typingIndicator");

const newChatBtn =
  document.getElementById("newChatBtn");

const topNewChatBtn =
  document.getElementById("topNewChatBtn");

let conversation = [];


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

  const prompt =
    promptInput.value.trim();

  if (!prompt) {
    return;
  }

  addMessage("user", prompt);

  conversation.push({
    role: "user",
    content: prompt
  });

  promptInput.value = "";

  autoResize();

  generateBtn.disabled = true;

  showTyping();

  try {

    const response = await fetch(
      "/api/ai/generate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          prompt: buildConversationPrompt(),
          type: "text"
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "AI generation failed"
      );

    }

    hideTyping();

    const answer =
      data.content ||
      "I didn't receive a response from AI Master.";

    addMessage("ai", answer);

    conversation.push({
      role: "assistant",
      content: answer
    });

  } catch (error) {

    hideTyping();

    addMessage(
      "error",
      `Sorry, something went wrong.\n\n${error.message}`
    );

  } finally {

    generateBtn.disabled = false;

    promptInput.focus();

  }
}


/* =========================
   CONVERSATION
========================= */

function buildConversationPrompt() {

  if (conversation.length <= 1) {

    return conversation[0]?.content || "";

  }

  return `
You are AI Master, a helpful conversational AI assistant.

Continue the conversation naturally.

Conversation:

${conversation
  .map(message => {

    const speaker =
      message.role === "user"
        ? "User"
        : "AI Master";

    return `${speaker}: ${message.content}`;

  })
  .join("\n\n")}

AI Master:
`;

}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(
  type,
  text
) {

  const welcome =
    document.getElementById(
      "welcomeScreen"
    );

  if (welcome) {
    welcome.remove();
  }

  const message =
    document.createElement("div");

  message.className =
    `chat-message ${type}-message`;


  if (type === "user") {

    message.innerHTML = `
      <div class="message-avatar user-message-avatar">
        You
      </div>

      <div class="message-content">
        ${escapeHtml(text)}
      </div>
    `;

  }


  else if (type === "ai") {

    message.innerHTML = `
      <div class="message-avatar ai-message-avatar">
        AI
      </div>

      <div class="message-content">
        ${formatAIResponse(text)}
      </div>
    `;

  }


  else {

    message.innerHTML = `
      <div class="message-avatar error-message-avatar">
        !
      </div>

      <div class="message-content">
        ${escapeHtml(text)}
      </div>
    `;

  }


  chatMessages.appendChild(message);

  scrollToBottom();

}


/* =========================
   FORMAT RESPONSE
========================= */

function formatAIResponse(text) {

  let safe =
    escapeHtml(text);

  safe =
    safe.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

  safe =
    safe.replace(
      /\n/g,
      "<br>"
    );

  return safe;

}


/* =========================
   TYPING
========================= */

function showTyping() {

  typingIndicator.classList.remove(
    "hidden"
  );

  scrollToBottom();

}


function hideTyping() {

  typingIndicator.classList.add(
    "hidden"
  );

}


/* =========================
   NEW CHAT
========================= */

function newChat() {

  conversation = [];

  chatMessages.innerHTML = `

    <div
      id="welcomeScreen"
      class="welcome-screen"
    >

      <div class="welcome-avatar">
        🤖
      </div>

      <h2>
        How can I help you today?
      </h2>

      <p>
        I'm AI Master. Ask me anything,
        create content, brainstorm ideas,
        write code, or solve a problem.
      </p>

      <div class="suggestions">

        <button
          class="suggestion"
          data-prompt="Explain artificial intelligence in simple terms."
        >
          💡 Explain something
        </button>

        <button
          class="suggestion"
          data-prompt="Give me 5 creative business ideas I can start."
        >
          💼 Business ideas
        </button>

        <button
          class="suggestion"
          data-prompt="Help me write a professional message."
        >
          ✍️ Help me write
        </button>

        <button
          class="suggestion"
          data-prompt="Teach me something interesting today."
        >
          🧠 Teach me
        </button>

      </div>

    </div>

  `;

  attachSuggestionEvents();

  promptInput.value = "";

  autoResize();

  promptInput.focus();

}


/* =========================
   SUGGESTIONS
========================= */

function attachSuggestionEvents() {

  document
    .querySelectorAll(".suggestion")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          promptInput.value =
            button.dataset.prompt;

          autoResize();

          promptInput.focus();

        }
      );

    });

}


/* =========================
   TEXTAREA
========================= */

function autoResize() {

  promptInput.style.height =
    "auto";

  promptInput.style.height =
    Math.min(
      promptInput.scrollHeight,
      180
    ) + "px";

}


/* =========================
   ENTER TO SEND
========================= */

promptInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


promptInput.addEventListener(
  "input",
  autoResize
);


/* =========================
   BUTTONS
========================= */

generateBtn.addEventListener(
  "click",
  sendMessage
);


newChatBtn.addEventListener(
  "click",
  newChat
);


topNewChatBtn.addEventListener(
  "click",
  newChat
);


/* =========================
   NAVIGATION
========================= */

document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".nav-item")
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );

        button.classList.add(
          "active"
        );

      }
    );

  });


/* =========================
   SECURITY
========================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

  setTimeout(
    () => {

      chatMessages.scrollTop =
        chatMessages.scrollHeight;

    },
    50
  );

}


/* =========================
   START
========================= */

attachSuggestionEvents();
