// --- LÓGICA UNIVERSAL DE TEMA (Deve ser mantida em todos os JS) ---
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
    
    const PROFILE_KEY = 'literary_user_profile';
    const AVATAR_KEY = 'literary_user_avatar_url'; 

    // Elementos do DOM
    const profileNameDisplay = document.getElementById('profile-name-display');
    const usernameDisplay = document.getElementById('username-display');
    const descriptionDisplay = document.getElementById('description-display');
    const profileAvatarDisplay = document.getElementById('profile-avatar-display'); 

    // --- DADOS INICIAIS PADRÃO ---
    const defaultProfile = {
        name: 'Literary User',
        username: 'usuario_literary',
        description: 'Esta é a descrição padrão do seu perfil na Literary. Você pode alterá-la na tela de Configurações.'
    };
    // Placeholder com tamanho do avatar de perfil
    const defaultAvatarUrl = 'https://via.placeholder.com/150/64b2f1/FFFFFF?text=L'; 

    /**
     * Carrega e renderiza todos os dados do perfil (incluindo avatar).
     */
    function renderProfileData() {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const currentProfile = storedProfile ? JSON.parse(storedProfile) : defaultProfile;
        
        // 1. Dados de texto
        profileNameDisplay.textContent = currentProfile.name;
        usernameDisplay.textContent = `@${currentProfile.username}`;
        descriptionDisplay.textContent = currentProfile.description;
        
        // 2. Foto de Perfil (carrega do localStorage, se existir)
        const savedAvatar = localStorage.getItem(AVATAR_KEY);
        profileAvatarDisplay.src = savedAvatar || defaultAvatarUrl; 
    }

    // Inicializa a renderização dos dados
    renderProfileData();
});