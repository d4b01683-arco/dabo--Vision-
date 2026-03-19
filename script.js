/**
 * DV GLOBAL - ULTIMATE HYBRID ENGINE v9.0
 * Database: videos.json + TMDB + Trakt + TVMaze
 */

const KEYS = {
    tmdb: 'a6178823f5e2f865dfd88e8cade51391',
    trakt: 'e27de53be7675061564fde80a3b1e04443b22831627664ce1c8119476d959ca0'
};

let DB_PROPIA = [];
const appContainer = document.getElementById('catalog-results');

// 1. CARGAR TODO AL INICIAR
window.onload = async () => {
    await cargarBaseDatos();
    await cargarSeccionTrakt("Tendencias Globales", "movies/trending");
    await cargarSeccionTMDB("Estrenos en Cine", "movie/now_playing");
    await cargarSeccionTVMaze("Series & Anime", "anime");
    await cargarSeccionTMDB("Terror", "discover/movie", "&with_genres=27");
};

async function cargarBaseDatos() {
    try {
        const response = await fetch('videos.json');
        const data = await response.json();
        DB_PROPIA = data.manual_database || [];
    } catch (e) { console.warn("Iniciando sin videos.json local."); }
}

// 2. BUSCADOR INTELIGENTE
document.getElementById('main-search').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value;
        if (!query) return;
        appContainer.innerHTML = `<div class="py-20 text-center text-cyan-400 font-black animate-pulse uppercase tracking-[5px]">Buscando...</div>`;
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEYS.tmdb}&query=${query}&language=es-ES`);
        const data = await res.json();
        appContainer.innerHTML = `<h2 class="text-white font-black mb-10 uppercase italic">Resultados: ${query}</h2><div class="grid grid-cols-2 md:grid-cols-5 gap-6" id="search-grid"></div>`;
        data.results.forEach(m => {
            if (m.poster_path) {
                const tipo = m.media_type || (m.title ? 'movie' : 'tv');
                document.getElementById('search-grid').innerHTML += renderCard(m.id, m.title || m.name, m.poster_path, tipo, false);
            }
        });
    }
});

// 3. CARGADORES DE API (TMDB, TRAKT, TVMAZE)
async function cargarSeccionTMDB(titulo, path, params = "") {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${KEYS.tmdb}&language=es-ES${params}`);
    const data = await res.json();
    renderFila(titulo, data.results.map(m => ({ id: m.id, title: m.title || m.name, img: m.poster_path, tipo: m.media_type || (path.includes('movie') ? 'movie' : 'tv') })));
}

async function cargarSeccionTrakt(titulo, endpoint) {
    try {
        const res = await fetch(`https://api.trakt.tv/${endpoint}`, { headers: { 'trakt-api-version': '2', 'trakt-api-key': KEYS.trakt } });
        const data = await res.json();
        renderFila(titulo, data.slice(0, 10).map(entry => ({ id: entry.movie ? entry.movie.ids.tmdb : entry.show.ids.tmdb, tipo: entry.movie ? 'movie' : 'tv', needsImg: true })));
    } catch (e) { console.error("Trakt no responde."); }
}

async function cargarSeccionTVMaze(titulo, query) {
    const res = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
    const data = await res.json();
    renderFila(titulo, data.map(i => ({ id: i.show.externals.thetvdb || i.show.id, title: i.show.name, img: i.show.image ? i.show.image.medium : null, tipo: 'tv', isFullUrl: true })));
}

// 4. RENDERIZADO DE INTERFAZ
function renderFila(titulo, items) {
    const section = document.createElement('div');
    section.className = "mb-14";
    section.innerHTML = `<h2 class="text-[10px] font-black uppercase text-cyan-400 mb-6 tracking-[6px] italic ml-2">${titulo}</h2><div class="flex gap-5 overflow-x-auto pb-8 scroll-hide px-2"></div>`;
    const row = section.querySelector('div');
    items.forEach(async item => {
        let poster = item.isFullUrl ? item.img : `https://image.tmdb.org/t/p/w400${item.img}`;
        if (item.needsImg) {
            const r = await fetch(`https://api.themoviedb.org/3/${item.tipo}/${item.id}?api_key=${KEYS.tmdb}`);
            const d = await r.json();
            poster = `https://image.tmdb.org/t/p/w400${d.poster_path}`;
        }
        if (poster && !poster.includes('null')) row.innerHTML += renderCard(item.id, item.title, poster, item.tipo, true);
    });
    appContainer.appendChild(section);
}

