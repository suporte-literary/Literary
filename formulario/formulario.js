// formulario/formulario.js

// Importar as ferramentas necessárias
import { auth, db } from '../firebase-config.js'; 
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('register-form');
    
    // ALTERAÇÃO 1: Agora pega o E-MAIL do novo ID 'email'
    const emailInput = document.getElementById('email'); 
    
    // ALTERAÇÃO 2: Pega o NOME DE USUÁRIO do ID 'username'
    const usernameInput = document.getElementById('username');
    
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    // Removido o 'fullNameInput'
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const username = usernameInput.value.trim(); // Novo: Agora coletamos o username
        
        // Verificação se os campos estão preenchidos
        if (!email || !password || !username) {
            alert('❌ Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPasswordInput.value.trim()) {
            alert('❌ As senhas não coincidem!');
            return;
        }

        try {
            // 1. Criar o Usuário na Autenticação do Firebase (usa email e senha)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Salvar dados adicionais (Perfil) no Firestore usando o UID (ID Único)
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email, // Usando o e-mail fornecido
                username: username, // Usando o username fornecido
                bio: 'Esta é a descrição padrão do seu perfil no Literary.',
                createdAt: new Date()
            });

            alert('✅ Cadastro efetuado com sucesso! Redirecionando para o Login.');
            window.location.href = '../index.html'; 

        } catch (error) {
            console.error("Erro de Cadastro:", error.code, error.message);
            let errorMessage = "Ocorreu um erro ao registrar. Tente novamente.";
            
            // Tratamento de erros de autenticação
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = '📧 Este e-mail já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '🔒 A senha deve ter pelo menos 6 caracteres.';
            }
            
            alert(errorMessage);
        }
    });
});
