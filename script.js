const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const contentArea = document.getElementById('catalog-results');

window.onload = () => {
    // Cargamos las 3 secciones principales
    cargarSeccion("Recientemente Añadidos", "movie/now_playing"); 
    cargarSeccion("Tendencias Mundiales", "trending/all/day");
    cargarSeccion("Series Recomendadas", "tv/top_rated");
};

async function cargarSeccion(titulo, path) {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    
    let html = `
        <section class="mb-12">
            <h2 class="text-[10px] font-black uppercase text-cyan-400 mb-6 tracking-[6px] italic">${titulo}</h2>
            <div class="flex gap-5 overflow-x-auto pb-6 scroll-hide">`;
    
    data.results.forEach(m => {
        if(m.poster_path) {
            const tipo = m.media_type || (m.title ? 'movie' : 'tv');
            html += `
                <div class="movie-card min-w-[170px] h-[250px] rounded-3xl bg-cover bg-center border border-white/5 cursor-pointer transition-all duration-300 shadow-2xl" 
                     onclick="verificarContenido(${m.id}, '${tipo}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')">
                </div>`;
        }
    });
    
    html += `</div></section>`;
    contentArea.innerHTML += html;
}

// LÓGICA DE REPRODUCCIÓN
function verificarContenido(id, tipo) {
    if (tipo === 'tv') {
        abrirModalSeries(id);
    } else {
        lanzarVideo(id, 'movie');
    }
}

async function abrirModalSeries(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="bg-white/5 p-6 rounded-3xl border border-white/10 flex justify-between items-center cursor-pointer hover:bg-cyan-400/20" 
             onclick="cargarCapitulos(${id}, ${s.season_number})">
            <span class="font-black italic uppercase text-sm">${s.name}</span>
            <span class="text-cyan-400 text-[10px] font-bold tracking-widest">${s.episode_count} EPS</span>
        </div>`).join('');
    document.getElementById('series-modal').classList.remove('hidden');
}

async function cargarCapitulos(id, s) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 cursor-pointer" 
             onclick="lanzarVideo(${id}, 'tv', ${s}, ${e.episode_number})">
            <span class="text-sm font-medium italic"><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play text-[10px] text-cyan-400"></i>
        </div>`).join('');
    document.getElementById('episodes-container').classList.remove('hidden');
}

function lanzarVideo(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    document.getElementById('player-view').classList.remove('hidden');
    
    // Servidor .pro: El mejor para audio latino/español y subtítulos
    const url = tipo === 'movie' 
        ? `https://vidsrc.pro/embed/movie/${id}` 
        : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`;
    
    root.innerHTML = `<iframe src="${url}" class="w-full h-full border-none" allowfullscreen allow="autoplay"></iframe>`;
}

// BUSCADOR Y CIERRE
async function ejecutarBusqueda() {
    const q = document.getElementById('main-search').value;
    if(!q) return;
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`);
    const data = await res.json();
    contentArea.innerHTML = `<button onclick="location.reload()" class="text-cyan-400 text-[10px] font-black italic underline mb-10 block uppercase tracking-widest">← VOLVER AL INICIO</button>
                             <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
                             ${data.results.filter(m => m.poster_path).map(m => `
                                <div class="aspect-[2/3] rounded-3xl bg-cover border border-white/10 cursor-pointer hover:scale-105 transition-all" onclick="verificarContenido(${m.id}, '${m.media_type || (m.title ? 'movie' : 'tv')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>
                             `).join('')}</div>`;
}

document.getElementById('main-search').addEventListener('keyup', (e) => { if(e.key === 'Enter') ejecutarBusqueda(); });
function cerrarPlayer() { document.getElementById('player-view').classList.add('hidden'); document.getElementById('video-root').innerHTML = ''; }
function cerrarModalSeries() { document.getElementById('series-modal').classList.add('hidden'); }
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
