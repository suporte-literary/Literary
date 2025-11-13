// VARIÁVEIS DO DOM
const tituloObraInput = document.getElementById('tituloObra');
const sinopseObraInput = document.getElementById('sinopseObra');
const capaObraInput = document.getElementById('capaObra');
const capaPreview = document.getElementById('capaPreview');
const capaPlaceholder = document.getElementById('coverPlaceholder');

const tagsObraInput = document.getElementById('tagsObra');
const generoObraSelect = document.getElementById('generoObra');
const idiomaObraSelect = document.getElementById('idiomaObra');

const tituloCapituloInput = document.getElementById('tituloCapitulo');
const textoCapitulo = document.getElementById('textoCapitulo');
const contador = document.getElementById('contador');

const etapaObra = document.getElementById('etapa-obra');
const etapaCapitulo = document.getElementById('etapa-capitulo');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');

// CHAVES DE ARMAZENAMENTO
const RASCUNHO_KEY = 'rascunho_obra_completa';
const PUBLICADAS_KEY = 'literary_obras_publicadas'; 

let capaBase64 = null; // Armazenar a capa lida

// --- FUNÇÕES DE UTILIDADE ---

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 1. Atualiza o contador de palavras (Etapa 2)
function updateWordCount() {
    const palavras = textoCapitulo.value.trim().split(/\s+/).filter(p => p !== "");
    contador.textContent = palavras.length;
}

// Função de salvamento silencioso para INPUTS
function autoSalvarRascunho() {
    salvarRascunho(false);
}

// --- FUNÇÕES DE NAVEGAÇÃO ENTRE ETAPAS ---

function avancarEtapa() {
    // MODO: NOVA OBRA - Faz a validação normal
    const titulo = tituloObraInput.value.trim();
    const sinopse = sinopseObraInput.value.trim();
    const tags = tagsObraInput.value.trim();
    const genero = generoObraSelect.value;
    const idioma = idiomaObraSelect.value;
    
    // O valor da classificação é pego dentro do getObraData, mas a presença é obrigatória
    const classificacao = document.querySelector('input[name="classificacao"]:checked');

    if (!titulo || !sinopse || !tags || !genero || !idioma || !classificacao) {
        alert("Por favor, preencha o Título, Sinopse, Tags, Gênero, Idioma e Classificação antes de avançar.");
        return;
    }

    const tagList = tags.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tagList.length > 10) {
        alert(`O limite máximo de 10 tags foi excedido. Você inseriu ${tagList.length} tags.`);
        return;
    }
    
    // Salva o rascunho da nova obra antes de avançar
    salvarRascunho(false);
    
    // 2. Mudança Visual para Etapa 2
    etapaObra.classList.add('hidden');
    etapaCapitulo.classList.remove('hidden');
    step1.classList.remove('active');
    step2.classList.add('active');
    window.scrollTo(0, 0); 
}

function voltarEtapa() {
    // MODO: NOVA OBRA - Volta para a Etapa 1
    etapaObra.classList.remove('hidden');
    etapaCapitulo.classList.add('hidden');
    step1.classList.add('active');
    step2.classList.remove('active');
    window.scrollTo(0, 0); 
}

// --- FUNÇÕES DE UPLOAD DE CAPA ---

capaObraInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            capaPreview.src = e.target.result;
            capaPreview.style.display = 'block';
            capaPlaceholder.querySelector('i').style.display = 'none';
            capaPlaceholder.querySelector('span').style.display = 'none';
            capaBase64 = e.target.result;
            autoSalvarRascunho(); 
        };
        reader.readAsDataURL(file);
    }
});


// --- FUNÇÕES DE DADOS E PERSISTÊNCIA ---

