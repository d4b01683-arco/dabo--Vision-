const KEYS = {
    tmdb: 'a6178823f5e2f865dfd88e8cade51391',
    trakt: 'e27de53be7675061564fde80a3b1e04443b22831627664ce1c8119476d959ca0'
};

const catalog = document.getElementById('catalog-results');

window.onload = () => {
    inicializarApp();
};

async function inicializarApp() {
    // 1. Tendencias Mundiales (Trakt.tv)
    await cargarSeccionTrakt("Tendencias Mundiales", "movies/trending");
    // 2. Estrenos (TMDB)
    await cargarSeccionTMDB("Estrenos en Cine", "movie/now_playing");
    // 3. Anime (TVMaze)
    await cargarSeccionTVMaze("Lo último en Anime", "anime");
    // 4. Géneros (TMDB)
    await cargarSeccionTMDB("Terror & Suspenso", "discover/movie", "&with_genres=27");
    await cargarSeccionTMDB("Ciencia Ficción", "discover/movie", "&with_genres=878");
}

// --- MOTOR DE BÚSQUEDA ---
document.getElementById('main-search').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const q = e.target.value;
        if (!q) return;
        catalog.innerHTML = `<h2 class="text-cyan-400 font-black italic">BUSCANDO: ${q}...</h2>`;
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEYS.tmdb}&query=${q}&language=es-ES`);
        const data = await res.json();
        
        catalog.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-5 gap-6">`;
        data.results.forEach(m => {
            if (m.poster_path) {
                catalog.innerHTML += renderCard(m.id, m.title || m.name, m.poster_path, m.media_type, false);
            }
        });
        catalog.innerHTML += `</div>`;
    }
});

// --- CARGADORES DE API ---
async function cargarSeccionTMDB(titulo, path, params = "") {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${KEYS.tmdb}&language=es-ES${params}`);
    const data = await res.json();
    renderFila(titulo, data.results.map(m => ({ id: m.id, title: m.title || m.name, img: m.poster_path, tipo: m.media_type || (path.includes('movie') ? 'movie' : 'tv') })));
}

async function cargarSeccionTrakt(titulo, endpoint) {
    try {
        const res = await fetch(`https://api.trakt.tv/${endpoint}`, { headers: { 'trakt-api-version': '2', 'trakt-api-key': KEYS.trakt } });
        const data = await res.json();
        const items = await Promise.all(data.slice(0, 10).map(async (entry) => {
            const id = entry.movie ? entry.movie.ids.tmdb : entry.show.ids.tmdb;
            return { id, title: "", img: null, tipo: entry.movie ? 'movie' : 'tv', needsImg: true };
        }));
        renderFila(titulo, items);
    } catch (e) { console.error("Trakt Error"); }
}

async function cargarSeccionTVMaze(titulo, query) {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
    const data = await res.json();
    renderFila(titulo, data.map(i => ({ id: i.show.externals.thetvdb || i.show.id, title: i.show.name, img: i.show.image ? i.show.image.medium : null, tipo: 'tv', isFullUrl: true })));
}

// --- RENDERIZADO ---
function renderFila(titulo, items) {
    const container = document.createElement('div');
    container.className = "mb-10";
    container.innerHTML = `<h2 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[5px] italic">${titulo}</h2>
                           <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide"></div>`;
    
    const row = container.querySelector('div');
    items.forEach(async item => {
        let poster = item.isFullUrl ? item.img : `https://image.tmdb.org/t/p/w400${item.img}`;
        if (item.needsImg) {
            const r = await fetch(`https://api.themoviedb.org/3/${item.tipo}/${item.id}?api_key=${KEYS.tmdb}`);
            const d = await r.json();
            poster = `https://image.tmdb.org/t/p/w400${d.poster_path}`;
        }
        if (poster) row.innerHTML += renderCard(item.id, item.title, poster, item.tipo, true);
    });
    catalog.appendChild(container);
}

function renderCard(id, title, img, tipo, isImgReady) {
    const poster = isImgReady ? img : `https://image.tmdb.org/t/p/w400${img}`;
    return `<div class="movie-card min-w-[150px] md:min-w-[180px] h-[230px] md:h-[270px] bg-cover bg-center" 
                 onclick="identificarContenido(${id}, '${tipo}')" 
                 style="background-image:url('${poster}')">
            </div>`;
}

// --- LÓGICA DE RECONOCIMIENTO (SERIE VS PELÍCULA) ---
function identificarContenido(id, tipo) {
    if (tipo === 'tv' || tipo === 'show') {
        abrirEstructuraSerie(id);
    } else {
        lanzarReproductor(id, 'movie');
    }
}

async function abrirEstructuraSerie(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${KEYS.tmdb}&language=es-ES`);
    const data = await res.json();
    
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('modal-desc').innerText = data.overview || "Sin descripción disponible.";
    
    const seasonsDiv = document.getElementById('seasons-container');
    seasonsDiv.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-cyan-400/20 cursor-pointer text-center" 
             onclick="cargarEpisodios(${id}, ${s.season_number})">
            <span class="text-xs font-black italic uppercase">${s.name}</span>
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
        <div class="bg-white/5 p-4 rounded-lg flex justify-between items-center hover:bg-white/10 cursor-pointer group" 
             onclick="lanzarReproductor(${id}, 'tv', ${sNum}, ${e.episode_number})">
            <span class="text-xs font-medium italic"><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play-circle text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </div>
    `).join('');
    
    document.getElementById('episodes-container').classList.remove('hidden');
    list.scrollIntoView({ behavior: 'smooth' });
}

// --- REPRODUCTOR FINAL ---
function lanzarReproductor(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    document.getElementById('player-view').classList.remove('hidden');
    
    const url = tipo === 'movie' 
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}` 
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
    
    root.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;" 
                        allowfullscreen allow="autoplay; encrypted-media" referrerpolicy="no-referrer"></iframe>`;
}

// --- UTILIDADES ---
function cerrarPlayer() { document.getElementById('player-view').classList.add('hidden'); document.getElementById('video-root').innerHTML = ''; }
function cerrarModalSeries() { document.getElementById('series-modal').classList.add('hidden'); }
function togglePrivacy(show) { /* Tu lógica de privacidad */ }
