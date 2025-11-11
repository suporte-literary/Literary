document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username'); // Alterado
    const passwordInput = document.getElementById('password');
    
    // --- LÓGICA DE LOGIN SIMULADA ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === '' || password === '') {
            alert('Por favor, preencha todos os campos (Nome de Usuário e Senha).');
            return;
        }

        // Simulação de verificação de credenciais. Use um nome de usuário de teste.
        
        if (username === 'test_user' && password === '123456') {
            // Sucesso
            alert('Login bem-sucedido! Redirecionando para a Home...');
            
            // Simulação de sessão iniciada
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // Redireciona para a página principal
            window.location.href = '/home/home.html'; 

        } else {
             // Simulação de erro
            alert('Nome de Usuário ou Senha incorretos. Tente novamente.');
        }
    });
});