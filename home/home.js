// home.js - VERSÃO COM SEÇÃO DE NOVIDADES

// CHAVES E CONSTANTES
const PUBLICADAS_KEY = 'literary_obras_publicadas'; 
const LIBRARY_KEY = 'user_library'; 
const categoryListContainer = document.getElementById("categoryListContainer");
const modal = document.getElementById("bookModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById('searchInput');

// REFERÊNCIAS DE BOTÕES DO MODAL
const btnLerObra = document.getElementById('btnLerObra');
const btnAddToLibrary = document.getElementById('btnAddToLibrary');

let ALL_BOOKS = []; // Lista completa de todos os livros
const NEW_RELEASES_COUNT = 15; // Define quantas obras são consideradas "Novidades"

// --- FUNÇÃO DE CARREGAMENTO E ORDENAÇÃO ---

function loadPublishedBooks() {
    const publishedJson = localStorage.getItem(PUBLICADAS_KEY);
    let publishedArray = [];
    
    if (publishedJson) {
        try {
            publishedArray = JSON.parse(publishedJson);
        } catch (e) {
            console.error("Erro ao carregar obras publicadas:", e);
        }
    }

    // A ORDENAÇÃO É CRÍTICA: MAIS RECENTE (MAIOR ID) PRIMEIRO
    publishedArray.sort((a, b) => b.id - a.id); 
    
    // Mapeia e filtra os campos
    ALL_BOOKS = publishedArray.map(obra => ({
        id: obra.id, 
        title: obra.titulo,
        cover: obra.capaUrl,
        synopsis: obra.sinopse,
        author: obra.autor || 'Membro da Comunidade', 
        genre: obra.generoObra || 'Geral', // Usado como CHAVE DE CATEGORIA
        tags: obra.tagsObra ? obra.tagsObra.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    }));
}

/**
 * Cria o card de um único livro.
 */
function createBookCard(book) {
    const div = document.createElement("div");
    div.classList.add("book");
    div.setAttribute('data-id', book.id);
    div.innerHTML = `
        <img src="${book.cover}" alt="${book.title}">
        <p class="book-title">${book.title}</p>
        <div class="book-tags">
            ${book.tags.slice(0, 1).map(tag => `<span>${tag}</span>`).join('')}
        </div>
    `;
    div.addEventListener("click", () => openModal(book));
    return div;
}

/**
 * Renderiza uma lista de livros em um contêiner de categoria específico.
 */
function renderBookList(container, books) {
    books.forEach(book => {
        container.appendChild(createBookCard(book));
    });
}


// --- FUNÇÃO DE RENDERIZAÇÃO PRINCIPAL (NOVA LÓGICA) ---

function renderHomeContent(booksToRender) {
    categoryListContainer.innerHTML = "";

    if (booksToRender.length === 0) {
        categoryListContainer.innerHTML = "<p style='color: #ccc; padding-top: 20px;'>Nenhuma obra encontrada.</p>";
        return;
    }

    // 1. SEÇÃO DE NOVIDADES (Os X primeiros itens da lista já ordenada)
    const newReleases = booksToRender.slice(0, NEW_RELEASES_COUNT);
    const remainingBooks = booksToRender.slice(NEW_RELEASES_COUNT);
    
    if (newReleases.length > 0) {
        const newReleasesSection = document.createElement('section');
        newReleasesSection.classList.add('category-section');
        newReleasesSection.innerHTML = `
            <h2 class="category-title"><i class="fas fa-magic"></i> Novidades!</h2>
            <p class="category-description">As histórias recém-publicadas que você precisa ler.</p>
            <div class="category-books-container" id="new-releases-container"></div>
        `;
        categoryListContainer.appendChild(newReleasesSection);
        const newReleasesContainer = newReleasesSection.querySelector('.category-books-container');
        renderBookList(newReleasesContainer, newReleases);
    }
    
    // 2. AGRUPAMENTO POR CATEGORIA (O restante dos livros)
    
    // Agrupa os livros restantes por gênero (categoria)
    const groupedBooks = remainingBooks.reduce((acc, book) => {
        const key = book.genre || 'Outros'; 
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(book);
        return acc;
    }, {});

    // Itera sobre os grupos restantes e cria as seções
    for (const [category, books] of Object.entries(groupedBooks)) {
        const section = document.createElement('section');
        section.classList.add('category-section');
        
        section.innerHTML = `
            <h2 class="category-title">${category}</h2>
            <p class="category-description">Descubra as histórias populares em ${category}.</p>
            <div class="category-books-container"></div>
        `;
        
        const booksContainer = section.querySelector('.category-books-container');
        renderBookList(booksContainer, books);

        categoryListContainer.appendChild(section);
    }
}

// --- FUNÇÃO OPEN MODAL (Corrigida) ---
function openModal(book) {
    modal.style.display = "block";
    
    document.getElementById("modalCover").src = book.cover;
    document.getElementById("modalCover").alt = `Capa do livro: ${book.title}`; 
    document.getElementById("modalTitle").textContent = book.title;
    document.getElementById("modalAuthor").textContent = book.author || 'Membro da Comunidade'; 
    document.getElementById("modalSynopsis").textContent = book.synopsis;
    document.getElementById("modalGenre").textContent = book.genre || 'N/A';

    const tagContainer = document.getElementById("modalTags");
    tagContainer.innerHTML = "";
    book.tags.forEach(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        tagContainer.appendChild(span);
    });

    btnLerObra.onclick = () => {
        // LINHA DO ALERT REMOVIDA AQUI:
        // alert(`Iniciando leitura de: ${book.title}. (Redirecionando para /leitura/leitura.html?id=${book.id})`); 
        window.location.href = `/leitura/leitura.html?id=${book.id}`; 
    };

    updateLibraryButton(book.id); 
    btnAddToLibrary.onclick = () => handleLibrary(book);
}

