/**
 * DV GLOBAL - CORE ENGINE v4.0 (2026)
 * Multi-API: TMDB, Trakt, TVMaze
 * Multi-Audio: Latino, Castellano, English, Français
 */

const KEYS = {
    tmdb: 'a6178823f5e2f865dfd88e8cade51391',
    trakt: 'e27de53be7675061564fde80a3b1e04443b22831627664ce1c8119476d959ca0'
};

const appContainer = document.getElementById('catalog-results');

window.onload = async () => {
    // Orden de carga inicial
    await cargarSeccionTrakt("Tendencias Mundiales", "movies/trending");
    await cargarSeccionTMDB("Estrenos", "movie/now_playing");
    await cargarSeccionTVMaze("Animes & Series Japonesas", "anime");
    await cargarSeccionTMDB("Acción", "discover/movie", "&with_genres=28");
    await cargarSeccionTMDB("Terror", "discover/movie", "&with_genres=27");
    await cargarSeccionTMDB("Ciencia Ficción", "discover/movie", "&with_genres=878");
};

// --- MOTOR DE BÚSQUEDA ---
document.getElementById('main-search').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value;
        if (!query) return;
        
        appContainer.innerHTML = `<div class="py-20 text-center text-cyan-400 font-black animate-pulse uppercase tracking-[5px]">Buscando...</div>`;
        
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEYS.tmdb}&query=${query}&language=es-ES`);
        const data = await res.json();
        
        appContainer.innerHTML = `<h2 class="text-white font-black mb-10 uppercase italic tracking-widest">Resultados: ${query}</h2>
                                  <div class="grid grid-cols-2 md:grid-cols-5 gap-6" id="search-grid"></div>`;
        
        data.results.forEach(m => {
            if (m.poster_path) {
                const tipo = m.media_type || (m.title ? 'movie' : 'tv');
                document.getElementById('search-grid').innerHTML += renderCard(m.id, m.title || m.name, m.poster_path, tipo, false);
            }
        });
    }
});

// --- CARGADORES DE API ---

async function cargarSeccionTMDB(titulo, path, params = "") {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${KEYS.tmdb}&language=es-ES${params}`);
    const data = await res.json();
    renderFila(titulo, data.results.map(m => ({
        id: m.id,
        title: m.title || m.name,
        img: m.poster_path,
        tipo: m.media_type || (path.includes('movie') ? 'movie' : 'tv')
    })));
}

async function cargarSeccionTrakt(titulo, endpoint) {
    try {
        const res = await fetch(`https://api.trakt.tv/${endpoint}`, {
            headers: { 'Content-Type': 'application/json', 'trakt-api-version': '2', 'trakt-api-key': KEYS.trakt }
        });
        const data = await res.json();
        const items = data.slice(0, 10).map(entry => ({
            id: entry.movie ? entry.movie.ids.tmdb : entry.show.ids.tmdb,
            title: entry.movie ? entry.movie.title : entry.show.title,
            tipo: entry.movie ? 'movie' : 'tv',
            needsImg: true
        }));
        renderFila(titulo, items);
    } catch (e) { console.error("Trakt Offline"); }
}

async function cargarSeccionTVMaze(titulo, query) {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
    const data = await res.json();
    renderFila(titulo, data.map(i => ({
        id: i.show.externals.thetvdb || i.show.id,
        title: i.show.name,
        img: i.show.image ? i.show.image.medium : null,
        tipo: 'tv',
        isFullUrl: true
    })));
}

// --- RENDERIZADO ---

function renderFila(titulo, items) {
    const section = document.createElement('div');
    section.className = "mb-14";
    section.innerHTML = `<h2 class="text-[10px] font-black uppercase text-cyan-400 mb-6 tracking-[6px] italic ml-2">${titulo}</h2>
                         <div class="flex gap-5 overflow-x-auto pb-8 scroll-hide px-2"></div>`;
    
    const row = section.querySelector('div');
    items.forEach(async item => {
        let poster = item.isFullUrl ? item.img : `https://image.tmdb.org/t/p/w400${item.img}`;
        
        if (item.needsImg) {
            const r = await fetch(`https://api.themoviedb.org/3/${item.tipo}/${item.id}?api_key=${KEYS.tmdb}`);
            const d = await r.json();
            poster = `https://image.tmdb.org/t/p/w400${d.poster_path}`;
        }
        
        if (poster && !poster.includes('null')) {
            row.innerHTML += renderCard(item.id, item.title, poster, item.tipo, true);
        }
    });
    appContainer.appendChild(section);
}

