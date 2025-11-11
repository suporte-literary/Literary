const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chat-messages');
const chatList = document.getElementById('chat-list');
const chatWith = document.getElementById('chat-with');
const chatSidebar = document.getElementById('chat-sidebar');

// Botões de toggle para responsividade
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');


// Dados de histórico de conversas (Mockup)
const conversationHistory = {
    "Agnês Vitória": [
        { type: 'received', text: 'Oi! Tudo bem? 🌸', time: '10:21' },
        { type: 'sent', text: 'Oi, tudo sim! E você?', time: '10:22' }
    ],
    "João Lucas": [
        { type: 'received', text: 'Olá! Li sua nova obra, adorei!', time: 'Ontem' },
        { type: 'sent', text: 'Que bom que gostou! Qual parte te chamou mais atenção?', time: 'Ontem' }
    ],
    "Helena Costa": [
        { type: 'received', text: 'Temos um projeto de co-autoria, quer discutir?', time: '15:30' }
    ]
};

// --- Funções Principais do Chat ---

function renderMessages(user) {
    chatMessages.innerHTML = '';
    const messages = conversationHistory[user] || [];
    
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.classList.add('message', msg.type);
        div.innerHTML = `<p>${msg.text}</p><span>${msg.time}</span>`;
        chatMessages.appendChild(div);
    });
    // Rola para o final da conversa
    chatMessages.scrollTop = chatMessages.scrollHeight; 
}


function sendMessage() {
    const text = messageInput.value.trim();
    if (text === '') return;

    const currentTime = new Date().toLocaleTimeString().slice(0, 5);
    const currentUser = chatWith.textContent;

    // 1. Adiciona a mensagem ao DOM
    const msg = document.createElement('div');
    msg.classList.add('message', 'sent');
    msg.innerHTML = `<p>${text}</p><span>${currentTime}</span>`;
    chatMessages.appendChild(msg);

    // 2. Salva a mensagem no histórico (Mockup)
    conversationHistory[currentUser].push({ type: 'sent', text: text, time: currentTime });

    // 3. Rola e limpa o input
    chatMessages.scrollTop = chatMessages.scrollHeight;
    messageInput.value = '';

    // 4. Resposta automática (Mockup)
    setTimeout(() => {
        const replyText = 'Interessante! Me conte mais ✨';
        const replyTime = new Date().toLocaleTimeString().slice(0, 5);
        
        const reply = document.createElement('div');
        reply.classList.add('message', 'received');
        reply.innerHTML = `<p>${replyText}</p><span>${replyTime}</span>`;
        chatMessages.appendChild(reply);

        conversationHistory[currentUser].push({ type: 'received', text: replyText, time: replyTime });
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1200);
}


// NOVO: Função para trocar de conversa
function switchChat(userElement) {
    // 1. Atualiza o estado visual da sidebar
    document.querySelectorAll('.chat-item').forEach(li => li.classList.remove('active'));
    userElement.classList.add('active');

    // 2. Obtém o nome do novo usuário
    const newUserName = userElement.getAttribute('data-user');
    chatWith.textContent = newUserName;

    // 3. Renderiza a nova conversa
    renderMessages(newUserName);
    
    // 4. Fecha a sidebar no mobile
    if (window.innerWidth <= 900) {
        chatSidebar.classList.remove('active');
    }
}

// --- LÓGICA UNIVERSAL DE TEMA ---
(function() {
    const THEME_KEY = 'literary_theme_preference';
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    // Se a preferência for 'light', aplique imediatamente antes do carregamento completo do DOM
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
    }
})();
// --- FIM LÓGICA UNIVERSAL DE TEMA ---

document.addEventListener('DOMContentLoaded', () => {
    // ... O resto do seu código JS original para esta página
});

// --- Event Listeners ---

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Event listener para troca de conversa
chatList.addEventListener('click', (e) => {
    const chatItem = e.target.closest('.chat-item');
    if (chatItem) {
        switchChat(chatItem);
    }
});


// --- Responsividade (Sidebar Toggle) ---

openSidebarBtn.addEventListener('click', () => {
    chatSidebar.classList.add('active');
});

closeSidebarBtn.addEventListener('click', () => {
    chatSidebar.classList.remove('active');
});

// --- Inicialização ---

// Renderiza a conversa ativa por padrão
const defaultUser = chatWith.textContent;
renderMessages(defaultUser);