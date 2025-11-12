// script.js (LÓGICA DE LOGIN COM FIREBASE)

// Imports necessários para o Login
// Ajuste o caminho se o firebase-config.js não estiver na raiz do projeto (./)
import { auth } from './firebase-config.js'; 
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    // ALTERAÇÃO: Agora buscamos o ID 'email' no HTML
    const emailInput = document.getElementById('email'); 
    const passwordInput = document.getElementById('password');
    
    // --- LÓGICA DE LOGIN REAL COM FIREBASE ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (email === '' || password === '') {
            alert('❌ Por favor, preencha todos os campos (E-mail e Senha).');
            return;
        }

        try {
            // Chama a função de login do Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Sucesso
            alert('✅ Login bem-sucedido! Redirecionando para a Home...');
            sessionStorage.setItem('isLoggedIn', 'true');
            
            // Redireciona para a página principal (ajuste o caminho se necessário)
            window.location.href = './home/home.html'; 

        } catch (error) {
            console.error("Erro de Login:", error.code, error.message);
            
            let errorMessage = "E-mail ou senha incorretos. Tente novamente.";
            
            // Tratamento de erros comuns do Firebase
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = '🔑 E-mail ou Senha inválidos. Verifique suas credenciais.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            }
            
            alert(errorMessage);
        }
    });
});
