// Biblioteca.js (Baseado no Home.js, mas focado em filtrar)

// CHAVES E CONSTANTES (MANTIDAS)
const PUBLICADAS_KEY = 'literary_obras_publicadas'; 
const LIBRARY_KEY = 'user_library'; // Chave onde estão os IDs de livros na biblioteca
const categoryListContainer = document.getElementById("categoryListContainer");
const modal = document.getElementById("bookModal");
const closeModal = document.getElementById("closeModal");
const searchInput = document.getElementById('searchInput');
const libraryStatus = document.getElementById('library-status'); // Novo elemento

// REFERÊNCIAS DE BOTÕES DO MODAL
const btnLerObra = document.getElementById('btnLerObra');
const btnAddToLibrary = document.getElementById('btnAddToLibrary');

let ALL_BOOKS_DETAILS = []; // Detalhes completos de todas as obras publicadas
let USER_LIBRARY_BOOKS = []; // Lista de obras atualmente na biblioteca do usuário

// --- FUNÇÃO DE CARREGAMENTO DE DADOS ---

function loadPublishedBooks() {
    // Esta função carrega TUDO que está publicado
    const publishedJson = localStorage.getItem(PUBLICADAS_KEY);
    let publishedArray = [];
    
    if (publishedJson) {
        try {
            publishedArray = JSON.parse(publishedJson);
        } catch (e) {
            console.error("Erro ao carregar obras publicadas:", e);
        }
    }

    // Mapeia os dados, mantendo os detalhes
    ALL_BOOKS_DETAILS = publishedArray.map(obra => ({
        id: obra.id, 
        title: obra.titulo,
        cover: obra.capaUrl,
        synopsis: obra.sinopse,
        author: obra.autor || 'Membro da Comunidade', 
        genre: obra.generoObra || 'Geral', 
        tags: obra.tagsObra ? obra.tagsObra.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    }));
}

function loadLibraryContent() {
    loadPublishedBooks(); // Carrega todos os detalhes primeiro

    const libraryJson = localStorage.getItem(LIBRARY_KEY);
    const libraryIds = JSON.parse(libraryJson || '[]');

    if (libraryIds.length === 0) {
        // Se a biblioteca estiver vazia
        categoryListContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #aaa;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #3a4a6b;"></i>
                <h2 style="margin-top: 15px;">Sua biblioteca está vazia!</h2>
                <p>Adicione obras da página Home para começar a ler.</p>
            </div>
        `;
        libraryStatus.textContent = "Sua biblioteca está vazia. Adicione obras na Home para começar a ler.";
        return;
    }

    // Mapeia e filtra: Combina os detalhes de ALL_BOOKS_DETAILS com os IDs e a data de adição da libraryIds
    USER_LIBRARY_BOOKS = libraryIds
        .map(libItem => {
            const bookDetail = ALL_BOOKS_DETAILS.find(book => book.id === libItem.id);
            // Retorna o objeto de detalhe completo mais a data de adição (para ordenação)
            return bookDetail ? { ...bookDetail, dateAdded: libItem.dateAdded } : null;
        })
        .filter(book => book !== null) // Remove livros que foram excluídos, mas ainda estavam na lista de IDs
        .sort((a, b) => b.dateAdded - a.dateAdded); // ORDENAÇÃO: Mais recente na biblioteca primeiro

    // Renderiza a biblioteca
    renderCategories(USER_LIBRARY_BOOKS);
    libraryStatus.textContent = `Você tem ${USER_LIBRARY_BOOKS.length} obras na sua biblioteca.`;
}


/**
 * Renderiza os livros agrupados (agora pela data de adição ou gênero).
 * @param {Array} booksToRender Lista de obras para renderizar (já filtrada).
 */
function renderCategories(booksToRender) {
    categoryListContainer.innerHTML = "";
    
    // Simplificando o agrupamento para a Biblioteca: 
    // Vamos agrupar apenas pelo Gênero, mas a lista principal está ordenada por Data de Adição.
    
    // 1. Agrupa os livros por gênero (categoria)
    const groupedBooks = booksToRender.reduce((acc, book) => {
        const key = book.genre || 'Outros'; 
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(book);
        return acc;
    }, {});

    // 2. Itera sobre os grupos e cria as seções no HTML
    for (const [category, books] of Object.entries(groupedBooks)) {
        
        const section = document.createElement('section');
        section.classList.add('category-section');
        
        // Título e Descrição
        section.innerHTML = `
            <h2 class="category-title">${category}</h2>
            <p class="category-description">Obras de ${category} na sua biblioteca. (Total: ${books.length})</p>
            <div class="category-books-container" id="books-${category.replace(/\s/g, '-')}-container">
                </div>
        `;
        
        const booksContainer = section.querySelector('.category-books-container');

        // Cria os cards de livro
        books.forEach(book => {
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
            booksContainer.appendChild(div);
        });

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
        // LINHA DO ALERT REMOVIDA AQUI
        // alert(`Iniciando leitura de: ${book.title}. (Redirecionando para /leitura/leitura.html?id=${book.id})`); 
        window.location.href = `/leitura/leitura.html?id=${book.id}`; 
    };

    // Atualiza o botão (que agora será sempre REMOVER na tela da Biblioteca)
    updateLibraryButton(book.id); 
    btnAddToLibrary.onclick = () => handleLibrary(book, true); // O 'true' indica que estamos na Biblioteca
}

// --- FUNÇÕES DA BIBLIOTECA (Ajustadas) ---

function updateLibraryButton(bookId) {
    // Na tela da Biblioteca, o botão sempre deve ser "Remover"
    btnAddToLibrary.innerHTML = `<i class="fas fa-times"></i> Remover da Biblioteca`;
    btnAddToLibrary.setAttribute('data-action', 'remove');
}

function handleLibrary(book, isLibraryPage = false) {
    let library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
    const bookId = book.id;
    
    // Na tela da biblioteca, a única ação é remover
    library = library.filter(item => item.id !== bookId);
    alert(`"${book.title}" removido da sua biblioteca.`);

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    
    // Se estiver na página da Biblioteca, recarregue o conteúdo após remover
    if (isLibraryPage) {
        modal.style.display = "none"; // Fecha o modal
        loadLibraryContent(); 
    } else {
        // Se estiver na Home (ou outra tela), apenas atualize o botão
        updateLibraryButton(bookId);
    }
}

// --- BUSCA (Adaptada para buscar apenas nos livros da Biblioteca) ---

function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === "") {
        renderCategories(USER_LIBRARY_BOOKS); // Retorna a lista completa da biblioteca
        return;
    }

    const filteredBooks = USER_LIBRARY_BOOKS.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        const tagMatch = book.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const genreMatch = book.genre.toLowerCase().includes(searchTerm);
        return titleMatch || tagMatch || genreMatch;
    });
    
    // Renderiza as categorias baseadas apenas nos livros filtrados
    renderCategories(filteredBooks);

    if (filteredBooks.length === 0) {
        alert(`Nenhuma obra encontrada na sua biblioteca para "${searchTerm}".`);
    }
    // Não limpa o input para que o usuário veja o termo que buscou
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

// --- Eventos de Fechamento do Modal ---
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

// --- Inicialização ---
window.addEventListener('load', loadLibraryContent); 
window.performSearch = performSearch; // Torna a função de busca globalmente acessível