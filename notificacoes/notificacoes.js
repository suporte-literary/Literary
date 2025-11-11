// --- LÓGICA UNIVERSAL DE TEMA ---
(function() {
    const THEME_KEY = 'literary_theme_preference';
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
    }
})();
// --- FIM LÓGICA UNIVERSAL DE TEMA ---


document.addEventListener('DOMContentLoaded', () => {
    const notificationList = document.getElementById('notification-list');
    const noNotificationsMessage = document.getElementById('no-notifications-message');
    const addNotificationBtn = document.getElementById('add-notification-btn');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    const NOTIFICATIONS_KEY = 'literary_notifications';

    // --- DADOS INICIAIS DE SIMULAÇÃO ---
    let notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY)) || [
        { 
            id: 1, 
            type: 'update', 
            text: 'A obra "A Lenda de Kael" foi atualizada com um novo Capítulo! Leia agora.', 
            time: '5 minutos atrás', 
            read: false, 
            icon: 'fas fa-book-reader' 
        },
        { 
            id: 2, 
            type: 'follow', 
            text: 'O autor @fantastico_escritor começou a te seguir.', 
            time: '1 hora atrás', 
            read: false, 
            icon: 'fas fa-user-plus' 
        },
        { 
            id: 3, 
            type: 'mention', 
            text: 'Você foi mencionado em um comentário sobre "O Despertar".', 
            time: '1 dia atrás', 
            read: true, 
            icon: 'fas fa-at' 
        },
    ];

    /**
     * Renderiza o HTML para uma única notificação.
     * @param {object} notif Objeto de notificação.
     */
    function createNotificationElement(notif) {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.read ? '' : 'unread'}`;
        item.dataset.id = notif.id;

        item.innerHTML = `
            <i class="${notif.icon} notification-icon"></i>
            <div class="notification-content">
                <p class="notification-text">${notif.text}</p>
                <span class="notification-time">${notif.time}</span>
            </div>
        `;
        
        // Adiciona evento para marcar como lida ao clicar
        item.addEventListener('click', () => markAsRead(notif.id));

        return item;
    }

    /**
     * Atualiza a lista de notificações na tela.
     */
    function renderNotifications() {
        notificationList.innerHTML = ''; // Limpa a lista atual

        if (notifications.length === 0) {
            noNotificationsMessage.style.display = 'block';
            notificationList.appendChild(noNotificationsMessage);
            markAllReadBtn.style.display = 'none';
            return;
        }

        noNotificationsMessage.style.display = 'none';
        
        // Renderiza as notificações da mais recente para a mais antiga
        notifications.sort((a, b) => b.id - a.id).forEach(notif => {
            notificationList.appendChild(createNotificationElement(notif));
        });

        markAllReadBtn.style.display = 'block';
    }

    /**
     * Marca uma notificação específica como lida.
     * @param {number} id O ID da notificação.
     */
    function markAsRead(id) {
        const notifIndex = notifications.findIndex(n => n.id === id);
        if (notifIndex > -1 && !notifications[notifIndex].read) {
            notifications[notifIndex].read = true;
            localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
            
            // Atualiza o elemento no DOM sem recarregar a lista toda
            const element = document.querySelector(`.notification-item[data-id="${id}"]`);
            if (element) {
                element.classList.remove('unread');
            }
        }
    }

    /**
     * Marca todas as notificações como lidas.
     */
    markAllReadBtn.addEventListener('click', () => {
        notifications.forEach(n => n.read = true);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        renderNotifications();
    });

    /**
     * Adiciona uma nova notificação de Obra Atualizada (Simulação).
     */
    addNotificationBtn.addEventListener('click', () => {
        const obraAtualizada = {
            id: Date.now(), // Usa timestamp como ID único e para ordenação
            type: 'update',
            text: `A obra "O Segredo da Floresta" acaba de receber uma grande atualização!`,
            time: 'Agora mesmo',
            read: false,
            icon: 'fas fa-magic',
        };

        notifications.push(obraAtualizada);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        renderNotifications();
        
        // Pequena animação/feedback visual para o botão
        addNotificationBtn.classList.add('btn-primary-flash');
        setTimeout(() => addNotificationBtn.classList.remove('btn-primary-flash'), 500);
    });

    // Inicializa a renderização
    renderNotifications();
});