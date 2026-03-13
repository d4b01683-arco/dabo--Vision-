const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';

// 1. GESTIÓN DE COOKIES Y ADSENSE
window.onload = () => {
    // Si no ha aceptado cookies, mostramos el banner
    if (!localStorage.getItem('cookiesAceptadas')) {
        document.getElementById('cookie-banner').classList.remove('hidden');
    }
    cargarSeccion("Tendencias", "trending/all/week");
};

function aceptarCookies() {
    localStorage.setItem('cookiesAceptadas', 'true');
    document.getElementById('cookie-banner').classList.add('hidden');
    // Aquí podrías recargar para activar AdSense
    location.reload();
}

// 2. REPRODUCTOR CON AUDIO EN ESPAÑOL (FORZADO)
function abrirReproductor(id, tipo, s=1, e=1) {
    const container = document.getElementById('video-container');
    const trigger = document.getElementById('play-trigger');
    document.getElementById('player-view').style.display = 'flex';
    
    container.innerHTML = '';
    trigger.style.display = 'flex';

    trigger.onclick = () => {
        trigger.style.display = 'none';
        // Servidor .cc es el mejor para Audio Latino/Castellano
        const url = tipo === 'movie' ? 
            `https://vidsrc.cc/v2/embed/movie/${id}` : 
            `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`;
        
        container.innerHTML = `<iframe src="${url}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>`;
    };
}

// 3. CARGA DE CATÁLOGO (Igual que antes pero optimizado)
async function cargarSeccion(titulo, path) {
    const res = await fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    const grid = document.getElementById('catalog-container');
    
    let html = `<h3 class="text-[10px] font-black uppercase text-cyan-400 mb-6 tracking-[4px] italic">${titulo}</h3>
                <div class="flex gap-4 overflow-x-auto pb-10 scroll-hide">`;
    
    data.results.forEach(m => {
        if(m.poster_path) {
            html += `<div class="min-w-[150px] h-[225px] rounded-2xl bg-cover border border-white/10 shadow-2xl cursor-pointer" 
                     onclick="abrirReproductor(${m.id}, '${m.media_type || (m.title ? 'movie' : 'tv')}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>`;
        }
    });
    grid.innerHTML = html + `</div>`;
}