function renderCard(id, title, img, tipo, isImgReady) {
    const poster = isImgReady ? img : `https://image.tmdb.org/t/p/w400${img}`;
    return `<div class="movie-card min-w-[165px] md:min-w-[195px] h-[245px] md:h-[290px] bg-cover bg-center shadow-2xl relative group overflow-hidden" 
                 onclick="gestionarSeleccion(${id}, '${tipo}')" 
                 style="background-image:url('${poster}')">
                 <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span class="text-[9px] font-bold uppercase tracking-widest text-cyan-400">Reproducir</span>
                 </div>
            </div>`;
}

// --- LÓGICA DE SERIES ---

function gestionarSeleccion(id, tipo) {
    if (tipo === 'tv' || tipo === 'show') {
        abrirModalSerie(id);
    } else {
        lanzarReproductor(id, 'movie');
    }
}

async function abrirModalSerie(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${KEYS.tmdb}&language=es-ES`);
    const data = await res.json();
    
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('modal-desc').innerText = data.overview || "No hay descripción disponible para este título.";
    
    const seasonsDiv = document.getElementById('seasons-container');
    seasonsDiv.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 hover:border-cyan-500 hover:bg-cyan-500/10 cursor-pointer text-center transition-all group" 
             onclick="cargarEpisodios(${id}, ${s.season_number})">
            <span class="text-[10px] font-black uppercase italic group-hover:text-white text-gray-400">${s.name}</span>
        </div>
    `).join('');
    
    document.getElementById('series-modal').classList.remove('hidden');
    document.getElementById('episodes-container').classList.add('hidden');
}

async function cargarEpisodios(id, sNum) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${KEYS.tmdb}&language=es-ES`);
    const data = await res.json();
    
    const list = document.getElementById('episodes-list');
    list.innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 cursor-pointer group transition-all" 
             onclick="lanzarReproductor(${id}, 'tv', ${sNum}, ${e.episode_number})">
            <span class="text-xs italic font-medium"><b class="text-cyan-400 mr-3">${e.episode_number}</b> ${e.name}</span>
            <div class="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <i class="fas fa-play text-[10px] text-cyan-400"></i>
            </div>
        </div>
    `).join('');
    
    document.getElementById('episodes-container').classList.remove('hidden');
}

// --- REPRODUCTOR MULTI-AUDIO (REVISADO) ---

function lanzarReproductor(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    const serverSelector = document.getElementById('server-selector');
    document.getElementById('player-view').classList.remove('hidden');

    // Estos servidores son los que actualmente permiten cambiar audio (Latino/ES/EN/FR)
    const servidores = [
        { 
            nombre: "Opción 1 (Multi-Audio)", 
            url: tipo === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${s}/${e}` 
        },
        { 
            nombre: "Opción 2 (Latino/ES)", 
            url: tipo === 'movie' ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` 
        },
        { 
            nombre: "Opción 3 (Global)", 
            url: tipo === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}` : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` 
        }
    ];

    serverSelector.innerHTML = servidores.map(serv => `
        <button onclick="cambiarServidor('${serv.url}')" class="bg-white/5 border border-white/10 hover:bg-cyan-500 text-[8px] font-black px-4 py-2 rounded-full uppercase transition-all tracking-tighter">
            ${serv.nombre}
        </button>
    `).join('');

    cambiarServidor(servidores[0].url);
}

function cambiarServidor(url) {
    const root = document.getElementById('video-root');
    // IMPORTANTE: Se elimina sandbox para que carguen los menús de audio y subtítulos
    root.innerHTML = `<iframe 
        src="${url}" 
        style="width:100%; height:100%; border:none; background:#000;" 
        allowfullscreen 
        allow="autoplay; encrypted-media; fullscreen" 
        referrerpolicy="no-referrer">
    </iframe>`;
}

// --- CIERRE ---

function cerrarPlayer() { 
    document.getElementById('player-view').classList.add('hidden'); 
    document.getElementById('video-root').innerHTML = ''; 
}

function cerrarModalSeries() { 
    document.getElementById('series-modal').classList.add('hidden'); 
}

function togglePrivacy(show) {
    const m = document.getElementById('privacy-modal');
    if (m) show ? m.classList.remove('hidden') : m.classList.add('hidden');
}
