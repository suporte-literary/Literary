// perfil/perfil.js
// Importa as ferramentas necessárias
import { auth, db } from '../firebase-config.js'; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML que serão preenchidos
    const displayNameElement = document.getElementById('user-display-name');
    const usernameElement = document.getElementById('user-username');
    const bioElement = document.getElementById('user-bio');
    // Adicione referências para o avatar se houver um elemento específico

    // 1. Monitorar o estado de autenticação para ter acesso ao usuário logado
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usuário logado:
            const userUID = user.uid;
            
            try {
                // 2. Buscar o documento de perfil no Firestore (coleção 'users')
                const docRef = doc(db, "users", userUID);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // 3. Documento encontrado: preencher o HTML
                    const userData = docSnap.data();
                    
                    displayNameElement.textContent = userData.fullName || 'Nome Não Definido';
                    usernameElement.textContent = `@${userData.username}` || '@usuario';
                    bioElement.textContent = userData.bio || 'Biografia não preenchida.';
                    
                    console.log("Dados do perfil carregados:", userData);

                } else {
                    // O documento de perfil não foi salvo corretamente no cadastro
                    console.error("Erro: Não foi possível encontrar os dados do perfil no Firestore.");
                    displayNameElement.textContent = user.email || 'Usuário Desconhecido';
                    usernameElement.textContent = '@erro_perfil';
                }
            } catch (error) {
                console.error("Erro ao carregar dados do Firestore:", error);
                alert("Erro ao carregar o perfil. Tente novamente.");
            }
        } 
        // Se o usuário não estiver logado, o 'auth-guard.js' já cuida do redirecionamento
    });
});
