const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);

function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") return;

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.innerText = message;

    chatBox.appendChild(userMessage);

    userInput.value = "";

    setTimeout(() => {

        const botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.innerText = "You said: " + message;

        chatBox.appendChild(botMessage);

        chatBox.scrollTop = chatBox.scrollHeight;

    }, 500);

}
