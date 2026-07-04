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
.user-message{
    background:#0078ff;
    color:white;
    padding:10px;
    border-radius:10px;
    width:fit-content;
    margin-left:auto;
    margin-bottom:10px;
    max-width:80%;
}

.bot-message{
    margin-bottom:10px;
    max-width:80%;
}
