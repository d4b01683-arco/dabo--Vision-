/**
 * DV GLOBAL - MULTI-LANGUAGE SUPREME ENGINE v21.0
 * Con soporte completo para Español, Inglés, Francés, Portugués y Alemán.
 */

const KEYS = {
    tmdb: 'a6178823f5e2f865dfd88e8cade51391',
    trakt: 'e27de53be7675061564fde80a3b1e04443b22831627664ce1c8119476d959ca0'
};

const appContainer = document.getElementById('catalog-results');
let pageToken = 1;
let currentMode = 'home';
let perfilActual = null;
let idiomaActual = localStorage.getItem('dv_idioma') || 'es';

// DICCIONARIO DE TRADUCCIONES GLOBAL
const TRADUCCIONES = {
    es: {
        who: "¿Quién está viendo hoy?",
        addProfile: "Añadir Perfil",
        history: "Historial",
        mylist: "Mi Lista",
        searchPlaceholder: "Buscar título...",
        all: "Todo",
        action: "Acción",
        comedy: "Comedia",
        horror: "Terror",
        scifi: "Ciencia Ficción",
        animation: "Animación",
        loadingMore: "Cargando más contenido infinito...",
        back: "← Volver",
        cineMode: "Modo Cine",
        lightsOn: "Luces Encendidas",
        close: "✕ Cerrar",
        episodes: "Episodios disponibles:",
        playMovie: "▶ Reproducir Película Ahora",
        play: "Ver",
        searching: "Buscando...",
        historyTitle: "Historial / Continuar Viendo",
        favTitle: "Mi Lista de Favoritos",
        noHistory: "No tienes historial reciente en este perfil.",
        noFavs: "No tienes favoritos guardados en este perfil.",
        trending: "Tendencias Globales",
        nowPlaying: "Estrenos en Cartelera",
        popularTv: "Series Populares",
        moreContent: "Más Contenido"
    },
    en: {
        who: "Who's watching today?",
        addProfile: "Add Profile",
        history: "History",
        mylist: "My List",
        searchPlaceholder: "Search title...",
        all: "All",
        action: "Action",
        comedy: "Comedy",
        horror: "Horror",
        scifi: "Sci-Fi",
        animation: "Animation",
        loadingMore: "Loading more infinite content...",
        back: "← Back",
        cineMode: "Cinema Mode",
        lightsOn: "Lights On",
        close: "✕ Close",
        episodes: "Available episodes:",
        playMovie: "▶ Play Movie Now",
        play: "Watch",
        searching: "Searching...",
        historyTitle: "History / Continue Watching",
        favTitle: "My Favorites List",
        noHistory: "No recent history in this profile.",
        noFavs: "No favorites saved in this profile.",
        trending: "Global Trends",
        nowPlaying: "Now Playing in Theaters",
        popularTv: "Popular TV Shows",
        moreContent: "More Content"
    },
    fr: {
        who: "Qui regarde aujourd'hui ?",
        addProfile: "Ajouter un profil",
        history: "Historique",
        mylist: "Ma Liste",
        searchPlaceholder: "Rechercher un titre...",
        all: "Tout",
        action: "Action",
        comedy: "Comédie",
        horror: "Horreur",
        scifi: "Sci-Fi",
        animation: "Animation",
        loadingMore: "Chargement de plus de contenu...",
        back: "← Retour",
        cineMode: "Mode Cinéma",
        lightsOn: "Lumières allumées",
        close: "✕ Fermer",
        episodes: "Épisodes disponibles :",
        playMovie: "▶ Lire le film maintenant",
        play: "Regarder",
        searching: "Recherche...",
        historyTitle: "Historique / Continuer",
        favTitle: "Mes Favoris",
        noHistory: "Aucun historique récent dans ce profil.",
        noFavs: "Aucun favori enregistré dans ce profil.",
        trending: "Tendances Mondiales",
        nowPlaying: "Au Cinéma",
        popularTv: "Séries Populaires",
        moreContent: "Plus de Contenu"
    },
    pt: {
        who: "Quem está assistindo hoje?",
        addProfile: "Adicionar Perfil",
        history: "Histórico",
        mylist: "Minha Lista",
        searchPlaceholder: "Pesquisar título...",
        all: "Tudo",
        action: "Ação",
        comedy: "Comédia",
        horror: "Terror",
        scifi: "Ficção Científica",
        animation: "Animação",
        loadingMore: "Carregando mais conteúdo infinito...",
        back: "← Voltar",
        cineMode: "Modo Cinema",
        lightsOn: "Luzes Acesas",
        close: "✕ Fechar",
        episodes: "Episódios disponíveis:",
        playMovie: "▶ Reproduzir Filme Agora",
        play: "Assistir",
        searching: "Pesquisando...",
        historyTitle: "Histórico / Continuar Assistindo",
        favTitle: "Lista de Favoritos",
        noHistory: "Sem histórico recente neste perfil.",
        noFavs: "Sem favoritos salvos neste perfil.",
        trending: "Tendências Globais",
        nowPlaying: "Estreias nos Cinemas",
        popularTv: "Séries Populares",
        moreContent: "Mais Conteúdo"
    },
    de: {
        who: "Wer schaut heute?",
        addProfile: "Profil hinzufügen",
        history: "Verlauf",
        mylist: "Meine Liste",
        searchPlaceholder: "Titel suchen...",
        all: "Alle",
        action: "Action",
        comedy: "Komödie",
        horror: "Horror",
        scifi: "Sci-Fi",
        animation: "Animation",
        loadingMore: "Lade mehr unendliche Inhalte...",
        back: "← Zurück",
        cineMode: "Kino-Modus",
        lightsOn: "Licht an",
        close: "✕ Schließen",
        episodes: "Verfügbare Episoden:",
        playMovie: "▶ Film Jetzt Abspielen",
        play: "Ansehen",
        searching: "Suche...",
        historyTitle: "Verlauf / Weiterschauen",
        favTitle: "Meine Favoriten",
        noHistory: "Kein neuer Verlauf in diesem Profil.",
        noFavs: "Keine Favoriten in diesem Profil.",
        trending: "Globale Trends",
        nowPlaying: "Jetzt im Kino",
        popularTv: "Beliebte Serien",
        moreContent: "Mehr Inhalte"
    }
};

