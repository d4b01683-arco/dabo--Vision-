const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const appContainer = document.getElementById('catalog-container');

// 1. CARGA INICIAL
window.onload = () => {
    cargarSeccion("Tendencias", "trending/all/week");
};

async function cargarSeccion(titulo, path) {
    const res = await fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    let html = `<h3 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px] italic">${titulo}</h3>
                <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide">`;
    data.results.filter(m => m.poster_path).forEach(m => {
        const tipo = m.media_type || (m.name ? 'tv' : 'movie');
        html += `<div class="min-w-[140px] h-[210px] rounded-xl bg-cover bg-center border border-white/5 active:scale-95 transition-all cursor-pointer" 
                     onclick="identificarContenido(${m.id}, '${tipo}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>`;
    });
    html += `</div>`;
    appContainer.innerHTML = html;
}

// 2. IDENTIFICAR PELI O SERIE
async function identificarContenido(id, tipo) {
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        document.getElementById('modal-title').innerText = data.name;
        document.getElementById('seasons-grid').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <div class="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center" onclick="cargarEpisodios(${id}, ${s.season_number})">
                <span class="font-bold">${s.name}</span>
                <span class="text-cyan-400 text-xs">${s.episode_count} EPS</span>
            </div>`).join('');
        document.getElementById('series-modal').style.display = 'block';
    } else {
        lanzarReproductor(id, 'movie');
    }
}

async function cargarEpisodios(id, s) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-3 rounded-lg mb-2 flex justify-between items-center" onclick="lanzarReproductor(${id}, 'tv', ${s}, ${e.episode_number})">
            <span>${e.episode_number}. ${e.name}</span>
            <i class="fas fa-play text-cyan-400"></i>
        </div>`).join('');
    document.getElementById('episodes-modal').style.display = 'block';
}

// 3. REPRODUCTOR CON SELECTOR DE IDIOMAS/SERVIDORES
function lanzarReproductor(id, tipo, s=1, e=1) {
    const view = document.getElementById('player-view');
    const container = document.getElementById('video-container');
    const btnPlay = document.getElementById('play-trigger');
    
    view.style.display = 'flex';
    container.innerHTML = '';
    btnPlay.style.display = 'flex';

    // Función para cargar el iframe con diferentes servidores
    window.cargarServidor = (num) => {
        btnPlay.style.display = 'none';
        let url = "";
        if(num === 1) { // Servidor Latino/Español prioritario
            url = tipo === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
        } else { // Servidor Multilenguaje con Subtítulos
            url = tipo === 'movie' ? `https://vidsrc.xyz/embed/movie?tmdb=${id}` : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
        }
        
        container.innerHTML = `<iframe src="${url}" class="w-full h-full" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
    };

    btnPlay.onclick = () => cargarServidor(1);
}

function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }
function cerrarPlayer() { 
    document.getElementById('player-view').style.display = 'none'; 
    document.getElementById('video-container').innerHTML = ''; 
}