// --- FUNÇÕES DA BIBLIOTECA (Mantidas) ---

function updateLibraryButton(bookId) {
    const library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    const isAdded = library.some(item => item.id === bookId);

    if (isAdded) {
        btnAddToLibrary.innerHTML = `<i class="fas fa-times"></i> Remover da Biblioteca`;
        btnAddToLibrary.setAttribute('data-action', 'remove');
    } else {
        btnAddToLibrary.innerHTML = `<i class="fas fa-bookmark"></i> Adicionar à Biblioteca`;
        btnAddToLibrary.setAttribute('data-action', 'add');
    }
}

function handleLibrary(book) {
    let library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    const bookId = book.id;
    const action = btnAddToLibrary.getAttribute('data-action');

    if (action === 'add') {
        library.push({ 
            id: bookId, 
            title: book.title, 
            cover: book.cover,
            dateAdded: Date.now()
        });
        alert(`"${book.title}" adicionado à sua biblioteca!`);
    } else {
        library = library.filter(item => item.id !== bookId);
        alert(`"${book.title}" removido da sua biblioteca.`);
    }

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    updateLibraryButton(bookId); 
}

// --- BUSCA (Ajustada para renderizar o conteúdo) ---

function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === "") {
        renderHomeContent(ALL_BOOKS);
        return;
    }

    const filteredBooks = ALL_BOOKS.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        const tagMatch = book.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const genreMatch = book.genre.toLowerCase().includes(searchTerm);
        return titleMatch || tagMatch || genreMatch;
    });
    
    // Renderiza o conteúdo (incluindo as novidades) baseando-se nos livros filtrados
    renderHomeContent(filteredBooks);

    if (filteredBooks.length === 0) {
        alert(`Nenhuma obra encontrada para "${searchTerm}".`);
    }
    searchInput.value = ""; 
}

// --- Eventos de Fechamento do Modal ---
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// --- Inicialização da Home ---
// Esta função é o ponto de entrada principal para a página Home.
function initHome() {
    loadPublishedBooks(); // Carrega e ordena todos os livros
    renderHomeContent(ALL_BOOKS); // Renderiza o conteúdo principal, incluindo "Novidades!"

    // Chamadas para outras funções de inicialização (como autenticação, preferências, etc.)
    // Adicione-as aqui, se existirem e forem globais, para serem executadas após a DOM estar pronta.
    // Exemplo:
    if (typeof checkAuth === 'function') checkAuth(); 
    if (typeof loadPreferences === 'function') loadPreferences(); 
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

// Garante que a função initHome seja executada assim que o script home.js for carregado
// e o DOM estiver pronto para manipulação.
initHome(); 

// Torna a função performSearch globalmente acessível para o botão de busca no HTML
window.performSearch = performSearch;