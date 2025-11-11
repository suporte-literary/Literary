// CHAVE CRÍTICA: Deve ser a mesma usada em Home.js e detalhes.js
const PUBLICADAS_KEY = 'literary_obras_publicadas';
// Chave para armazenar os dados de interação de todos os capítulos
const INTERACTION_KEY = 'literary_chapter_interactions';

// Variáveis Globais de Paginação
let bookId = null;
let capitulosPublicados = [];
let currentChapterIndex = 0; // O índice do capítulo atual (0 é o primeiro)

// Elementos DOM
const bookContent = document.getElementById('bookContent');
const bookTitleHeader = document.getElementById('bookTitleHeader');
const pageTitle = document.getElementById('pageTitle');
const body = document.body;

// Controles de Navegação
const prevChapterBtn = document.getElementById('prevChapterBtn');
const nextChapterBtn = document.getElementById('nextChapterBtn');
const indexBtn = document.getElementById('indexBtn'); // Botão no cabeçalho

// Configurações do Modal
const settingsModal = document.getElementById('settingsModal');
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const decreaseFontBtn = document.getElementById('decreaseFontBtn');
const increaseFontBtn = document.getElementById('increaseFontBtn');
const currentFontSizeSpan = document.getElementById('currentFontSize');
const FONT_CLASSES = ['small-font', 'default-font', 'large-font', 'x-large-font'];
let currentFontIndex = 1; // Padrão é o índice 1 (14px)

const themeDarkBtn = document.getElementById('themeDarkBtn');
const themeSepiaBtn = document.getElementById('themeSepiaBtn');
const themeLightBtn = document.getElementById('themeLightBtn');

// NOVO: Elementos do Índice
const indexModal = document.getElementById('indexModal');
const chapterList = document.getElementById('chapterList');

// --- FUNÇÕES DE PERSISTÊNCIA (localStorage) ---

function getCapitulosKey(obraId) {
    return `literary_capitulos_obra_${obraId}`;
}

/**
 * Obtém o nome de usuário (apelido) do localStorage.
 * Retorna 'Usuário Desconhecido' se não houver dados.
 */
function getLoggedInUsername() {
    try {
        const userDataJson = localStorage.getItem('user_data');
        if (userDataJson) {
            const userData = JSON.parse(userDataJson);
            // Assumindo que o apelido (username) é salvo como 'apelido'
            return userData.apelido || 'Usuário Desconhecido';
        }
    } catch (e) {
        console.error("Erro ao carregar user_data:", e);
    }
    return 'Usuário Desconhecido';
}

function loadAllInteractions() {
    const json = localStorage.getItem(INTERACTION_KEY);
    return JSON.parse(json || '{}');
}

function saveAllInteractions(interactions) {
    localStorage.setItem(INTERACTION_KEY, JSON.stringify(interactions));
}

function getChapterInteraction(chapterId) {
    const allInteractions = loadAllInteractions();
    if (!allInteractions[chapterId]) {
        allInteractions[chapterId] = { 
            views: 0, 
            likes: 0, 
            liked: false, 
            comments: [] 
        };
        saveAllInteractions(allInteractions);
    }
    return allInteractions[chapterId];
}

/**
 * Incrementa a visualização de um capítulo UMA ÚNICA VEZ por carregamento (reseta diariamente).
 */
function incrementView(chapterId) {
    const hasViewedKey = `viewed_${chapterId}_${new Date().toDateString()}`; 
    
    if (sessionStorage.getItem(hasViewedKey)) {
        return; 
    }

    const allInteractions = loadAllInteractions();
    const chapterData = getChapterInteraction(chapterId);
    
    chapterData.views = (parseInt(chapterData.views) || 0) + 1;
    allInteractions[chapterId] = chapterData;
    saveAllInteractions(allInteractions);
    
    sessionStorage.setItem(hasViewedKey, 'true');
}

// --- FUNÇÕES DE INTERAÇÃO (Curtir e Comentar) ---

function toggleLike(chapterId, likeBtn) {
    const allInteractions = loadAllInteractions();
    const chapterData = getChapterInteraction(chapterId);
    
    const isCurrentlyLiked = chapterData.liked;
    
    chapterData.liked = !isCurrentlyLiked;
    chapterData.likes += isCurrentlyLiked ? -1 : 1;
    
    allInteractions[chapterId] = chapterData;
    saveAllInteractions(allInteractions);

    likeBtn.classList.toggle('liked', chapterData.liked);
    likeBtn.nextElementSibling.textContent = chapterData.likes;
    
    renderChapter(currentChapterIndex); 
}

