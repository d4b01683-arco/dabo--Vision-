// CONFIGURACIÓN MAESTRA DABO VISION 2026
const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const appContainer = document.getElementById('catalog-container');

// 1. CARGA INICIAL DEL CATÁLOGO
window.onload = () => {
    cargarSeccion("Tendencias", "trending/all/week");
    // Puedes añadir más secciones aquí si lo deseas
};

async function cargarSeccion(titulo, path) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        
        const sectionHTML = `
            <div class="mb-10">
                <h3 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px] italic">${titulo}</h3>
                <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide">
                    ${data.results.filter(m => m.poster_path).map(m => `
                        <div class="min-w-[140px] h-[210px] rounded-xl bg-cover bg-center border border-white/5 shadow-xl active:scale-95 transition-all cursor-pointer" 
                             onclick="identificarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                             style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')">
                        </div>
                    `).join('')}
                </div>
            </div>`;
        
        if(path.includes('trending')) appContainer.innerHTML = sectionHTML;
        else appContainer.innerHTML += sectionHTML;
    } catch (error) {
        console.error("Error cargando catálogo:", error);
    }
}

// 2. BUSCADOR AVANZADO
async function ejecutarBusqueda() {
    const q = document.getElementById('main-search').value;
    if(q.length < 2) return;

    appContainer.innerHTML = '<p class="text-cyan-400 animate-pulse font-bold">BUSCANDO EN DABO VISION...</p>';

    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&language=es-ES`);
    const data = await res.json();
    
    appContainer.innerHTML = `
        <button onclick="location.reload()" class="mb-8 text-cyan-400 text-xs font-bold underline">← VOLVER AL INICIO</button>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${data.results.filter(m => m.poster_path).map(m => `
                <div class="aspect-[2/3] rounded-xl bg-cover border border-white/10 active:scale-95 transition-all" 
                     onclick="identificarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')">
                </div>
            `).join('')}
        </div>`;
}

// Escuchar tecla Enter en el buscador
document.getElementById('main-search')?.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') ejecutarBusqueda();
});

// 3. GESTIÓN DE CONTENIDO (PELIS VS SERIES)
async function identificarContenido(id, tipo) {
    if(tipo === 'tv' || tipo === 'serie') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        
        document.getElementById('modal-title').innerText = data.name;
        document.getElementById('seasons-grid').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <div class="bg-white/5 p-5 rounded-xl border border-white/10 flex justify-between items-center active:bg-white/20 cursor-pointer" 
                 onclick="cargarEpisodios(${id}, ${s.season_number})">
                <span class="font-bold tracking-tight">${s.name}</span>
                <span class="text-[10px] text-cyan-400">${s.episode_count} EPS</span>
            </div>
        `).join('');
        document.getElementById('series-modal').style.display = 'block';
    } else {
        abrirReproductor(id, 'movie');
    }
}

async function cargarEpisodios(id, season) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-4 rounded-xl text-sm flex justify-between items-center active:bg-cyan-400/10 cursor-pointer" 
             onclick="abrirReproductor(${id}, 'tv', ${season}, ${e.episode_number})">
            <span><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play-circle text-cyan-400"></i>
        </div>
    `).join('');
    document.getElementById('episodes-modal').style.display = 'block';
}

// 4. REPRODUCTOR MULTILENGUAJE PROFESIONAL
function abrirReproductor(id, tipo, s=1, e=1) {
    const view = document.getElementById('player-view');
    const trigger = document.getElementById('play-trigger');
    const container = document.getElementById('video-container');
    
    view.style.display = 'flex';
    container.innerHTML = ''; 
    trigger.style.display = 'flex';

    trigger.onclick = () => {
        trigger.style.display = 'none';
        
        // Servidor con soporte extendido para Audio Latino y Castellano
        const url = tipo === 'movie' ? 
            `https://vidsrc.cc/v2/embed/movie/${id}` : 
            `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
        
        container.innerHTML = `
            <iframe src="${url}" 
                style="width:100%; height:100%; border:none;" 
                allowfullscreen 
                allow="autoplay; encrypted-media" 
                referrerpolicy="no-referrer">
            </iframe>`;
    };
}

// 5. FUNCIONES DE CIERRE
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }
function pararReproductor() { 
    document.getElementById('player-view').style.display = 'none'; 
    document.getElementById('video-container').innerHTML = ''; 
}

// 6. LÓGICA LEGAL (ADSENSE)
function mostrarLegal(tipo) {
    const layer = document.getElementById('legal-layer');
    const content = document.getElementById('legal-content');
    layer.style.display = 'block';

    if (tipo === 'privacidad') {
        content.innerHTML = `
            <h2 class="text-2xl font-black text-white italic">POLÍTICA DE PRIVACIDAD</h2>
            <p>En dabo-vision.net usamos cookies de Google AdSense para personalizar anuncios y analizar el tráfico.</p>`;
    } else {
        content.innerHTML = `
            <h2 class="text-2xl font-black text-white italic">TÉRMINOS DE USO</h2>
            <p>DaBo Vision Global es un buscador de metadatos. El contenido es servido por terceros.</p>`;
    }
}
