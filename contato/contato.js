// --- LÓGICA UNIVERSAL DE TEMA ---
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
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');
    
    // --- ENDEREÇO DE EMAIL DE DESTINO ---
    const DESTINATION_EMAIL = 'suporte.literary@gmail.com'; 
    // --- SUBSTITUA PELA URL DO SEU BACKEND/API DE EMAIL ---
    const API_ENDPOINT = 'SUA_URL_DO_SERVIDOR_DE_EMAIL_AQUI'; 

    
    // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO DE CONTATO (SIMULADA) ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const name = nameInput.value.trim() || 'Usuário Não Identificado';
        const userEmail = emailInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = messageInput.value.trim();

        // Validação básica de campos obrigatórios
        if (userEmail === '' || subject === '' || message === '') {
            alert('Por favor, preencha seu E-mail, Assunto e Mensagem.');
            return;
        }
        
        // --- PREPARAÇÃO DOS DADOS PARA ENVIO AO SERVIDOR ---
        const emailData = {
            // O e-mail para onde a mensagem DEVE ser enviada.
            to: DESTINATION_EMAIL, 
            // O e-mail do remetente (usuário que preencheu o formulário).
            replyTo: userEmail, 
            // O assunto que aparecerá no e-mail.
            subject: `[Contato Literary] ${subject} (de ${name})`, 
            // O corpo da mensagem.
            body: `
                Mensagem enviada por: ${name}
                E-mail do Usuário: ${userEmail}
                -------------------------------------
                ${message}
            `,
            // Dados adicionais que podem ser úteis para o backend
            name: name,
            originalSubject: subject
        };


        // =======================================================================
        // SIMULAÇÃO DE CHAMADA AO SERVIDOR (ONDE O ENVIO REAL OCORRERIA)
        // =======================================================================
        
        // Em um ambiente real, você faria uma requisição 'fetch' para a API.
        // O servidor receberia 'emailData' e usaria a chave 'to' (suporte.literary@gmail.com) para enviar.
        
        console.log('--- Simulação de Envio de Contato (Dados para o Backend) ---');
        console.log(`DESTINO (Backend deve enviar para): ${emailData.to}`);
        console.log(`ASSUNTO GERADO: ${emailData.subject}`);
        console.log(`CORPO: \n${emailData.body}`);
        console.log('------------------------------------------------------------');
        
        // --- Feedback final ao usuário ---
        alert(`Obrigado, ${name}! Sua mensagem sobre "${subject}" foi enviada com sucesso para ${DESTINATION_EMAIL}.`);
        contactForm.reset();
        
    });
});