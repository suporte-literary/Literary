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
    
    const THEME_KEY = 'literary_theme_preference';
    const PROFILE_KEY = 'literary_user_profile';
    const AVATAR_KEY = 'literary_user_avatar_url'; 

    // Elementos de Tema e Conta
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // Elementos do Formulário de Perfil
    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const usernameInput = document.getElementById('username');
    const descriptionTextarea = document.getElementById('description');
    
    // Elementos de Avatar
    const profileAvatarPreview = document.getElementById('profile-avatar-preview');
    const avatarFileInput = document.getElementById('avatar-file-input');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');


    // --- DADOS INICIAIS ---
    const defaultProfile = {
        name: 'Literary User',
        username: 'usuario_literary',
        description: 'Esta é a descrição padrão do seu perfil na Literary. Você pode alterá-la aqui.'
    };
    // Use um caminho para uma imagem de ícone padrão ou deixe o navegador usar um placeholder
    const defaultAvatarUrl = 'https://via.placeholder.com/100/64b2f1/FFFFFF?text=L';


    // --- FUNÇÕES DE AVATAR ---
    
    function loadAvatar() {
        const savedAvatar = localStorage.getItem(AVATAR_KEY);
        profileAvatarPreview.src = savedAvatar || defaultAvatarUrl;
    }

    uploadAvatarBtn.addEventListener('click', () => {
        avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const base64Image = e.target.result;
                
                profileAvatarPreview.src = base64Image;
                localStorage.setItem(AVATAR_KEY, base64Image);
                
                alert('Foto de perfil carregada e salva com sucesso!');
            };
            
            reader.readAsDataURL(file);
        }
    });

    // --- FUNÇÕES DE PERFIL ---

    function loadProfileData() {
        const storedProfile = localStorage.getItem(PROFILE_KEY);
        const currentProfile = storedProfile ? JSON.parse(storedProfile) : defaultProfile;

        profileNameInput.value = currentProfile.name;
        usernameInput.value = currentProfile.username;
        descriptionTextarea.value = currentProfile.description;
        
        loadAvatar(); 
    }

    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newProfile = {
            name: profileNameInput.value,
            // Simula sanitização para username (apenas letras, números e underscore)
            username: usernameInput.value.toLowerCase().trim().replace(/[^a-z0-9_]/g, ''), 
            description: descriptionTextarea.value,
        };

        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));

        alert('Perfil atualizado com sucesso! Novo Nome de Usuário: @' + newProfile.username);

        loadProfileData();
    });

    // --- FUNÇÕES DE TEMA ---

    function applyTheme(isLight) {
        if (isLight) {
            body.classList.add('theme-light');
            body.classList.remove('theme-dark');
            localStorage.setItem(THEME_KEY, 'light');
        } else {
            body.classList.add('theme-dark');
            body.classList.remove('theme-light');
            localStorage.setItem(THEME_KEY, 'dark');
        }
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        const isLight = savedTheme === 'light';
        applyTheme(isLight);
        themeToggle.checked = isLight;
    }

    themeToggle.addEventListener('change', (e) => {
        applyTheme(e.target.checked);
    });

    // --- FUNÇÕES DE AÇÃO DE CONTA ---

    logoutBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja fazer logout?')) {
            sessionStorage.clear();
            alert('Logout realizado com sucesso!');
            window.location.href = '/login/login.html'; // Redireciona para a tela de login
        }
    });

    deleteAccountBtn.addEventListener('click', () => {
        const confirmation = prompt("ATENÇÃO: A exclusão da conta é permanente. Digite 'EXCLUIR MINHA CONTA' para confirmar:");
        
        if (confirmation === 'EXCLUIR MINHA CONTA') {
            localStorage.clear(); 
            sessionStorage.clear();
            localStorage.setItem(THEME_KEY, 'dark'); // Mantém o tema para o próximo usuário
            alert('Conta excluída permanentemente. Sentiremos sua falta.');
            window.location.href = '/home/home.html'; 
        } else if (confirmation !== null) {
            alert('Confirmação incorreta. A conta não foi excluída.');
        }
    });

    // --- INICIALIZAÇÃO ---
    initializeTheme();
    loadProfileData(); 
});