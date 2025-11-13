// auth-guard.js
// Este script deve ser incluído em TODAS as páginas internas que exigem login.

// Importa a autenticação e a função para observar o estado do usuário
import { auth } from './firebase-config.js'; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// O observador do estado de autenticação roda assim que a página carrega.
onAuthStateChanged(auth, (user) => {
    // Se 'user' for NULO, significa que o usuário NÃO está logado.
    if (!user) {
        console.warn("Acesso negado. Redirecionando para a página de login.");
        
        // Redireciona o usuário para a página de login (index.html)
        // O 'window.location.origin' garante que funciona em qualquer ambiente (local ou GitHub Pages)
        alert('Seu acesso expirou ou você não está logado. Redirecionando para a tela de Login.');
        window.location.replace('../index.html');
    } else {
        // Se 'user' NÃO for nulo, o usuário está logado.
        console.log(`Usuário logado: ${user.email} (UID: ${user.uid})`);
        // Aqui você pode carregar dados do usuário se precisar
    }
});
