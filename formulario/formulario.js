document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const fullNameInput = document.getElementById('full-name');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    const usernameStatus = document.getElementById('username-status');
    const passwordMatchStatus = document.getElementById('password-match-status');
    
    // --- SIMULAÇÃO DE NOMES DE USUÁRIO JÁ CADASTRADOS ---
    const registeredUsernames = ['admin', 'test_user', 'literary_fan'];

    // ==========================================================
    // 1. VALIDAÇÃO DE NOME DE USUÁRIO (UNICIDADE)
    // ==========================================================
    usernameInput.addEventListener('input', () => {
        const username = usernameInput.value.trim().toLowerCase();

        // Limpa a mensagem se o campo estiver vazio
        if (username.length === 0) {
            usernameStatus.textContent = '';
            usernameStatus.className = 'validation-message';
            return;
        }

        // Simulação: Verifica se o nome de usuário já existe
        if (registeredUsernames.includes(username)) {
            usernameStatus.textContent = 'Este nome de usuário já está em uso.';
            usernameStatus.className = 'validation-message error';
        } else if (username.length < 4) {
             usernameStatus.textContent = 'Nome de usuário deve ter pelo menos 4 caracteres.';
            usernameStatus.className = 'validation-message error';
        } 
        else {
            usernameStatus.textContent = 'Nome de usuário disponível!';
            usernameStatus.className = 'validation-message success';
        }
    });


    // ==========================================================
    // 2. VALIDAÇÃO DE SENHAS CORRESPONDENTES
    // ==========================================================
    const checkPasswordMatch = () => {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (confirmPassword.length === 0) {
            passwordMatchStatus.textContent = '';
            passwordMatchStatus.className = 'validation-message';
        } else if (password === confirmPassword) {
            passwordMatchStatus.textContent = 'As senhas coincidem.';
            passwordMatchStatus.className = 'validation-message success';
        } else {
            passwordMatchStatus.textContent = 'As senhas não coincidem!';
            passwordMatchStatus.className = 'validation-message error';
        }
    };

    passwordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);


    // ==========================================================
    // 3. SUBMISSÃO DO FORMULÁRIO
    // ==========================================================
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullName = fullNameInput.value.trim();
        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Verifica as validações finais antes de prosseguir
        const isUsernameValid = !registeredUsernames.includes(username) && username.length >= 4;
        const isPasswordMatch = password === confirmPassword && password.length > 0;

        if (fullName === '' || username === '' || password === '' || confirmPassword === '') {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!isUsernameValid) {
            alert('Por favor, escolha um nome de usuário válido e exclusivo.');
            return;
        }

        if (!isPasswordMatch) {
            alert('As senhas devem coincidir e não podem ser vazias.');
            return;
        }

        // Se todas as validações passarem:
        
        // Simulação de registro bem-sucedido:
        // Aqui você faria uma chamada API (fetch) para o backend para criar o usuário.
        
        alert(`Conta criada com sucesso para ${fullName}! Agora você pode fazer login.`);
        
        // Redireciona para a tela de login
        window.location.href = '/login/login.html'; 
    });
});