const PUBLICADAS_KEY = 'literary_obras_publicadas';
const DEFAULT_COVER = '/site/IMG/capa_rpg_mockup.png'; // CORRIGIDO: Usando o caminho da capa mock no HTML
const TITLE_CHAR_LIMIT = 20; 

let currentChapterId = null;

// NOVO: Função para lidar com a mudança da imagem da capa
function handleCoverImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const capaObraEdit = document.getElementById('capaObraEdit');
            capaObraEdit.src = e.target.result; // Exibe a nova capa (URL Base64)
        };
        // Lê o arquivo como URL base64, que pode ser armazenada no localStorage
        reader.readAsDataURL(file); 
    }
}


// Função para truncar o título para o DISPLAY (adiciona ...)
function truncateTitleForDisplay(title) {
    if (!title) return '';
    return title.length > TITLE_CHAR_LIMIT ? title.substring(0, TITLE_CHAR_LIMIT) + '...' : title;
}

// Função para garantir que o título salvo não exceda o limite
function enforceTitleLimit(title) {
    if (!title) return '';
    return title.substring(0, TITLE_CHAR_LIMIT);
}

// Função para obter o parâmetro da URL (obraId)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Função para gerar o ID da chave de capítulos da obra no localStorage
function getCapitulosKey(obraId) {
    return `literary_capitulos_obra_${obraId}`;
}

// Configura a tela para o modo "Nova Obra"
function setupNewObraMode() {
    // 1. Atualiza o título da página/header
    document.title = 'Literary | Nova Obra';
    
    // Atualiza o texto do header para refletir "Adicionar nova História"
    const headerTitle = document.querySelector('.voltar');
    if (headerTitle) {
        headerTitle.innerHTML = '<i class="fas fa-arrow-left"></i> Adicionar nova História';
    }
    
    // 2. Garante que a aba Detalhes seja a primeira a ser exibida
    const tabDetalhes = document.querySelector('.tab-button[data-tab="detalhes"]');
    const contentDetalhes = document.getElementById('detalhes');
    const contentIndice = document.getElementById('indice');

    if (tabDetalhes && contentDetalhes && contentIndice) {
        // Ativa a aba Detalhes
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        tabDetalhes.classList.add('active');
        
        // Exibe o conteúdo Detalhes e esconde o Índice
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        contentDetalhes.classList.remove('hidden');
        contentIndice.classList.add('hidden');
    }
    
    // 3. Limpa o display da capa/título e esconde a lista de capítulos (Índice)
    document.getElementById('tituloObraEdit').textContent = 'Nova História';
    
    // Define a capa padrão
    document.getElementById('capaObraEdit').src = DEFAULT_COVER; 
    
    // Oculta o painel do índice para uma nova obra, pois ainda não há capítulos.
    document.querySelector('.tabs-panel').style.minHeight = 'auto'; // Ajusta altura
    const indiceContent = document.getElementById('indice');
    if (indiceContent) {
        indiceContent.innerHTML = '<p style="color: #aaa; padding: 20px; text-align: center;">Salve os detalhes da história para adicionar capítulos.</p>';
        // Esconde o botão de novo capítulo no modo de criação
        const novoCapituloBtn = document.querySelector('.btn.novo-capitulo');
        if(novoCapituloBtn) novoCapituloBtn.style.display = 'none';
    }
    
    // 4. Limpa o formulário de detalhes (caso o browser tenha preenchido automaticamente)
    document.getElementById('detalhesForm').reset();
}


// -----------------------------------------------------------------
// FUNÇÃO PRINCIPAL: Carregar os dados da obra (e todos os capítulos)
// -----------------------------------------------------------------
function loadObraDetails(obraId) {
    const obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');
    const obra = obras.find(o => o.id === obraId);

    if (!obra) {
        alert("Erro: Obra não encontrada. Redirecionando para Minhas Obras.");
        window.location.href = '/Obras/obras.html';
        return;
    }

    // 1. ATUALIZAR CAPA E TÍTULO
    const capaElement = document.getElementById('capaObraEdit');
    const tituloElement = document.getElementById('tituloObraEdit'); 
    
    // CORRIGIDO: Garante que a capa salva (Base64 URL) seja carregada, ou a default
    capaElement.src = obra.capaUrl || DEFAULT_COVER; 
    
    // CORREÇÃO: Usa a função de truncagem para exibir o título na capa
    if (tituloElement) {
        tituloElement.textContent = truncateTitleForDisplay(obra.titulo);
    }

    // 2. PREENCHER O FORMULÁRIO DE DETALHES
    document.getElementById('tituloObraInput').value = obra.titulo || '';
    document.getElementById('sinopseObraInput').value = obra.sinopse || '';
    document.getElementById('tagsObraInput').value = obra.tags || '';
    document.getElementById('generoObraInput').value = obra.genero || '';
    
    let classificacaoValor = 'Livre';
    if (obra.classificacao && obra.classificacao.includes('+18')) {
        classificacaoValor = '+18';
    }
    document.getElementById('classificacaoObraInput').value = classificacaoValor;


    // 3. RENDERIZAR O ÍNDICE (CAPÍTULOS)
    const capituloLista = document.querySelector('.capitulo-lista');
    capituloLista.innerHTML = ''; 
    
    const capitulosKey = getCapitulosKey(obraId);
    const capitulosSalvos = JSON.parse(localStorage.getItem(capitulosKey) || '[]')
        .sort((a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao));

    if (capitulosSalvos.length > 0) {
        capitulosSalvos.forEach(cap => {
            capituloLista.appendChild(createCapituloItem(cap));
        });
    } else {
        // Se não houver capítulos, exibe uma mensagem ou apenas o botão "Novo Capítulo"
    }
}