function t(key) {
    return TRADUCCIONES[idiomaActual][key] || TRADUCCIONES['es'][key] || key;
}

window.onload = async () => {
    aplicarTemaPorHora();
    document.getElementById('language-selector').value = idiomaActual;
    actualizarTextosInterfaz();
    verificarPerfiles();
};

function cambiarIdioma(nuevoLang) {
    idiomaActual = nuevoLang;
    localStorage.setItem('dv_idioma', nuevoLang);
    actualizarTextosInterfaz();
    location.reload(); // Recarga para aplicar traducciones en TMDB
}

function actualizarTextosInterfaz() {
    document.getElementById('txt-who-is-watching').innerText = t('who');
    document.getElementById('txt-add-profile').innerText = t('addProfile');
    document.getElementById('txt-history').innerText = t('history');
    document.getElementById('txt-mylist').innerText = t('mylist');
    document.getElementById('main-search').placeholder = t('searchPlaceholder');
    document.getElementById('btn-genre-all').innerText = t('all');
    document.getElementById('btn-genre-action').innerText = t('action');
    document.getElementById('btn-genre-comedy').innerText = t('comedy');
    document.getElementById('btn-genre-horror').innerText = t('horror');
    document.getElementById('btn-genre-scifi').innerText = t('scifi');
    document.getElementById('btn-genre-animation').innerText = t('animation');
    document.getElementById('txt-loading-more').innerText = t('loadingMore');
    document.getElementById('btn-back').innerText = t('back');
    document.getElementById('txt-close').innerText = t('close');
    document.getElementById('txt-episodes').innerText = t('episodes');
}

function aplicarTemaPorHora() {
    const hora = new Date().getHours();
    const body = document.body;
    const label = document.getElementById('time-theme-label');

    if (hora >= 6 && hora < 13) {
        body.classList.add('theme-morning');
        if(label) label.innerText = "DV GLOBAL - Morning Mode Active";
    } else if (hora >= 13 && hora < 20) {
        body.classList.add('theme-afternoon');
        if(label) label.innerText = "DV GLOBAL - Afternoon Mode Active";
    } else {
        body.classList.add('theme-night');
        if(label) label.innerText = "DV GLOBAL - Night Mode Active";
    }
}

