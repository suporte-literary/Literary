    const rascunhosList = document.getElementById('rascunhosList');
    const emptyState = document.getElementById('emptyState');
    // *** CHAVE CRÍTICA: DEVE SER EXATAMENTE IGUAL à usada em escrever.js ***
    const RASCUNHO_KEY = 'rascunho_obra_completa'; 
    const DEFAULT_COVER = '/site/IMG/Capa_Design-do-Livro-Infantil-Ilustrado.jpg'; 

    // --- Funções de Renderização ---

    // 1. Função para criar o HTML do card de rascunho
    function createRascunhoCard(rascunho) {
        const card = document.createElement('div');
        card.classList.add('obra-card'); 
        card.setAttribute('data-id', rascunho.id || 'unico');

        const coverSrc = rascunho.capaBase64 || DEFAULT_COVER;
        
        const tagsArray = rascunho.tagsObra ? rascunho.tagsObra.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
        const tagsHtml = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Pega a classificação
        const classificacaoSimples = rascunho.classificacaoObra || 'Livre';

        card.innerHTML = `
            <div class="cover-area">
                <img src="${coverSrc}" alt="Capa do Rascunho ${rascunho.tituloObra}">
                <span style="font-weight: 700; color: #ccc;">${classificacaoSimples}</span>
            </div>
            
            <div class="content-area">
                <h2>${rascunho.tituloObra || 'Rascunho Sem Título'}</h2> 
                <p class="current-chapter">Capítulo Atual: ${rascunho.tituloCapitulo || 'Nenhum Capítulo Escrito'}</p>

                <div class="metadata">
                    <span><i class="fas fa-list-alt"></i> Gênero: ${rascunho.generoObra || 'N/A'}</span>
                    <span><i class="fas fa-globe"></i> Idioma: ${rascunho.idiomaObra || 'N/A'}</span>
                    <span><i class="fas fa-edit"></i> Salvo: Agora mesmo</span>
                </div>

                <div class="tags-list">
                    <strong>Tags:</strong>
                    <div class="tags-container">${tagsHtml || 'Nenhuma tag'}</div>
                </div>

                <p class="sinopse-text">
                    ${rascunho.sinopseObra.substring(0, 150).trim() || 'Nenhuma sinopse fornecida.'}
                    ${rascunho.sinopseObra.length > 150 ? '...' : ''}
                </p>
                
                <div class="buttons">
                    <button class="read" onclick="continuarEscrevendoRascunho()"><i class="fas fa-pen-nib"></i> Continuar Escrevendo</button>
                    <button class="delete" onclick="excluirRascunho()"><i class="fas fa-trash-alt"></i> Excluir Rascunho</button>
                </div>
            </div>
        `;
        return card;
    }

    // 2. Função para renderizar o rascunho salvo (Existe apenas um por vez)
    function renderRascunho() {
        rascunhosList.innerHTML = '';
        const rascunhoSalvo = localStorage.getItem(RASCUNHO_KEY);

        if (!rascunhoSalvo) {
            rascunhosList.style.display = 'none';
            emptyState.style.display = 'block';
            return; // Sai da função se não houver rascunho
        }
        
        try {
            const data = JSON.parse(rascunhoSalvo);
            
            // Verifica se há dados essenciais antes de renderizar
            if (data.tituloObra || data.tituloCapitulo || data.sinopseObra) {
                rascunhosList.style.display = 'grid'; // Volta para grid se houver conteúdo
                emptyState.style.display = 'none';
                rascunhosList.appendChild(createRascunhoCard(data));
            } else {
                // Se o rascunho estiver vazio (apenas campos vazios), trata como estado vazio
                rascunhosList.style.display = 'none';
                emptyState.style.display = 'block';
                // Opcional: remover rascunho vazio para manter limpo
                // localStorage.removeItem(RASCUNHO_KEY); 
            }
        } catch (e) {
            console.error("Erro ao parsear rascunho:", e);
            // Limpa o item corrompido para evitar loop de erro
            localStorage.removeItem(RASCUNHO_KEY); 
            rascunhosList.style.display = 'none';
            emptyState.style.display = 'block';
        }

        // Chama a função de listeners do modal apenas se houver rascunhos para garantir que o elemento exista
        if (rascunhosList.querySelector('.obra-card')) {
            setupModalListeners();
        }
    }

    // --- Funções de Ação ---

    function continuarEscrevendoRascunho() {
        // Redireciona para a tela de escrita, onde o rascunho será automaticamente carregado pelo escrever.js
        window.location.href = '/escrever/escrever.html';
    }

    function excluirRascunho() {
        if (confirm("Tem certeza que deseja excluir o rascunho? Esta ação não pode ser desfeita.")) {
            localStorage.removeItem(RASCUNHO_KEY);
            alert("Rascunho excluído com sucesso.");
            renderRascunho(); // Atualiza a tela para mostrar o estado vazio
        }
    }

    // --- Lógica do Modal e Busca (Reaproveitada) ---

    function setupModalListeners() {
        // Remove listeners antigos para evitar duplicação antes de adicionar novos
        document.querySelectorAll('.obra-card img').forEach(img => {
            img.removeEventListener('click', openModal); 
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

    // --- Inicialização ---

    document.addEventListener("DOMContentLoaded", renderRascunho);

    // Torna as funções públicas para o HTML
    window.continuarEscrevendoRascunho = continuarEscrevendoRascunho; // NOVO NOME
    window.excluirRascunho = excluirRascunho;
    window.closeModal = closeModal; 
    window.performSearch = performSearch; // Para o search box na navbar