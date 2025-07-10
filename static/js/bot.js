const userInput = document.getElementById("userInput");
const chatbox = document.getElementById("chatbox");
const sendBtn = document.getElementById("sendBtn");

// Emoji map
const emojiMap = {
    happy: '😊',
    sad: '😢',
    hello: '👋',
    thanks: '🙏',
    ok: '👍',
    love: '❤️',
};

function addEmojis(text) {
    for (const word in emojiMap) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, `${word} ${emojiMap[word]}`);
    }
    return text;
}

function appendMessage(sender, message) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message", sender === "You" ? "user" : "bot", "fade-in");
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatbox.appendChild(msgDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chat-message bot typing fade-in";
    typing.id = "typing";
    typing.innerText = "Bot is typing...";
    chatbox.appendChild(typing);
    chatbox.scrollTop = chatbox.scrollHeight;
}
window.onload = function() {
    const chatbox = document.getElementById("chatbox");
    const welcomeMessage = document.createElement("div");
    welcomeMessage.className = "chat-message bot";
    welcomeMessage.innerText = "Hello, I am your mental health assistant. How can I help you?";
    chatbox.appendChild(welcomeMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
};

function removeTyping() {
    const typing = document.getElementById("typing");
    if (typing) typing.remove();
}

function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;

    appendMessage("You", msg);
    userInput.value = "";

    showTyping();

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msg })
    })
    .then(res => res.json())
    .then(data => {
        removeTyping();
        appendMessage("Bot", addEmojis(data.response));
    })
    .catch(() => {
        removeTyping();
        appendMessage("Bot", "❌ Oops! Something went wrong.");
    });
}

// Send on click or enter
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});