// 1. GESTIÓN DE PERFILES
function obtenerPerfiles() {
    return JSON.parse(localStorage.getItem('dv_perfiles')) || [
        { id: '1', nombre: 'Creador', avatar: '👑' },
        { id: '2', nombre: 'Invitado', avatar: '🍿' }
    ];
}

function verificarPerfiles() {
    const perfilGuardado = localStorage.getItem('dv_perfil_activo');
    const perfiles = obtenerPerfiles();

    if (perfilGuardado) {
        perfilActual = JSON.parse(perfilGuardado);
        document.getElementById('profile-modal').classList.add('hidden');
        document.getElementById('current-profile-avatar').innerText = perfilActual.avatar;
        document.getElementById('current-profile-name').innerText = perfilActual.nombre;
        iniciarApp();
    } else {
        mostrarModalPerfiles(perfiles);
    }
}

function mostrarModalPerfiles(perfiles) {
    const grid = document.getElementById('profiles-grid');
    grid.innerHTML = perfiles.map(p => `
        <div onclick="seleccionarPerfil('${p.id}', '${p.nombre}', '${p.avatar}')" class="flex flex-col items-center gap-3 cursor-pointer group p-4 rounded-2xl hover:bg-white/5 transition-all">
            <div class="w-20 h-20 rounded-2xl bg-zinc-900 border-2 border-white/10 group-hover:border-cyan-400 flex items-center justify-center text-3xl shadow-xl transition-all">
                ${p.avatar}
            </div>
            <span class="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider">${p.nombre}</span>
        </div>
    `).join('');
}

function seleccionarPerfil(id, nombre, avatar) {
    perfilActual = { id, nombre, avatar };
    localStorage.setItem('dv_perfil_activo', JSON.stringify(perfilActual));
    document.getElementById('profile-modal').classList.add('hidden');
    document.getElementById('current-profile-avatar').innerText = avatar;
    document.getElementById('current-profile-name').innerText = nombre;
    iniciarApp();
}

function cambiarPerfilModal() {
    localStorage.removeItem('dv_perfil_activo');
    location.reload();
}

function crearNuevoPerfil() {
    const nombre = prompt(t('addProfile') + ":");
    if (!nombre) return;
    const avatares = ['🚀', '⚡', '🐉', '🐱', '🔥', '💎', '🎮', '🌟'];
    const avatar = avatares[Math.floor(Math.random() * avatares.length)];
    let perfiles = obtenerPerfiles();
    perfiles.push({ id: Date.now().toString(), nombre, avatar });
    localStorage.setItem('dv_perfiles', JSON.stringify(perfiles));
    mostrarModalPerfiles(perfiles);
}

// 2. INICIO Y SCROLL INFINITO
async function iniciarApp() {
    await cargarCatalogoPrincipal();
    
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            cargarMasContenidoInfinito();
        }
    });
}

async function cargarCatalogoPrincipal() {
    currentMode = 'home';
    appContainer.innerHTML = '';
    pageToken = 1;
    await cargarSeccionTMDB(t('historyTitle'), null, true);
    await cargarSeccionTMDB(t('trending'), "trending/all/day");
    await cargarSeccionTMDB(t('nowPlaying'), "movie/now_playing");
    await cargarSeccionTMDB(t('popularTv'), "tv/popular");
}

async function cargarMasContenidoInfinito() {
    if (currentMode !== 'home') return;
    const loader = document.getElementById('infinite-loader');
    if (!loader.classList.contains('hidden')) return;
    
    loader.classList.remove('hidden');
    pageToken++;
    
    await cargarSeccionTMDB(`${t('moreContent')} (Página ${pageToken})`, `movie/popular`, false, `&page=${pageToken}`);
    loader.classList.add('hidden');
}

