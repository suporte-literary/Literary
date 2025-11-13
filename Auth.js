// Auth.js

const USER_DATA_KEY = 'user_data';
const REDIRECT_URL = 'index.html'; // URL para onde redirecionar se não estiver logado

/**
 * 🔐 Verifica o estado de login e redireciona se o usuário não estiver logado.
 * @param {boolean} shouldRedirect Indica se deve redirecionar (padrão: true, usado em páginas protegidas).
 * @returns {object|null} Retorna os dados do usuário ou null.
 */
function checkAuth(shouldRedirect = true) {
    try {
        const userDataJson = localStorage.getItem(USER_DATA_KEY);
        if (userDataJson) {
            const userData = JSON.parse(userDataJson);
            
            if (userData && userData.isLoggedIn) {
                // Usuário está logado
                return userData;
            }
        }
    } catch (e) {
        console.error("Erro ao verificar autenticação:", e);
    }

    // Se a autenticação falhar e o redirecionamento for necessário
    if (shouldRedirect) {
        // Redireciona para a página de login
        window.location.href = REDIRECT_URL;
    }
    return null;
}

/**
 * 🚪 Realiza o logout do usuário, limpando os dados.
 */
function logout() {
    localStorage.removeItem(USER_DATA_KEY);
    // Opcional: Limpar dados de sessão (fallback username)
    sessionStorage.removeItem('fallback_username'); 
    
    alert("Logout realizado com sucesso!");
    window.location.href = REDIRECT_URL;
}

// Exporta as funções para serem usadas em outros arquivos JS (se você estiver usando módulos ES6)
// Se não estiver usando módulos, as funções serão globais e acessíveis diretamente.
// Exemplo de uso:
// window.addEventListener('load', checkAuth); 

// document.getElementById('logoutBtn').addEventListener('click', logout);