/**
 * Lida com a submissão de um novo comentário, pegando o nome de usuário do localStorage.
 */
function submitComment(event, chapterId) {
    event.preventDefault();
    
    const form = event.target;
    const textarea = form.querySelector('textarea');
    const commentText = textarea.value.trim();
    
    if (!commentText) {
        alert("Por favor, digite um comentário.");
        return;
    }

    const allInteractions = loadAllInteractions();
    const chapterData = getChapterInteraction(chapterId);
    
    // Pega o nome de usuário logado
    const authorName = getLoggedInUsername(); 

    const newComment = {
        id: Date.now(),
        author: authorName, 
        text: commentText,
        date: new Date().toLocaleString()
    };

    chapterData.comments.push(newComment);
    allInteractions[chapterId] = chapterData;
    saveAllInteractions(allInteractions);

    textarea.value = '';
    
    // Apenas renderiza o capítulo atual novamente para atualizar a lista de comentários
    renderChapter(currentChapterIndex);
}

// --- FUNÇÕES DE RENDERIZAÇÃO E PAGINAÇÃO ---

/**
 * Renderiza a seção de comentários APENAS para o capítulo atual.
 */
function renderChapterComments(chapterData, chapterId) {
    // Comentários existentes (mais recentes primeiro)
    const commentListHtml = [...chapterData.comments].reverse().map(c => `
        <li class="comment-item">
            <p class="comment-author">${c.author} (${c.date})</p>
            <p class="comment-text">${c.text}</p>
        </li>
    `).join('');

    // Estrutura de comentários (usando as classes CSS existentes)
    return `
        <div class="full-comments-container">
            <h2 class="comments-main-title">Comentários do Capítulo</h2>
            
            <div class="chapter-comments-section">
                <form 
                    class="comment-form" 
                    id="comment-form-${chapterId}" 
                    onsubmit="submitComment(event, '${chapterId}')"
                >
                    <textarea placeholder="Seu comentário..."></textarea>
                    <button type="submit">Enviar Comentário</button>
                </form>

                <ul class="comment-list">
                    ${commentListHtml || '<p>Seja o primeiro a comentar!</p>'}
                </ul>
            </div>
        </div>
    `;
}

/**
 * Renderiza a lista de capítulos no modal do índice.
 */
function renderChapterIndex() {
    // Garante que o ID do capítulo atual está disponível (se houver)
    const currentChapterId = capitulosPublicados[currentChapterIndex] ? capitulosPublicados[currentChapterIndex].id : null;
    
    const indexHtml = capitulosPublicados.map((capitulo, index) => {
        const isCurrent = capitulo.id === currentChapterId;
        const currentClass = isCurrent ? 'current-chapter' : '';
        
        // Use uma função de click que fecha o modal e renderiza o capítulo
        return `
            <li>
                <a href="#" 
                   class="${currentClass}" 
                   data-index="${index}"
                   onclick="goToChapterFromIndex(${index}, event)">
                    Capítulo ${index + 1}: ${capitulo.titulo}
                </a>
            </li>
        `;
    }).join('');

    chapterList.innerHTML = indexHtml;
}

/**
 * Abre um capítulo ao clicar no índice e fecha o modal.
 */
window.goToChapterFromIndex = (index, event) => {
    event.preventDefault();
    renderChapter(index);
    // Fecha o modal após a navegação
    indexModal.classList.remove('show');
    indexModal.style.display = 'none'; 
    
    // Atualiza o estado visual do índice
    updateIndexState();
};

/**
 * Função utilitária para destacar o capítulo atual no índice
 */
function updateIndexState() {
    document.querySelectorAll('#chapterList a').forEach(link => {
        link.classList.remove('current-chapter');
        if (parseInt(link.dataset.index) === currentChapterIndex) {
            link.classList.add('current-chapter');
        }
    });
}

/**
 * Renderiza o conteúdo do capítulo atual e as interações (núcleo da paginação).
 */
