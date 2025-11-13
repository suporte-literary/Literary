const obrasList = document.getElementById('obrasList');
const emptyState = document.getElementById('emptyState');
const PUBLICADAS_KEY = 'literary_obras_publicadas';
const DEFAULT_COVER = '/site/IMG/Capa_Design-do-Livro-Infantil-Ilustrado.jpg'; // Capa placeholder
const LIBRARY_KEY = 'literary_biblioteca_pessoal'; // NOVO: Chave para a biblioteca

// --- Funções de Renderização (Atualizada) ---

// Função para criar o HTML de um card de obra com todos os metadados
function createObraCard(obra) {
    const card = document.createElement('div');
    card.classList.add('obra-card');
    card.setAttribute('data-id', obra.id);

    const coverSrc = obra.capaUrl || DEFAULT_COVER;
    const isAddedToLibrary = isObraInLibrary(obra.id);
    const libraryButtonText = isAddedToLibrary ? 'Remover da Biblioteca' : 'Adicionar à Biblioteca';
    const libraryButtonIcon = isAddedToLibrary ? 'fas fa-check-circle' : 'fas fa-plus-circle';
    
    // Divide as tags e cria o HTML para cada tag
    const tagsArray = obra.tags ? obra.tags.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    const tagsHtml = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');

    // Garante que o contador de capítulos seja um número
    const capitulosPublicados = obra.capitulo ? parseInt(obra.capitulo) : 0;

    card.innerHTML = `
        <div class="cover-area">
            <img src="${coverSrc}" alt="Capa da Obra ${obra.titulo}">
            ${obra.classificacao} </div>
        
        <div class="content-area">
            <h2>${obra.titulo}</h2>
            <p class="current-chapter">${capitulosPublicados} Capítulos Publicados</p>

            <div class="metadata">
                <span><i class="fas fa-list-alt"></i> Gênero: ${obra.genero || 'N/A'}</span>
                <span><i class="fas fa-globe"></i> Idioma: ${obra.idioma || 'N/A'}</span>
                <span><i class="fas fa-calendar-alt"></i> Publicado em: ${obra.dataPublicacao}</span>
            </div>

            <div class="tags-list">
                <strong>Tags:</strong>
                <div class="tags-container">${tagsHtml}</div>
            </div>

            <p class="sinopse-text">${obra.sinopse || 'Nenhuma sinopse fornecida.'}</p>
            
            <div class="buttons">
                <button class="read" onclick="visualizarObra('${obra.id}')"><i class="fas fa-book-open"></i> Continuar Lendo</button>
                <button 
                    class="add-to-library" 
                    data-id="${obra.id}" 
                    data-action="${isAddedToLibrary ? 'remove' : 'add'}"
                    onclick="toggleLibrary('${obra.id}')">
                    <i class="${libraryButtonIcon}"></i> ${libraryButtonText}
                </button>
                <button class="edit" onclick="editarObra('${obra.id}')"><i class="fas fa-edit"></i> Editar Obra</button>
            </div>
            <div class="buttons" style="margin-top: 10px; border-top: none;">
                <button class="delete" onclick="excluirObra('${obra.id}')"><i class="fas fa-trash-alt"></i> Excluir Obra</button>
            </div>
        </div>
    `;
    return card;
}

// Função para renderizar todas as obras salvas (Mantida)
function renderObras() {
    obrasList.innerHTML = '';
    const obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');

    if (obras.length === 0) {
        obrasList.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        obrasList.style.display = 'flex'; // Mantém o display grid ou flex
        obrasList.style.flexDirection = 'column'; // Organiza os cards atualizados verticalmente
        
        // A chave aqui é iterar sobre TODAS as obras salvas
        obras.forEach(obra => {
            obrasList.appendChild(createObraCard(obra));
        });
        setupModalListeners(); // Re-adiciona listeners do modal após a renderização
    }
}

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

// --- Funções de Ação e CRUD (Atualizadas) ---

// CORRIGIDO: Redireciona para a tela de detalhes/edição da obra
function visualizarObra(id) {
    window.location.href = `../detalhesobras/detalhes.html?obraId=${id}`;
}

// CORRIGIDO: Redireciona para a tela de edição
function editarObra(id) {
    window.location.href = `../detalhesobras/detalhes.html?obraId=${id}`; 
}

