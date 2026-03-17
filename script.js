const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const contentArea = document.getElementById('catalog-results');

const GENEROS = {
    "accion": 28, "comedia": 35, "terror": 27, "romance": 10749,
    "ciencia": 878, "fantasia": 14, "animacion": 16
};

window.onload = () => {
    cargarSeccion("Estrenos", "movie/now_playing");
    cargarSeccion("Tendencias", "trending/all/day");
    cargarSeccion("Acción", "discover/movie", `&with_genres=${GENEROS.accion}`);
    cargarSeccion("Terror", "discover/movie", `&with_genres=${GENEROS.terror}`);
    cargarSeccion("Anime", "discover/movie", `&with_genres=${GENEROS.animacion}`);
};

async function cargarSeccion(titulo, path, extraParams = "") {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=es-ES${extraParams}`);
    const data = await res.json();
    let html = `<section class="mb-8"><h2 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px] italic">${titulo}</h2><div class="flex gap-4 overflow-x-auto pb-4 scroll-hide">`;
    data.results.forEach(m => {
        if(m.poster_path) {
            const tipo = m.media_type || (m.title ? 'movie' : 'tv');
            html += `<div class="min-w-[140px] h-[210px] rounded-2xl bg-cover bg-center border border-white/5 cursor-pointer shadow-xl" onclick="gestionarClick(${m.id}, '${tipo}')" style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>`;
        }
    });
    contentArea.innerHTML += html + `</div></section>`;
}

function gestionarClick(id, tipo) {
    if (tipo === 'tv') abrirModalSeries(id);
    else lanzarVideo(id, 'movie');
}

// REPRODUCTOR MULTI-SERVIDOR (CORRECCIÓN DE CARGA)
function lanzarVideo(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    const serverList = document.getElementById('server-list');
    document.getElementById('player-view').classList.remove('hidden');

    // Definimos los 3 mejores servidores actuales
    const servidores = [
        { nombre: "Servidor 1", url: tipo === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
        { nombre: "Servidor 2", url: tipo === 'movie' ? `https://vidsrc.xyz/embed/movie?tmdb=${id}` : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
        { nombre: "Servidor 3", url: tipo === 'movie' ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` }
    ];

    // Crear botones de servidor
    serverList.innerHTML = servidores.map((serv, index) => `
        <button onclick="cambiarServidor('${serv.url}')" class="bg-white/10 hover:bg-cyan-500 text-[9px] font-bold py-1 px-3 rounded-full transition-all uppercase">
            ${serv.nombre}
        </button>
    `).join('');

    // Cargar el primero por defecto
    cambiarServidor(servidores[0].url);
}

function cambiarServidor(url) {
    const root = document.getElementById('video-root');
    root.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;" allowfullscreen allow="autoplay; encrypted-media" referrerpolicy="no-referrer"></iframe>`;
}

// ... Resto de funciones (abrirModalSeries, cerrarPlayer, etc.) igual que antes ...
function cerrarPlayer() { document.getElementById('player-view').classList.add('hidden'); document.getElementById('video-root').innerHTML = ''; }
function cerrarModalSeries() { document.getElementById('series-modal').classList.add('hidden'); }
async function abrirModalSeries(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center" onclick="cargarCapitulos(${id}, ${s.season_number})">
            <span class="font-bold text-xs uppercase italic">${s.name}</span>
            <span class="text-cyan-400 text-[10px]">${s.episode_count} EPS</span>
        </div>`).join('');
    document.getElementById('series-modal').classList.remove('hidden');
}
async function cargarCapitulos(id, s) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-3 rounded-lg flex justify-between items-center" onclick="lanzarVideo(${id}, 'tv', ${s}, ${e.episode_number})">
            <span class="text-xs italic"><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
        </div>`).join('');
    document.getElementById('episodes-container').classList.remove('hidden');
}
// Función para mostrar/ocultar la política de privacidad
function togglePrivacy(show) {
    const modal = document.getElementById('privacy-modal');
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de fondo
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Libera el scroll
    }
}

// Cerrar con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePrivacy(false);
});