// 2. Monta o objeto de dados
function getObraData() {
    const classificacaoElement = document.querySelector('input[name="classificacao"]:checked');
    const classificacao = classificacaoElement ? classificacaoElement.value : 'Livre';

    return {
        // ID gerado aqui, mas será substituído na publicação
        id: Date.now().toString(), 
        tituloObra: tituloObraInput.value.trim(),
        sinopseObra: sinopseObraInput.value.trim(),
        tagsObra: tagsObraInput.value.trim(),
        generoObra: generoObraSelect.value,
        idiomaObra: idiomaObraSelect.value,
        classificacaoObra: classificacao,
        capaBase64: capaBase64,
        tituloCapitulo: tituloCapituloInput.value.trim(),
        conteudoCapitulo: textoCapitulo.value.trim()
    };
}

// 3. Salva o rascunho no localStorage
function salvarRascunho(showSuccessAlert = true) {
    const data = getObraData();
    
    localStorage.setItem(RASCUNHO_KEY, JSON.stringify(data));
    if (showSuccessAlert) {
        alert("Rascunho da obra salvo com sucesso! Você será redirecionado para a tela de Rascunhos.");
        window.location.href = '/Rascunhos/rascunhos.html'; 
    }
}

// 4. Carrega o rascunho ao iniciar
function carregarRascunho() {
    const rascunhoSalvo = localStorage.getItem(RASCUNHO_KEY);
    if (rascunhoSalvo) {
        try {
            const data = JSON.parse(rascunhoSalvo);
            
            // Preenche Etapa 1
            tituloObraInput.value = data.tituloObra || '';
            sinopseObraInput.value = data.sinopseObra || '';
            tagsObraInput.value = data.tagsObra || ''; 
            generoObraSelect.value = data.generoObra || ''; 
            idiomaObraSelect.value = data.idiomaObra || ''; 
            const classificacaoSalva = data.classificacaoObra || 'Livre';
            const radioId = classificacaoSalva === '+18' ? 'maior18' : 'livre'; 
            document.getElementById(radioId).checked = true; 
            
            // Preenche Etapa 2
            tituloCapituloInput.value = data.tituloCapitulo || '';
            textoCapitulo.value = data.conteudoCapitulo || '';
            capaBase64 = data.capaBase64 || null;
            if (capaBase64) {
                capaPreview.src = capaBase64;
                capaPreview.style.display = 'block';
                capaPlaceholder.querySelector('i').style.display = 'none';
                capaPlaceholder.querySelector('span').style.display = 'none';
            }

            updateWordCount();
            
            // Avança para a etapa 2 se houver conteúdo de capítulo
            if (data.tituloCapitulo || data.conteudoCapitulo) {
                etapaObra.classList.add('hidden');
                step1.classList.remove('active');
                etapaCapitulo.classList.remove('hidden');
                step2.classList.add('active');
            }
        } catch (e) {
            console.error("Erro ao carregar rascunho:", e);
            localStorage.removeItem(RASCUNHO_KEY);
        }
    }
}


// 5. Publica a obra
function publicarObra() {
    const data = getObraData();

    if (!data.tituloCapitulo || !data.conteudoCapitulo) {
        alert("Preencha o Título e o Conteúdo do Capítulo antes de publicar!");
        return;
    }
    
    // Re-valida a Etapa 1
    if (!data.tituloObra || !data.sinopseObra || !data.tagsObra || !data.generoObra || !data.idiomaObra) {
        voltarEtapa(); 
        alert("Por favor, preencha todos os Detalhes da Obra antes de publicar!");
        return;
    }

    const tagList = data.tagsObra.split(/[,;]/).map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tagList.length > 10) {
        voltarEtapa();
        alert(`O limite máximo de 10 tags foi excedido. Você inseriu ${tagList.length} tags.`);
        return;
    }

    // Publica a Nova Obra (incluindo o primeiro capítulo)
    const publicouComSucesso = window.adicionarObraPublicada(data);

    if (publicouComSucesso) {
        const novaObraId = publicouComSucesso; // A função deve retornar o ID da nova obra se for bem-sucedida

        localStorage.removeItem(RASCUNHO_KEY);
        alert(`Obra "${data.tituloObra}" - Capítulo: "${data.tituloCapitulo}" publicado com sucesso! Você será redirecionado para Detalhes da Obra.`);
        
        // Limpa (opcional, pois será redirecionado)
        tituloObraInput.value = ""; sinopseObraInput.value = ""; tagsObraInput.value = ""; 
        generoObraSelect.value = ""; idiomaObraSelect.value = ""; 
        document.getElementById('livre').checked = true; 
        tituloCapituloInput.value = ""; textoCapitulo.value = "";
        capaBase64 = null; 
        updateWordCount();
        
        // Redireciona para Detalhes da Obra (fluxo mais natural)
        window.location.href = `/detalhesobras/detalhes.html?obraId=${novaObraId}`;
    } else {
        alert("Houve um erro ao publicar a obra.");
    }
}