function renderChapter(index) {
    if (index < 0 || index >= capitulosPublicados.length) {
        return;
    }

    currentChapterIndex = index;
    const capitulo = capitulosPublicados[index];
    const chapterId = capitulo.id;
    const chapterData = getChapterInteraction(chapterId);

    // 1. Incrementa a visualização
    incrementView(chapterId);

    // 2. Monta o HTML do Capítulo
    let chapterHtml = `
        <h2 class="obra-title">${bookTitleHeader.textContent}</h2>
        <h3 class="chapter-title" id="chapter-${chapterId}">${capitulo.titulo}</h3>
    `;

    // Conteúdo do Capítulo
    if (capitulo.conteudo) {
        const paragraphs = capitulo.conteudo.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');
        chapterHtml += paragraphs;
    } else {
        chapterHtml += `<p>Nenhum conteúdo encontrado para este capítulo.</p>`;
    }
    
    // 3. Área de Interações e Estatísticas
    chapterHtml += `
        <div class="chapter-interactions">
            <div class="interaction-item">
                <button 
                    class="interaction-btn like-btn ${chapterData.liked ? 'liked' : ''}" 
                    data-cap-id="${chapterId}"
                    onclick="toggleLike('${chapterId}', this)"
                >
                    <i class="fas fa-heart"></i>
                </button>
                <span>${chapterData.likes}</span>
            </div>
            
            <div class="interaction-item">
                <button 
                    class="interaction-btn comment-btn" 
                    data-cap-id="${chapterId}"
                    onclick="document.getElementById('comment-form-${chapterId}').scrollIntoView({behavior: 'smooth'})"
                >
                    <i class="fas fa-comment"></i>
                </button>
                <span>${chapterData.comments.length}</span>
            </div>
            
            <div class="interaction-item">
                <i class="fas fa-eye"></i>
                <span>${chapterData.views}</span>
            </div>
        </div>
    `;

    // 4. ADICIONA A SEÇÃO DE COMENTÁRIOS DO CAPÍTULO ATUAL
    chapterHtml += renderChapterComments(chapterData, chapterId);

    // 5. Injeta o conteúdo completo
    bookContent.innerHTML = chapterHtml;
    
    // 6. Atualiza o rodapé e o estado do índice
    updateChapterNavigation();
    
    // Volta o scroll para o topo
    document.querySelector('.reading-area').scrollTop = 0; 
}

/**
 * Atualiza o estado dos botões "Anterior" e "Próximo".
 * Também renderiza e atualiza o estado do Índice.
 */
function updateChapterNavigation() {
    prevChapterBtn.disabled = (currentChapterIndex <= 0);
    nextChapterBtn.disabled = (currentChapterIndex >= capitulosPublicados.length - 1);
    
    prevChapterBtn.onclick = () => renderChapter(currentChapterIndex - 1);
    nextChapterBtn.onclick = () => renderChapter(currentChapterIndex + 1);
    
    // Atualiza a lista no modal do índice toda vez que um capítulo é carregado
    renderChapterIndex(); 
    updateIndexState();
}

/**
 * Carrega a obra e prepara a paginação.
 */
function loadBookContent() {
    const urlParams = new URLSearchParams(window.location.search);
    bookId = urlParams.get('id');

    if (!bookId) {
        bookContent.innerHTML = "<p>Erro: ID da obra não encontrado na URL.</p>";
        bookTitleHeader.textContent = "Obra Não Encontrada";
        pageTitle.textContent = "Literary | Erro";
        return;
    }
    
    bookContent.dataset.bookId = bookId; 

    // 1. Encontra os detalhes da obra (apenas para o título)
    const publishedJson = localStorage.getItem(PUBLICADAS_KEY);
    let publishedArray = JSON.parse(publishedJson || '[]');
    const book = publishedArray.find(obra => obra.id == bookId);

    if (!book) {
        bookContent.innerHTML = "<p>Obra principal não encontrada.</p>";
        bookTitleHeader.textContent = "Obra Não Encontrada";
        return;
    }

    // Atualiza títulos
    bookTitleHeader.textContent = book.titulo;
    pageTitle.textContent = `Literary | ${book.titulo}`;

    // 2. Busca e filtra os capítulos (populando a variável global)
    const capitulosKey = getCapitulosKey(bookId);
    let capitulosSalvos = JSON.parse(localStorage.getItem(capitulosKey) || '[]');

    capitulosPublicados = capitulosSalvos
        .filter(cap => cap.status === 'Publicado')
        .sort((a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao)); 

    if (capitulosPublicados.length === 0) {
        bookContent.innerHTML = "<p>Ainda não há capítulos publicados para esta obra.</p>";
        updateChapterNavigation(); 
        return;
    }

    // 3. Renderiza o primeiro capítulo
    renderChapter(0);
}


