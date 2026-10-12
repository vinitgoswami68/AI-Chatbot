const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

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
                    message: message
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
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.error("Error:", error);
        loadingMessage.innerText =
            "VINITX AI से connection नहीं हो पाया।";
    }
}