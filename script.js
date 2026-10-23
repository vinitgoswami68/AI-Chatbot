const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Remember the recent conversation in this browser on this device.
const MEMORY_KEY = "vinitx-ai-chat-memory-v1";
let chatHistory = [];
try {
    const saved = JSON.parse(localStorage.getItem(MEMORY_KEY) || "[]");
    if (Array.isArray(saved)) {
        chatHistory = saved.filter(item => item &&
            (item.role === "user" || item.role === "model") &&
            typeof item.text === "string").slice(-20);
    }
} catch (_) {
    chatHistory = [];
}

function saveChatHistory() {
    try {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(chatHistory.slice(-20)));
    } catch (error) {
        console.warn("Could not save VINITX AI chat memory:", error);
    }
}

function renderSavedHistory() {
    chatHistory.forEach(item => {
        const bubble = document.createElement("div");
        bubble.className = item.role === "user" ? "user-message" : "bot-message";
        bubble.innerText = item.text;
        chatBox.appendChild(bubble);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

renderSavedHistory();

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") return;

    // User message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = message;

    chatBox.appendChild(userMessage);

    userInput.value = "";

    // Loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "bot-message";
    loadingMessage.innerText = "VINITX AI सोच रहा है...";

    chatBox.appendChild(loadingMessage);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(
            "https://vinitx-ai-backend.onrender.com/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory.slice(-12)
                })
            }
        );

        const data = await response.json();

        loadingMessage.remove();

        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.innerText = data.reply || data.error ||
            "माफ़ कीजिए, जवाब नहीं मिल पाया।";

        chatBox.appendChild(botMessage);
        if (response.ok && data.reply) {
            chatHistory.push(
                { role: "user", text: message },
                { role: "model", text: data.reply }
            );
            chatHistory = chatHistory.slice(-20);
            saveChatHistory();
        }
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("Error:", error);
        loadingMessage.innerText =
            "VINITX AI से connection नहीं हो पाया।";
    }
}