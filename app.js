const chatBody = document.getElementById('chatBody');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const languageSelect = document.getElementById('languageSelect');

const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;

let finalTranscript = '';
let openAIResponse = '';
let conversationStarted = false;

// Configurar OpenAI API
const openAIApiKey = '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';

// Función para obtener la respuesta de OpenAI
async function getOpenAIResponse(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// Función para hablar
function speak(text, language) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
}

// Función para escuchar
function listen() {
    recognition.lang = languageSelect.value;
    recognition.start();
}

recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    if (finalTranscript) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('user-message');
        userMessage.textContent = finalTranscript;
        chatBody.appendChild(userMessage);

        getOpenAIResponse(finalTranscript).then(response => {
            openAIResponse = response;
            const chatbotMessage = document.createElement('div');
            chatbotMessage.classList.add('chatbot-message');
            chatbotMessage.textContent = openAIResponse;
            chatBody.appendChild(chatbotMessage);
            speak(openAIResponse, languageSelect.value);
        });

        finalTranscript = '';
    }
};

recognition.onend = () => {
    recognition.start();
};

sendBtn.addEventListener('click', () => {
    const userMessage = document.createElement('div');
    userMessage.classList.add('user-message');
    userMessage.textContent = userInput.value;
    chatBody.appendChild(userMessage);
    userInput.value = '';

    getOpenAIResponse(userMessage.textContent).then(response => {
        openAIResponse = response;
        const chatbotMessage = document.createElement('div');
        chatbotMessage.classList.add('chatbot-message');
        chatbotMessage.textContent = openAIResponse;
        chatBody.appendChild(chatbotMessage);
        speak(openAIResponse, languageSelect.value);
    });
});

voiceBtn.addEventListener('click', () => {
    listen();
});

languageSelect.addEventListener('change', () => {
    recognition.lang = languageSelect.value;
});

// Función para iniciar la conversación
function startConversation() {
    conversationStarted = true;
    speak('Hola, ¿en qué puedo ayudarte?', languageSelect.value);
}

// Evento para iniciar la conversación
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !conversationStarted) {
        if (userInput.value.toLowerCase() === 'si') {
            startConversation();
        } else {
            const userMessage = document.createElement('div');
            userMessage.classList.add('user-message');
            userMessage.textContent = userInput.value;
            chatBody.appendChild(userMessage);
            userInput.value = '';

            getOpenAIResponse(userMessage.textContent).then(response => {
                openAIResponse = response;
                const chatbotMessage = document.createElement('div');
                chatbotMessage.classList.add('chatbot-message');
                chatbotMessage.textContent = openAIResponse;
                chatBody.appendChild(chatbotMessage);
                speak(openAIResponse, languageSelect.value);
            });
        }
    }
});