// IMPORTANTE: Sua função window.adicionarObraPublicada (ajustada para retornar o ID)
window.adicionarObraPublicada = function(data) {
    const obras = JSON.parse(localStorage.getItem(PUBLICADAS_KEY) || '[]');
    const newObraId = Date.now().toString(); // Gerar o ID aqui

    const classificacaoTexto = data.classificacaoObra === '+18' 
        ? `<span style="color: #d32f2f; font-weight: 700;">+18</span>` 
        : `<span style="color: #43a047; font-weight: 700;">Livre</span>`; 

    const novaObra = {
        id: newObraId,
        titulo: data.tituloObra,
        sinopse: data.sinopseObra,
        tags: data.tagsObra, 
        genero: data.generoObra, 
        idioma: data.idiomaObra, 
        classificacao: classificacaoTexto, 
        // Conteúdo do primeiro capítulo salvo em uma key de capítulos (necessário para detalhes.js)
        dataPublicacao: new Date().toLocaleDateString('pt-BR'),
        capaUrl: data.capaBase64 || '/site/IMG/Capa_Design-do-Livro-Infantil-Ilustrado.jpg'
    };
    obras.push(novaObra);
    localStorage.setItem(PUBLICADAS_KEY, JSON.stringify(obras));

    // Salvar o primeiro capítulo separadamente (necessário para detalhes.js)
    const primeiroCapitulo = [{
        id: `cap-${newObraId}`,
        obraId: newObraId,
        titulo: data.tituloCapitulo,
        conteudo: data.conteudoCapitulo,
        status: 'Publicado',
        dataCriacao: new Date().toISOString(),
        dataSalva: new Date().toISOString(),
        stats: `${data.conteudoCapitulo.trim().split(/\s+/).filter(p => p !== "").length} palavras`
    }];
    localStorage.setItem(`literary_capitulos_obra_${newObraId}`, JSON.stringify(primeiroCapitulo));

    return newObraId; // Retorna o ID da nova obra
};


// --- INICIALIZAÇÃO E CONTROLE DE FLUXO ---

window.addEventListener('load', () => {
    // Esta página agora é SÓ para Nova Obra.
    document.querySelector('.stepper').classList.remove('hidden');
    carregarRascunho(); 
});

// Outros Listeners (Mantidos)
tituloObraInput.addEventListener('input', autoSalvarRascunho);
sinopseObraInput.addEventListener('input', autoSalvarRascunho);
tagsObraInput.addEventListener('input', autoSalvarRascunho); 
generoObraSelect.addEventListener('change', autoSalvarRascunho); 
idiomaObraSelect.addEventListener('change', autoSalvarRascunho); 
document.querySelectorAll('input[name="classificacao"]').forEach(radio => {
    radio.addEventListener('change', autoSalvarRascunho); 
});

tituloCapituloInput.addEventListener('input', autoSalvarRascunho);
textoCapitulo.addEventListener('input', () => {
    updateWordCount();
    autoSalvarRascunho();
});

// Funções globais (Mantidas)
window.avancarEtapa = avancarEtapa;
window.voltarEtapa = voltarEtapa;
window.salvarRascunho = salvarRascunho;
window.publicarObra = publicarObra;
window.performSearch = performSearch;

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (searchTerm === "") {
        alert("Digite algo para pesquisar!");
        return;
    }
    alert(`Pesquisando por: ${searchTerm}. Você será redirecionado para a página de resultados.`);
}