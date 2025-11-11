document.addEventListener('DOMContentLoaded', () => {
    
    const POLICY_KEY = 'literary_privacy_policy';
    const ADMIN_PASSWORD = 'Admin2025';

    // Elementos da página
    const policyDisplay = document.getElementById('policy-display');
    const policyTextarea = document.getElementById('policy-textarea');
    const policyEditor = document.getElementById('policy-editor');
    const savePolicyBtn = document.getElementById('save-policy-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Elementos de autenticação
    const adminAccessSection = document.getElementById('admin-access-section');
    const showAdminFormBtn = document.getElementById('show-admin-form-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginMessage = document.getElementById('login-message');

    // --- CONTEÚDO PADRÃO ---
    const defaultPolicy = `
        <h2>1. Introdução</h2>
        <p>Bem-vindo à Política de Privacidade da Literary. Sua privacidade é de extrema importância para nós. Este documento explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais.</p>

        <h2>2. Informações Coletadas</h2>
        <p>Coletamos informações que você nos fornece diretamente, como nome de usuário, e-mail e conteúdo de suas obras publicadas.</p>

        <h2>3. Uso das Informações</h2>
        <p>Utilizamos suas informações para fornecer, manter, proteger e melhorar nossos serviços, desenvolver novos recursos e proteger a Literary e nossos usuários.</p>

        <h2>4. Direitos do Usuário</h2>
        <p>Você tem o direito de acessar, corrigir e excluir suas informações pessoais, sujeitas às leis locais e aos termos de serviço da plataforma.</p>
        
        <p>Última atualização: [Data Atualizada Automaticamente]</p>
    `;

    // --- LÓGICA UNIVERSAL DE TEMA ---
(function() {
    const THEME_KEY = 'literary_theme_preference';
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    // Se a preferência for 'light', aplique imediatamente antes do carregamento completo do DOM
    if (savedTheme === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
    }
})();
// --- FIM LÓGICA UNIVERSAL DE TEMA ---

document.addEventListener('DOMContentLoaded', () => {
    // ... O resto do seu código JS original para esta página
});

    /**
     * Carrega o conteúdo da política (do localStorage ou padrão).
     */
    function loadPolicy() {
        // Tenta buscar o conteúdo salvo
        let policyContent = localStorage.getItem(POLICY_KEY);

        if (!policyContent) {
            // Se não houver, usa o conteúdo padrão e salva no localStorage
            policyContent = defaultPolicy.replace('[Data Atualizada Automaticamente]', new Date().toLocaleDateString('pt-BR'));
            localStorage.setItem(POLICY_KEY, policyContent);
        }

        // Exibe o conteúdo (HTML)
        policyDisplay.innerHTML = policyContent;
        // Prepara o editor (texto simples, sem as tags HTML)
        policyTextarea.value = policyContent.replace(/<[^>]*>/g, '').trim(); 
    }
    
    /**
     * Exibe o formulário de login e esconde o botão de acesso.
     */
    showAdminFormBtn.addEventListener('click', () => {
        adminAccessSection.classList.add('hidden');
        adminLoginForm.classList.remove('hidden');
        adminPasswordInput.focus();
    });

    /**
     * Tenta realizar o login do administrador.
     */
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const enteredPassword = adminPasswordInput.value;
        loginMessage.textContent = '';

        if (enteredPassword === ADMIN_PASSWORD) {
            enterAdminMode();
        } else {
            loginMessage.textContent = '❌ Senha incorreta. Acesso negado.';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    });

    /**
     * Habilita o modo de edição.
     */
    function enterAdminMode() {
        // Esconde o formulário de login
        adminLoginForm.classList.add('hidden');
        adminAccessSection.classList.add('hidden');
        
        // Exibe o editor e esconde a visualização
        policyDisplay.classList.add('hidden');
        policyEditor.classList.remove('hidden');

        // Preenche o textarea com o conteúdo da política
        policyTextarea.value = localStorage.getItem(POLICY_KEY) || defaultPolicy;
        policyTextarea.focus();
        
        // Define uma flag de sessão para manter o modo Admin (opcional)
        sessionStorage.setItem('is_admin_logged_in', 'true');
        alert('✅ Login de Administrador realizado com sucesso. Você pode editar o texto.');
    }
    
    /**
     * Sai do modo de edição e volta à visualização.
     */
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('is_admin_logged_in');
        policyEditor.classList.add('hidden');
        policyDisplay.classList.remove('hidden');
        adminAccessSection.classList.remove('hidden');
        adminLoginForm.classList.add('hidden'); // Garante que o formulário de login seja escondido
        adminPasswordInput.value = '';
        loginMessage.textContent = '';
        
        loadPolicy(); // Recarrega a política para garantir que a versão mais recente seja exibida
        alert('🔒 Sessão de Administrador encerrada.');
    });

    /**
     * Salva o conteúdo editado no localStorage.
     */
    savePolicyBtn.addEventListener('click', () => {
        let newContent = policyTextarea.value;
        
        // Substitui a tag de data pela data atualizada para fins de rastreamento
        const today = new Date().toLocaleDateString('pt-BR');
        newContent = newContent.replace(/Última atualização: .*$/, `Última atualização: ${today}`);
        
        // Simplesmente salva o HTML gerado pelo editor (idealmente, isso seria sanitizado)
        localStorage.setItem(POLICY_KEY, newContent);
        
        alert('💾 Política de Privacidade salva e atualizada com sucesso!');
        loadPolicy(); // Recarrega para mostrar a versão atualizada
    });
    
    // --- INICIALIZAÇÃO ---
    
    // Verifica se o admin está logado na sessão (útil em recarregamento)
    if (sessionStorage.getItem('is_admin_logged_in') === 'true') {
        enterAdminMode();
    } else {
        // Carrega o conteúdo inicial da política para todos os usuários
        loadPolicy(); 
    }
});