// 3. BÚSQUEDA POR VOZ
function activarBusquedaVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition not supported.");
        return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = idiomaActual === 'es' ? 'es-ES' : idiomaActual === 'en' ? 'en-US' : idiomaActual === 'fr' ? 'fr-FR' : idiomaActual === 'pt' ? 'pt-BR' : 'de-DE';
    const voiceBtn = document.getElementById('voice-btn');
    voiceBtn.classList.add('text-cyan-400', 'animate-bounce');

    recognition.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        document.getElementById('main-search').value = texto;
        voiceBtn.classList.remove('text-cyan-400', 'animate-bounce');
        ejecutarBusqueda(texto);
    };

    recognition.onerror = recognition.onend = () => {
        voiceBtn.classList.remove('text-cyan-400', 'animate-bounce');
    };

    recognition.start();
}

document.getElementById('main-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarBusqueda(e.target.value);
});

async function ejecutarBusqueda(query) {
    if (!query) return;
    currentMode = 'search';
    appContainer.innerHTML = `<div class="py-20 text-center font-black animate-pulse uppercase tracking-[5px] accent-color">${t('searching')}</div>`;
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEYS.tmdb}&query=${query}&language=${idiomaActual}-${idiomaActual.toUpperCase()}`);
    const data = await res.json();
    appContainer.innerHTML = `<h2 class="text-white font-black mb-6 uppercase italic">${t('searching')} ${query}</h2><div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="search-grid"></div>`;
    data.results.forEach(m => {
        if (m.poster_path) {
            const tipo = m.media_type || (m.title ? 'movie' : 'tv');
            document.getElementById('search-grid').innerHTML += renderCard(m.id, m.title || m.name, `https://image.tmdb.org/t/p/w400${m.poster_path}`, tipo);
        }
    });
}

// 4. FILTROS Y RENDERIZADO
async function filtrarPorGenero(genreId, nombreGenero) {
    currentMode = 'genre';
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('bg-white/10', 'active-genre'));
    event.target.classList.add('bg-white/10', 'active-genre');

    if (genreId === 'all') {
        cargarCatalogoPrincipal();
        return;
    }

    appContainer.innerHTML = `<h2 class="text-white font-black mb-6 uppercase italic text-lg">Genre: ${nombreGenero}</h2><div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="genre-grid"></div>`;
    
    const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${KEYS.tmdb}&with_genres=${genreId}&language=${idiomaActual}-${idiomaActual.toUpperCase()}`);
    const data = await res.json();
    
    const grid = document.getElementById('genre-grid');
    data.results.forEach(m => {
        if (m.poster_path) {
            grid.innerHTML += renderCard(m.id, m.title, `https://image.tmdb.org/t/p/w400${m.poster_path}`, 'movie', m.vote_average?.toFixed(1));
        }
    });
}

async function cargarSeccionTMDB(titulo, path, isHistorial = false, extraParams = "") {
    if (isHistorial) {
        const historial = obtenerHistorial();
        if (historial.length === 0) return;
        renderFilaPersonalizada(titulo, historial);
        return;
    }

    try {
        const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${KEYS.tmdb}&language=${idiomaActual}-${idiomaActual.toUpperCase()}${extraParams}`);
        const data = await res.json();
        renderFila(titulo, data.results.map(m => ({ 
            id: m.id, 
            title: m.title || m.name, 
            img: `https://image.tmdb.org/t/p/w400${m.poster_path}`, 
            tipo: m.media_type || (path.includes('tv') ? 'tv' : 'movie'),
            vote: m.vote_average ? m.vote_average.toFixed(1) : null
        })));
    } catch (e) { console.error("Error:", titulo); }
}

function renderFila(titulo, items) {
    const section = document.createElement('div');
    section.className = "mb-10";
    section.innerHTML = `<h2 class="text-xs font-black uppercase tracking-[4px] italic ml-1 mb-4 opacity-90">${titulo}</h2><div class="flex gap-4 overflow-x-auto pb-4 scroll-hide px-1"></div>`;
    const row = section.querySelector('div');
    items.forEach(item => {
        if (item.img && !item.img.includes('null')) {
            row.innerHTML += renderCard(item.id, item.title, item.img, item.tipo, item.vote);
        }
    });
    appContainer.appendChild(section);
}

