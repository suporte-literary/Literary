// formulario/formulario.js
// Importar as ferramentas necessárias
// O '..' é porque o firebase-config.js está na raiz, e este arquivo está em 'formulario/'
import { auth, db } from '../firebase-config.js'; 
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Certifique-se de que os IDs dos inputs correspondem aos IDs no seu formulario.html
    const registerForm = document.getElementById('register-form');
    
    // Assumimos que o campo 'username' está sendo usado para o EMAIL, e 'full-name' para o nome de exibição.
    const emailInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const fullNameInput = document.getElementById('full-name');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const fullName = fullNameInput.value.trim();
        
        if (!email || !password || !fullName) {
            alert('❌ Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (password !== confirmPasswordInput.value.trim()) {
            alert('❌ As senhas não coincidem!');
            return;
        }

        try {
            // 1. Criar o Usuário na Autenticação do Firebase (email e senha)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Salvar dados adicionais (Perfil) no Firestore usando o UID (ID Único) do Firebase
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                fullName: fullName,
                // Define um username inicial simples para exibição (ex: joao@literary.com -> joao)
                username: email.split('@')[0], 
                bio: 'Esta é a descrição padrão do seu perfil no Literary.',
                createdAt: new Date()
            });

            alert('✅ Cadastro efetuado com sucesso! Redirecionando para o Login.');
            // Redireciona para a tela de Login (presumivelmente na raiz, como index.html)
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