// Função auxiliar para criar o HTML de um item do capítulo
function createCapituloItem(capitulo) {
    const item = document.createElement('div');
    item.classList.add('capitulo-item');
    item.setAttribute('data-cap-id', capitulo.id);
    item.onclick = () => abrirNovoCapitulo(capitulo.id);

    let statusClass = '';
    let statusText = '';
    
    const dataMeta = new Date(capitulo.dataSalva || capitulo.dataCriacao).toLocaleDateString('pt-BR');

    if (capitulo.status === 'Publicado') {
        statusClass = 'publicado';
        statusText = `Publicado · ${dataMeta}`;
    } else if (capitulo.status === 'Rascunho') {
        statusClass = 'rascunho';
        statusText = `Rascunho · Última Edição: ${dataMeta}`;
    } else {
        statusClass = ''; 
        statusText = `Não Iniciado · Data: ${dataMeta}`;
    }
    
    item.innerHTML = `
        <div class="handle"><i class="fas fa-grip-lines"></i></div>
        <div class="capitulo-info">
            <h3>${capitulo.titulo}</h3>
            <p class="meta ${statusClass}">${statusText}</p>
        </div>
        <div class="capitulo-stats">
            <p class="meta">${capitulo.stats}</p>
        </div>
        <button class="btn-options" title="Opções do Capítulo" onclick="event.stopPropagation(); abrirOpcoesCapitulo('${capitulo.id}')">
            <i class="fas fa-ellipsis-h"></i>
        </button>
    `;
    return item;
}

// -----------------------------------------------------------------
// FUNÇÃO: SALVAR CAPÍTULO (Rascunho ou Publicado)
// -----------------------------------------------------------------
function salvarCapitulo(status) {
    const obraId = getUrlParameter('obraId');
    const titulo = document.getElementById('chapterTitleInput').value.trim();
    const conteudo = document.getElementById('chapterContentTextarea').value;
    const capitulosKey = getCapitulosKey(obraId);
    let capitulosSalvos = JSON.parse(localStorage.getItem(capitulosKey) || '[]');

    if (!titulo && !conteudo) {
        alert("O capítulo está vazio. Adicione conteúdo ou título para salvar.");
        return;
    }
    
    const isNew = currentChapterId === 'NEW';
    const idParaSalvar = isNew ? `cap-${Date.now()}` : currentChapterId;

    const capituloData = {
        obraId: obraId,
        id: idParaSalvar,
        titulo: titulo || 'Novo Capítulo (Sem Título)',
        conteudo: conteudo,
        status: status,
        dataSalva: new Date().toISOString(),
        stats: `${updateWordCount(false)} palavras`
    };

    const existingIndex = capitulosSalvos.findIndex(cap => cap.id === idParaSalvar);

    if (existingIndex !== -1) {
        capituloData.dataCriacao = capitulosSalvos[existingIndex].dataCriacao;
        capitulosSalvos[existingIndex] = capituloData;
    } else {
        capituloData.dataCriacao = new Date().toISOString(); 
        capitulosSalvos.push(capituloData);
    }
    
    localStorage.setItem(capitulosKey, JSON.stringify(capitulosSalvos));
    
    const statusMessage = status === 'Publicado' 
        ? "Capítulo Publicado com sucesso! 🎉" 
        : "Rascunho salvo. Você pode continuar editando mais tarde.";
        
    alert(statusMessage);

    currentChapterId = null;
    fecharNovoCapitulo();
    loadObraDetails(obraId); 
}

// -----------------------------------------------------------------
// FUNÇÕES DE ABRIR/FECHAR MODAL
// -----------------------------------------------------------------

function abrirNovoCapitulo(chapterId = 'NEW') {
    const obraId = getUrlParameter('obraId');
    if (!obraId) {
        alert("Por favor, salve os detalhes da história antes de adicionar capítulos.");
        return;
    }

    const chapterModal = document.getElementById('chapterModal');
    const capitulosKey = getCapitulosKey(obraId);
    const capitulosSalvos = JSON.parse(localStorage.getItem(capitulosKey) || '[]');
    
    currentChapterId = chapterId; 

    document.getElementById('chapterTitleInput').value = '';
    document.getElementById('chapterContentTextarea').value = '';
    
    if (chapterId !== 'NEW' && chapterId.startsWith('cap-')) {
        const cap = capitulosSalvos.find(c => c.id === chapterId);
        if (cap) {
            document.getElementById('chapterTitleInput').value = cap.titulo || '';
            document.getElementById('chapterContentTextarea').value = cap.conteudo || '';
        }
    } 

    chapterModal.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 
    updateWordCount();
}

