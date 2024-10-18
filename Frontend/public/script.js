document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const micButton = document.getElementById('mic-button');
    const chatWindow = document.getElementById('chat-window');

    function loadChatHistory() {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        chatHistory.forEach(({ sender, message }) => {
            sender === 'user' ? displayUserMessage(message) : displayBotMessage(message);
        });
    }

    function saveMessageToHistory(sender, message) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        chatHistory.push({ sender, message });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    function displayUserMessage(message) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('user-message');
        userMessage.innerText = message;
        chatWindow.appendChild(userMessage);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function displayBotMessage(message) {
        const botMessage = document.createElement('div');
        botMessage.classList.add('bot-message');
        botMessage.innerText = message;
        chatWindow.appendChild(botMessage);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function quitChat() {
        localStorage.removeItem('chatHistory'); 
        displayBotMessage('Chat session ended. Please refresh the page to start again.');
        disableInput(); 
    }

    function disableInput() {
        chatInput.disabled = true;
        micButton.disabled = true;
    }

    chatInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter' && chatInput.value.trim() !== '') {
            const userMessage = chatInput.value.trim();
            if (userMessage.toLowerCase() === 'quit') {
                quitChat();
                return;
            }
            displayUserMessage(userMessage);
            saveMessageToHistory('user', userMessage); 
            chatInput.value = '';
            const botResponse = await getBotResponse(userMessage);
            displayBotMessage(botResponse);
            saveMessageToHistory('bot', botResponse); 
        }
    });

    micButton.addEventListener('click', () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = async (event) => {
            const speechToText = event.results[0][0].transcript;
            if (speechToText.toLowerCase() === 'quit') {
                quitChat();
                return;
            }
            displayUserMessage(speechToText);
            saveMessageToHistory('user', speechToText); 
            const botResponse = await getBotResponse(speechToText);
            displayBotMessage(botResponse);
            saveMessageToHistory('bot', botResponse); 
        };

        recognition.onerror = (event) => {
            alert('Error recognizing speech: ' + event.error);
        };
    });

    async function getBotResponse(message) {
        try {
            const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: 'user', message: message }),
            });

            const data = await response.json();
            return data.length > 0 ? data[0].text : "Sorry, I couldn't understand.";
        } catch (error) {
            console.error('Error fetching response from Rasa:', error);
            return 'Error communicating with the bot.';
        }
    }


    loadChatHistory();
});