function excluirObra(id) {
    if (confirm("Tem certeza que deseja excluir esta obra permanentemente?")) {
        let obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');
        obras = obras.filter(o => o.id !== id);
        localStorage.setItem(PUBLICADAS_KEY, JSON.stringify(obras));
        
        // Remove também da biblioteca (caso esteja lá)
        let library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
        library = library.filter(libId => libId !== id);
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
        
        // IMPORTANTE: Remove os capítulos da obra também! (Adicionado)
        const capitulosKey = `literary_capitulos_obra_${id}`;
        localStorage.removeItem(capitulosKey);
        
        renderObras();
        alert("Obra excluída com sucesso.");
    }
}

// --- NOVAS FUNÇÕES: BIBLIOTECA ---

// Verifica se uma obra está na biblioteca
function isObraInLibrary(id) {
    const library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    return library.includes(id);
}

// Adiciona ou remove uma obra da biblioteca
function toggleLibrary(id) {
    let library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    const button = document.querySelector(`.buttons button[data-id="${id}"]`);

    if (isObraInLibrary(id)) {
        // Remover
        library = library.filter(libId => libId !== id);
        alert("Obra removida da sua Biblioteca.");
        if (button) {
            button.setAttribute('data-action', 'add');
            button.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar à Biblioteca';
            button.classList.remove('added'); // Opcional: remover classe de estilo
        }
    } else {
        // Adicionar
        library.push(id);
        alert("Obra adicionada à sua Biblioteca!");
        if (button) {
            button.setAttribute('data-action', 'remove');
            button.innerHTML = '<i class="fas fa-check-circle"></i> Remover da Biblioteca';
            button.classList.add('added'); // Opcional: adicionar classe de estilo
        }
    }
    
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    // Re-renderiza para atualizar o estado dos botões de todas as obras
    renderObras();
}


// --- Lógica do Modal e Busca (Mantida) ---

// Adiciona listeners para abrir o modal
function setupModalListeners() {
    document.querySelectorAll('.obra-card img').forEach(img => {
        img.removeEventListener('click', openModal); // Previne duplicidade
        img.addEventListener('click', openModal);
    });
}

function openModal(e) {
    const img = e.target;
    const modal = document.getElementById('coverModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('caption');

    modal.style.display = "block";
    modalImg.src = img.src;
    // Pega o H2 do card
    caption.innerText = img.closest('.obra-card').querySelector('h2').textContent;
}

function closeModal() {
    document.getElementById('coverModal').style.display = "none";
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm === "") {
        alert("Digite algo para pesquisar!");
        return;
    }
    alert(`Pesquisando por: ${searchTerm}`);
}

// --- Funções de Integração (Chamada pela tela Escrever) ---

// Garante que a função de adicionar obra esteja acessível para a tela 'Escrever'
window.adicionarObraPublicada = function(data) {
    const obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');
    
    // O objeto de dados agora é mais completo, vindo de escrever.js
    const novaObra = {
        id: Date.now().toString(),
        titulo: data.tituloObra,
        sinopse: data.sinopseObra,
        tags: data.tagsObra, // NOVO
        genero: data.generoObra, // NOVO
        idioma: data.idiomaObra, // NOVO
        classificacao: data.classificacaoObra === '+18' 
            ? `<span style="color: #d32f2f; font-weight: 700;">+18</span>` 
            : `<span style="color: #43a047; font-weight: 700;">Livre</span>`,
        capitulo: '1', // Se for adicionada por aqui, tem 1 capítulo (se a tela 'Escrever' publicar um)
        // conteudo: data.conteudoCapitulo, // Removido: Conteúdo do capítulo deve ser salvo separadamente
        dataPublicacao: new Date().toLocaleDateString('pt-BR'),
        capaUrl: data.capaBase64 || DEFAULT_COVER
    };
    
    obras.push(novaObra);
    localStorage.setItem(PUBLICADAS_KEY, JSON.stringify(obras));
    
    // Se a tela Minhas Obras estiver aberta, ela é atualizada
    if (document.title.includes('Minhas Obras')) {
        renderObras();
    }

    return true; // Sucesso na adição
};


// --- Inicialização ---

document.addEventListener("DOMContentLoaded", renderObras);
// Torna as novas funções de biblioteca públicas para o HTML
window.toggleLibrary = toggleLibrary;
window.editarObra = editarObra; // Garante que a função de editar esteja global
window.excluirObra = excluirObra;
window.visualizarObra = visualizarObra;