function renderCard(id, title, img, tipo, isImgReady) {
    const poster = isImgReady ? img : `https://image.tmdb.org/t/p/w400${img}`;
    return `<div class="movie-card min-w-[165px] md:min-w-[195px] h-[245px] md:h-[290px] bg-cover bg-center shadow-2xl relative group overflow-hidden" onclick="gestionarSeleccion(${id}, '${tipo}')" style="background-image:url('${poster}')"></div>`;
}

// 5. GESTIÓN DE SELECCIÓN (SERIE O PELÍCULA)
function gestionarSeleccion(id, tipo) {
    if (tipo === 'tv' || tipo === 'show') abrirModalSerie(id);
    else lanzarReproductor(id, 'movie');
}

async function abrirModalSerie(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${KEYS.tmdb}&language=es-ES`);
    const data = await res.json();
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('modal-desc').innerText = data.overview;
    document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `<div class="bg-zinc-900 p-4 rounded-2xl border border-white/5 hover:border-cyan-500 cursor-pointer text-center" onclick="cargarEpisodios(${id}, ${s.season_number})"><span class="text-[10px] font-black uppercase italic">${s.name}</span></div>`).join('');
    document.getElementById('series-modal').classList.remove('hidden');
    document.getElementById('episodes-container').classList.add('hidden');
}

async function cargarEpisodios(id, sNum) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${KEYS.tmdb}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `<div class="bg-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 cursor-pointer group" onclick="lanzarReproductor(${id}, 'tv', ${sNum}, ${e.episode_number})"><span class="text-xs italic"><b class="text-cyan-400 mr-3">${e.episode_number}</b> ${e.name}</span></div>`).join('');
    document.getElementById('episodes-container').classList.remove('hidden');
}

// 6. REPRODUCTOR HÍBRIDO (EL CORAZÓN)
function lanzarReproductor(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    const selector = document.getElementById('server-selector');
    document.getElementById('player-view').classList.remove('hidden');

    const videoPropio = DB_PROPIA.find(item => item.tmdb_id == id && item.tipo == tipo && (tipo === 'movie' || (item.temporada == s && item.episodio == e)));

    let botonesPropio = "";
    if (videoPropio) {
        Object.keys(videoPropio.links).forEach(idioma => {
            const icon = { latino: "🇲🇽", castellano: "🇪🇸", english: "🇺🇸", french: "🇫🇷" };
            botonesPropio += `<button onclick="cargarVideoDirecto('${videoPropio.links[idioma]}')" class="bg-cyan-600 hover:bg-white hover:text-black text-[8px] font-black px-4 py-2 rounded-full uppercase transition-all">${icon[idioma] || "🌐"} ${idioma}</button>`;
        });
    }

    const servidores = [
        { nombre: "AUTO 1 (IDIOMAS)", url: tipo === 'movie' ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
        { nombre: "AUTO 2 (ESTABLE)", url: tipo === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
        { nombre: "CLÁSICOS", url: tipo === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${id}` : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` }
    ];

    selector.innerHTML = botonesPropio + servidores.map(serv => `<button onclick="cambiarServidor('${serv.url}')" class="bg-white/5 border border-white/10 hover:bg-cyan-500 text-[8px] font-black px-4 py-2 rounded-full uppercase">${serv.nombre}</button>`).join('');

    if (videoPropio) cargarVideoDirecto(videoPropio.links[Object.keys(videoPropio.links)[0]]);
    else cambiarServidor(servidores[0].url);
}

function cargarVideoDirecto(url) {
    const root = document.getElementById('video-root');
    root.innerHTML = `<video controls autoplay class="w-full h-full bg-black"><source src="${url}" type="video/mp4">Tu navegador no soporta el video directo.</video>`;
}

function cambiarServidor(url) {
    const root = document.getElementById('video-root');
    root.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;" allowfullscreen allow="autoplay; encrypted-media; fullscreen" referrerpolicy="no-referrer"></iframe>`;
}

function cerrarPlayer() { document.getElementById('player-view').classList.add('hidden'); document.getElementById('video-root').innerHTML = ''; }
function cerrarModalSeries() { document.getElementById('series-modal').classList.add('hidden'); }
