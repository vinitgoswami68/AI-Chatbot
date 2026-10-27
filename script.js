const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const welcomePanel = document.getElementById("welcomePanel");
const MEMORY_KEY = "vinitx-ai-chat-memory-v1";
let chatHistory = [];
let sending = false;

try {
  const saved = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
  if (Array.isArray(saved)) chatHistory = saved.filter(item =>
    item && (item.role === "user" || item.role === "model") &&
    typeof item.text === "string").slice(-20);
} catch (_) { chatHistory = []; }

function saveChatHistory() {
  try { localStorage.setItem(MEMORY_KEY, JSON.stringify(chatHistory.slice(-20))); }
  catch (error) { console.warn("Could not save VINITX AI chat memory:", error); }
}
function scrollToLatest() { chatBox.scrollTop = chatBox.scrollHeight; }
function addMessage(role, text, extraClass = "") {
  const node = document.createElement("div");
  node.className = (role === "user" ? "user-message" : "bot-message") + (extraClass ? " " + extraClass : "");
  node.innerText = text;
  chatBox.appendChild(node);
  return node;
}
function hideWelcome() {
  const panel = document.getElementById("welcomePanel");
  if (panel) panel.remove();
}
function renderSavedHistory() {
  if (!chatHistory.length) return;
  hideWelcome();
  chatHistory.forEach(item => addMessage(item.role, item.text));
  scrollToLatest();
}
function startNewChat() {
  chatHistory = [];
  saveChatHistory();
  chatBox.replaceChildren();
  const template = document.createElement("div");
  template.className = "welcome";
  template.id = "welcomePanel";
  template.innerHTML = `
    <div class="welcome-kicker"><span>✳</span> YOUR IDEAS, IN MOTION</div>
    <h1>A little more clarity.<br><span>A lot more possibility.</span></h1>
    <p class="welcome-description">A thoughtful AI companion for the things you want to understand, create, and figure out.</p>
    <div class="prompt-heading"><span>START WITH SOMETHING</span><span class="prompt-line"></span></div>
    <div class="suggestions">
      <button class="suggestion" data-prompt="Explain Java if-else with a small example."><span class="suggestion-icon violet">⌘</span><span><strong>Make code make sense</strong><small>Understand a concept with an example</small></span><span class="suggestion-arrow">↗</span></button>
      <button class="suggestion" data-prompt="Help me prepare a simple, effective revision plan for an exam."><span class="suggestion-icon amber">▤</span><span><strong>Study with a plan</strong><small>Break a topic into easy steps</small></span><span class="suggestion-arrow">↗</span></button>
      <button class="suggestion" data-prompt="Help me brainstorm a useful project idea I can build as a student."><span class="suggestion-icon green">✳</span><span><strong>Build something useful</strong><small>Turn a rough idea into a plan</small></span><span class="suggestion-arrow">↗</span></button>
      <button class="suggestion" data-prompt="What kinds of questions can you help me with?"><span class="suggestion-icon blue">↗</span><span><strong>Explore a question</strong><small>Start wherever your curiosity goes</small></span><span class="suggestion-arrow">↗</span></button>
    </div><p class="welcome-footnote">No perfect prompt needed. Just start typing.</p>`;
  chatBox.appendChild(template);
  userInput.focus();
}
function autoGrow() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 150) + "px";
}
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || sending) return;
  sending = true;
  sendBtn.disabled = true;
  hideWelcome();
  addMessage("user", message);
  userInput.value = "";
  userInput.style.height = "auto";
  const loading = addMessage("model", "Working on that…", "loading");
  scrollToLatest();

  try {
    const response = await fetch("https://vinitx-ai-backend.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: chatHistory.slice(-12) })
    });
    const data = await response.json();
    loading.remove();
    if (!response.ok) throw new Error(data.error || "Request failed");
    const reply = data.reply || data.error || "Sorry, I couldn't find a response just now.";
    addMessage("model", reply);
    chatHistory.push({ role: "user", text: message }, { role: "model", text: reply });
    chatHistory = chatHistory.slice(-20);
    saveChatHistory();
  } catch (error) {
    console.error("VINITX AI request failed:", error);
    loading.innerText = "I couldn't connect just now. Please check your connection and try again.";
    loading.classList.remove("loading");
  } finally {
    sending = false;
    sendBtn.disabled = false;
    userInput.focus();
    scrollToLatest();
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("input", autoGrow);
userInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});
document.getElementById("newChatBtn")?.addEventListener("click", startNewChat);
document.querySelectorAll("[data-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;
    if (prompt) {
      userInput.value = prompt;
      autoGrow();
      userInput.focus();
      if (button.classList.contains("side-btn")) {
        document.querySelectorAll(".side-btn").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
      }
      if (button.classList.contains("suggestion")) sendMessage();
    } else {
      startNewChat();
    }
  });
});
renderSavedHistory();