function renderFilaPersonalizada(titulo, items) {
    const section = document.createElement('div');
    section.className = "mb-10";
    section.innerHTML = `<h2 class="text-xs font-black uppercase tracking-[4px] italic ml-1 mb-4 text-cyan-400">${titulo}</h2><div class="flex gap-4 overflow-x-auto pb-4 scroll-hide px-1"></div>`;
    const row = section.querySelector('div');
    items.forEach(item => {
        row.innerHTML += renderCard(item.id, item.title, item.img, item.tipo, null, item.progress);
    });
    appContainer.appendChild(section);
}

function renderCard(id, title, poster, tipo, vote = null, progress = null) {
    const escapedTitle = (title || "").replace(/'/g, "\\'");
    const esFav = comprobarFavorito(id);

    return `
    <div class="movie-card min-w-[140px] md:min-w-[180px] h-[210px] md:h-[270px] bg-cover bg-center shadow-xl relative group overflow-hidden" style="background-image:url('${poster}')" onclick="gestionarSeleccion(${id}, '${tipo}')">
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            ${vote ? `<span class="text-[9px] bg-cyan-500/80 text-black font-black px-1.5 py-0.5 rounded w-fit mb-1">★ ${vote}</span>` : ''}
            <div class="text-[11px] font-bold truncate mb-2">${title}</div>
            <div class="flex gap-2" onclick="event.stopPropagation()">
                <button onclick="gestionarSeleccion(${id}, '${tipo}')" class="flex-1 accent-bg text-black text-[10px] font-black py-1.5 rounded-md uppercase">${t('play')}</button>
                <button onclick="toggleFavorito(event, ${id}, '${escapedTitle}', '${poster}', '${tipo}')" class="bg-white/20 hover:bg-white/40 px-2.5 py-1.5 rounded-md text-xs">
                    <i class="fa-${esFav ? 'solid text-red-500' : 'regular'} fa-heart"></i>
                </button>
            </div>
        </div>
        ${progress ? `<div class="absolute bottom-0 left-0 w-full h-1 bg-white/20"><div class="h-full bg-cyan-400" style="width: ${progress}%"></div></div>` : ''}
    </div>`;
}

// 5. HISTORIAL Y FAVORITOS
function obtenerHistorial() { 
    if (!perfilActual) return [];
    return JSON.parse(localStorage.getItem(`dv_historial_${perfilActual.id}`)) || []; 
}
function guardarHistorial(id, title, img, tipo) {
    if (!perfilActual) return;
    let hist = obtenerHistorial().filter(h => h.id !== id);
    hist.unshift({ id, title, img, tipo, progress: Math.floor(Math.random() * 60) + 20 });
    if (hist.length > 10) hist.pop();
    localStorage.setItem(`dv_historial_${perfilActual.id}`, JSON.stringify(hist));
}

function mostrarContinuarViendo() {
    currentMode = 'history';
    const hist = obtenerHistorial();
    appContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-white font-black uppercase italic text-lg">${t('historyTitle')}</h2>
            <button onclick="location.reload()" class="text-xs px-3 py-1.5 rounded-xl border border-white/10">${t('back')}</button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="hist-grid"></div>
    `;
    const grid = document.getElementById('hist-grid');
    if (hist.length === 0) {
        grid.innerHTML = `<p class="text-zinc-500 text-xs col-span-full">${t('noHistory')}</p>`;
        return;
    }
    hist.forEach(h => { grid.innerHTML += renderCard(h.id, h.title, h.img, h.tipo, null, h.progress); });
}

function obtenerFavoritos() { 
    if (!perfilActual) return [];
    return JSON.parse(localStorage.getItem(`dv_favoritos_${perfilActual.id}`)) || []; 
}
function comprobarFavorito(id) { return obtenerFavoritos().some(f => f.id === id); }

function toggleFavorito(event, id, title, img, tipo) {
    event.stopPropagation();
    if (!perfilActual) return;
    let favs = obtenerFavoritos();
    const index = favs.findIndex(f => f.id === id);
    if (index >= 0) favs.splice(index, 1);
    else favs.push({ id, title, img, tipo });
    localStorage.setItem(`dv_favoritos_${perfilActual.id}`, JSON.stringify(favs));
    location.reload();
}

function mostrarFavoritos() {
    currentMode = 'favorites';
    const favs = obtenerFavoritos();
    appContainer.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-white font-black uppercase italic text-lg">${t('favTitle')}</h2>
            <button onclick="location.reload()" class="text-xs px-3 py-1.5 rounded-xl border border-white/10">${t('back')}</button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="fav-grid"></div>
    `;
    const grid = document.getElementById('fav-grid');
    if (favs.length === 0) {
        grid.innerHTML = `<p class="text-zinc-500 text-xs col-span-full">${t('noFavs')}</p>`;
        return;
    }
    favs.forEach(f => { grid.innerHTML += renderCard(f.id, f.title, f.img, f.tipo); });
} '';
// Configuración de tu cuenta de Real-Debrid conectada a DV GLOBAL
const REAL_DEBRID_API_KEY = "PEGA_AQUÍ_TU_API_KEY_DE_REAL_DEBRID"; 

async function lanzarReproductor(id, tipo, s = 1, e = 1) {
    const selector = document.getElementById('server-selector');
    const videoRoot = document.getElementById('video-root');
    
    document.getElementById('player-view').classList.remove('hidden');
    document.getElementById('series-modal').classList.add('hidden');
    
    // Estado de carga inicial en los servidores
    selector.innerHTML = `<div class="text-xs text-cyan-400 p-2 animate-pulse">Sincronizando con tu nube Real-Debrid...</div>`;
    videoRoot.innerHTML = `<div class="flex items-center justify-center h-full text-zinc-500 text-xs">Cargando flujo privado...</div>`;

    try {
        // 1. Consultamos los torrents/archivos directamente desde la API REST de Real-Debrid
        const response = await fetch(`https://api.real-debrid.com/rest/1.0/torrents`, {
            headers: { "Authorization": `Bearer ${REAL_DEBRID_API_KEY}` }
        });
        const torrents = await response.json();

        if (!torrents || torrents.length === 0) {
            throw new Error("No hay torrents en la nube");
        }

        // 2. Tomamos los enlaces disponibles y generamos los botones de reproducción directa
        let servidoresHTML = '';
        let primerEnlaceValido = '';

        // Mostramos servidores por defecto (Latino/Castellano) y añadimos tus streams de Real-Debrid
        const servidoresBase = [
            { pais: "🇲🇽", nombre: "LATINO (Cloud)", url: tipo === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
            { pais: "🇪🇸", nombre: "CASTELLANO (Cloud)", url: tipo === 'movie' ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` }
        ];

        servidoresBase.forEach(serv => {
            servidoresHTML += `
                <button onclick="cambiarServidor('${serv.url}')" class="flex items-center gap-2 bg-zinc-900 border border-white/10 p-2 rounded-xl text-left hover:border-cyan-400 transition-all">
                    <span class="text-lg">${serv.pais}</span>
                    <div class="text-[10px] font-black uppercase">${serv.nombre}</div>
                </button>
            `;
        });

        // Si existen archivos en tu nube de Real-Debrid, los listamos como opciones directas de máxima calidad
        if (torrents.length > 0 && torrents[0].links && torrents[0].links.length > 0) {
            // Desbloqueamos el primer enlace de tu nube para tener reproducción inmediata
            const linkRestringido = torrents[0].links[0];
            const unrestrictRes = await fetch(`https://api.real-debrid.com/rest/1.0/unrestrict/link`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${REAL_DEBRID_API_KEY}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ "link": linkRestringido })
            });
            const unrestrictData = await unrestrictRes.json();
            if (unrestrictData.download) {
                primerEnlaceValido = unrestrictData.download;
                servidoresHTML += `
                    <button onclick="cambiarServidorDirecto('${unrestrictData.download}')" class="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/30 p-2 rounded-xl text-left hover:border-cyan-400 transition-all">
                        <span class="text-lg">⚡</span>
                        <div class="text-[10px] font-black uppercase text-cyan-400">Real-Debrid 4K / Multiaudio</div>
                    </button>
                `;
            }
        }

        selector.innerHTML = servidoresHTML;
        
        // Iniciamos por defecto con el primer servidor disponible
        cambiarServidor(servidoresBase[0].url);

    } catch (error) {
        console.error("Error al conectar con Real-Debrid:", error);
        // Fallback a servidores web si falla la API
        selector.innerHTML = `
            <button onclick="cambiarServidor('https://vidsrc.cc/v2/embed/movie/${id}')" class="bg-zinc-900 border border-white/10 p-2 rounded-xl text-left">
                <div class="text-[10px] font-black uppercase">Servidor Alternativo</div>
            </button>
        `;
        cambiarServidor(`https://vidsrc.cc/v2/embed/movie/${id}`);
    }
}

function cambiarServidor(url) {
    document.getElementById('video-root').innerHTML = `<iframe src="${url}" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
}

function cambiarServidorDirecto(urlVideo) {
    // Reproductor nativo HTML5 que permite la selección correcta de pistas de audio multilingüe
    document.getElementById('video-root').innerHTML = `
        <video controls autoplay class="w-full h-full object-contain bg-black">
            <source src="${urlVideo}" type="video/mp4">
            Tu navegador no soporta la reproducción de video directa.
        </video>
    `;
}


// Configuración de tu cuenta de Real-Debrid
const REAL_DEBRID_API_KEY = "TU_API_KEY_DE_REAL_DEBRID"; // Pega aquí tu token
const RD_BASE_URL = "https://api.real-debrid.com/rest/1.0";

// 1. Obtener la lista de torrents/archivos en tu nube de Real-Debrid
async function rdObtenerTorrents() {
    try {
        const response = await fetch(`${RD_BASE_URL}/torrents`, {
            headers: {
                "Authorization": `Bearer ${REAL_DEBRID_API_KEY}`
            }
        });
        if (!response.ok) throw new Error("Error al conectar con Real-Debrid");
        const torrents = await response.json();
        return torrents; // Devuelve la lista de tus archivos en la nube
    } catch (error) {
        console.error("Error en Real-Debrid:", error);
        return [];
    }
}

// 2. Obtener los enlaces de descarga/streaming directos de un torrent específico
async function rdObtenerEnlacesTorrent(torrentId) {
    try {
        const response = await fetch(`${RD_BASE_URL}/torrents/info/${torrentId}`, {
            headers: {
                "Authorization": `Bearer ${REAL_DEBRID_API_KEY}`
            }
        });
        const data = await response.json();
        return data.links; // Enlaces listos para reproducir
    } catch (error) {
        console.error("Error al obtener enlaces del torrent:", error);
        return [];
    }
}

// 3. Desbloquear/Generar el enlace final de streaming directo
async function rdDesbloquearEnlace(linkRestringido) {
    try {
        const formData = new URLSearchParams();
        formData.append("link", linkRestringido);

        const response = await fetch(`${RD_BASE_URL}/unrestrict/link`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${REAL_DEBRID_API_KEY}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });
        
        const data = await response.json();
        return data.download; // URL directa de video limpia (con soporte multiaudio)
    } catch (error) {
        console.error("Error al desbloquear el enlace:", error);
        return null;
    }
}
async function lanzarReproductorRealDebrid(torrentIdLink) {
    // 1. Desbloqueamos el enlace restringido de tu nube
    const enlaceDirecto = await rdDesbloquearEnlace(torrentIdLink);
    
    if (!enlaceDirecto) {
        alert("No se pudo cargar el archivo desde Real-Debrid.");
        return;
    }

    // 2. Mostramos el reproductor en la interfaz
    document.getElementById('player-view').classList.remove('hidden');
    document.getElementById('series-modal').classList.add('hidden');

    // 3. Inyectamos el archivo de video directo (este reproductor nativo sí permite cambiar de pista de audio si el archivo es multiaudio)
    document.getElementById('video-root').innerHTML = `
        <video controls autoplay class="w-full h-full object-contain bg-black">
            <source src="${enlaceDirecto}" type="video/mp4">
            Tu navegador no soporta la reproducción de video HTML5.
        </video>
    `;
}