// --- LÓGICA DE CONFIGURAÇÃO DE LEITURA (CONTROLE DE TEMA E FONTE) ---

function updateFontSize() {
    // Remove todas as classes de tamanho
    FONT_CLASSES.forEach(cls => bookContent.classList.remove(cls));
    
    // Adiciona a nova classe
    const newClass = FONT_CLASSES[currentFontIndex];
    if (newClass) {
        bookContent.classList.add(newClass);
    }

    let sizeName;
    switch(currentFontIndex) {
        case 0: sizeName = 'Pequena'; break;
        case 1: sizeName = 'Padrão (14px)'; break; // Texto atualizado para indicar o padrão
        case 2: sizeName = 'Grande'; break;
        case 3: sizeName = 'Extra Grande'; break;
        default: sizeName = 'Padrão (14px)';
    }
    currentFontSizeSpan.textContent = sizeName;
    
    localStorage.setItem('reading_font_index', currentFontIndex);
}

decreaseFontBtn.addEventListener('click', () => {
    if (currentFontIndex > 0) {
        currentFontIndex--;
        updateFontSize();
    }
});

increaseFontBtn.addEventListener('click', () => {
    if (currentFontIndex < FONT_CLASSES.length - 1) {
        currentFontIndex++;
        updateFontSize();
    }
});

function applyTheme(themeName) {
    body.classList.remove('theme-dark', 'theme-sepia', 'theme-light');
    body.classList.add(`theme-${themeName}`);

    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.theme-btn[data-theme="${themeName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    localStorage.setItem('reading_theme', themeName);
}

themeDarkBtn.addEventListener('click', () => applyTheme('dark'));
themeSepiaBtn.addEventListener('click', () => applyTheme('sepia'));
themeLightBtn.addEventListener('click', () => applyTheme('light'));

function loadPreferences() {
    // 1. Carrega Tamanho da Fonte
    const savedFontIndex = localStorage.getItem('reading_font_index');
    if (savedFontIndex !== null) {
        currentFontIndex = parseInt(savedFontIndex);
    } else {
        // Se não houver preferência salva, mantém o padrão (índice 1)
        currentFontIndex = 1; 
    }
    updateFontSize();
    
    // 2. Carrega Tema
    const savedTheme = localStorage.getItem('reading_theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Aplica o tema escuro como padrão, se não houver preferência
        applyTheme('dark'); 
    }
}

// --- LÓGICA DE ABRIR/FECHAR MODAIS ---

function closeAllModals() {
    settingsModal.style.display = 'none';
    indexModal.classList.remove('show');
    indexModal.style.display = 'none'; 
}

// Lógica para abrir/fechar o modal de configurações
toggleSettingsBtn.addEventListener('click', () => {
    // Fecha o índice se estiver aberto
    if (indexModal.classList.contains('show')) {
        closeAllModals();
    }
    
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
});


// NOVO: Lógica para abrir/fechar o modal do índice
indexBtn.addEventListener('click', () => {
    // Fecha as configurações se estiverem abertas
    if (settingsModal.style.display === 'block') {
        closeAllModals();
    }
    
    const isShowing = indexModal.classList.contains('show');
    if (isShowing) {
        indexModal.classList.remove('show');
        // Adiciona a visibilidade 'none' após a remoção da classe 'show' para garantir que o elemento não bloqueie cliques
        setTimeout(() => indexModal.style.display = 'none', 300); 
    } else {
        indexModal.style.display = 'block';
        // Pequeno delay para a animação CSS funcionar
        setTimeout(() => indexModal.classList.add('show'), 10);
    }
});

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


document.addEventListener('click', (e) => {
    // Fecha o modal de configurações se clicar fora (exceto no botão de toggle)
    if (settingsModal.style.display === 'block' && 
        !settingsModal.contains(e.target) && 
        e.target !== toggleSettingsBtn) {
        settingsModal.style.display = 'none';
    }

    // Fecha o modal do índice se clicar fora (exceto no modal ou no botão do índice)
    if (indexModal.classList.contains('show') && 
        !indexModal.contains(e.target) && 
        e.target !== indexBtn && 
        !indexBtn.contains(e.target) &&
        !indexBtn.querySelector('i').contains(e.target)) {
        
        indexModal.classList.remove('show');
        setTimeout(() => indexModal.style.display = 'none', 300);
    }
});


// --- INICIALIZAÇÃO ---
window.addEventListener('load', () => {
    loadPreferences(); 
    loadBookContent();
});