function fecharNovoCapitulo() {
    const chapterModal = document.getElementById('chapterModal');
    chapterModal.style.display = 'none'; 
    document.body.style.overflow = ''; 
    currentChapterId = null; 
}

// -----------------------------------------------------------------
// FUNÇÃO: SALVAR DETALHES DA OBRA (AGORA COM INCLUSÃO DE NOVA OBRA E CAPA)
// -----------------------------------------------------------------
function salvarDetalhes() {
    let obraId = getUrlParameter('obraId');
    
    const tituloInput = document.getElementById('tituloObraInput').value;
    const sinopse = document.getElementById('sinopseObraInput').value;
    const tags = document.getElementById('tagsObraInput').value;
    const genero = document.getElementById('generoObraInput').value;
    const classificacao = document.getElementById('classificacaoObraInput').value;
    
    // NOVO: Captura a URL da imagem atual exibida (Base64 ou caminho padrão)
    const capaElement = document.getElementById('capaObraEdit');
    const currentCapaSrc = capaElement.src;
    // Verifica se a capa é a padrão (usa window.location.origin para comparar caminho absoluto)
    const isDefaultCover = currentCapaSrc.includes(DEFAULT_COVER); 
    const capaUrlToSave = isDefaultCover ? null : currentCapaSrc; 

    if (!tituloInput || !sinopse) {
        alert("O Título e a Sinopse são obrigatórios.");
        return;
    }
    
    const tituloSalvo = enforceTitleLimit(tituloInput);

    let obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');
    const obraIndex = obras.findIndex(o => o.id === obraId);

    const classificacaoHtml = classificacao === '+18' 
        ? `<span style="color: #d32f2f; font-weight: 700;">+18</span>` 
        : `<span style="color: #43a047; font-weight: 700;">Livre</span>`;
        
    // --- LÓGICA DE INCLUSÃO DE NOVA OBRA ---
    if (!obraId || obraIndex === -1) {
        // Criar Novo ID e Objeto
        const novoId = Date.now().toString();
        const novaObra = {
            id: novoId,
            titulo: tituloSalvo,
            sinopse: sinopse,
            tags: tags,
            genero: genero,
            idioma: 'Português', // Assumindo padrão
            classificacao: classificacaoHtml,
            capitulo: '0', // Inicializa o contador de capítulos
            dataPublicacao: new Date().toLocaleDateString('pt-BR'),
            // Salva a capaUrl (Base64 ou null se for a padrão)
            capaUrl: capaUrlToSave 
        };
        
        obras.push(novaObra);
        localStorage.setItem(PUBLICADAS_KEY, JSON.stringify(obras));
        
        alert("Nova História criada com sucesso! Agora você pode adicionar capítulos.");
        
        // Redireciona para a mesma página, mas agora no modo EDIÇÃO da nova obra
        window.location.href = `../detalhesobras/detalhes.html?obraId=${novoId}`;
        return;

    // --- LÓGICA DE EDIÇÃO DE OBRA EXISTENTE ---
    } else {
        obras[obraIndex].titulo = tituloSalvo;
        obras[obraIndex].sinopse = sinopse;
        obras[obraIndex].tags = tags;
        obras[obraIndex].genero = genero;
        obras[obraIndex].classificacao = classificacaoHtml;
        // Atualiza a capaUrl para a imagem atualmente exibida
        obras[obraIndex].capaUrl = capaUrlToSave;
        
        localStorage.setItem(PUBLICADAS_KEY, JSON.stringify(obras));
        
        alert("Detalhes da História gravados com sucesso!");
        
        // Recarrega os detalhes para atualizar o display
        loadObraDetails(obraId); 
    }
}


function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm) {
        alert(`Pesquisando por: ${searchTerm}...`);
    }
}

function abrirOpcoesCapitulo(capId) {
    alert(`Opções do Capítulo ${capId}: Editar, Publicar/Despublicar, Excluir, Estatísticas...`);
}

function updateWordCount(updateDisplay = true) {
    const content = document.getElementById('chapterContentTextarea').value;
    const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    
    if (updateDisplay) {
        document.getElementById('wordCountDisplay').textContent = `${wordCount} palavras`;
    }
    return wordCount;
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.add('hidden'));

            button.classList.add('active');

            const contentToShow = document.getElementById(targetTab);
            if (contentToShow) {
                contentToShow.classList.remove('hidden');
            }
        });
    });
}

// --- Inicialização Modificada ---
document.addEventListener("DOMContentLoaded", () => {
    setupTabNavigation();
    const obraId = getUrlParameter('obraId');
    if (obraId) {
        // Modo Edição
        loadObraDetails(obraId);
    } else {
        // Modo Criação de Nova Obra
        setupNewObraMode();
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
