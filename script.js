const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = ["estrenos nuevos", "acción", "animes", "terror", "comedia"];
let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

// SISTEMA DE MONETIZACIÓN (Estancia y Tiempo)
setInterval(() => {
    revenue += 0.05; // Suma cada minuto de uso
    localStorage.setItem('dabo_revenue', revenue.toFixed(2));
}, 60000);

window.onload = loadHome;

async function loadHome() {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';
    for (let g of genres) {
        const rowId = `row-${g.replace(/\s/g, '')}`;
        grid.innerHTML += `<div class="mb-10"><h3 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px]">${g}</h3>
                           <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide" id="${rowId}"></div></div>`;
        const path = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
            .then(r => r.json()).then(data => {
                const row = document.getElementById(rowId);
                row.innerHTML = data.results.filter(m => m.poster_path).map(m => `
                    <div class="min-w-[140px] h-[210px] rounded-xl bg-cover bg-center border border-white/10 active:scale-95 transition-all" 
                         onclick="abrirDetalle(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                         style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
                `).join('');
            });
    }
}

// BUSCADOR REPARADO
function ejecutarBusqueda() {
    const q = document.getElementById('main-search').value;
    if(q.length < 2) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const grid = document.getElementById('catalog-grid');
        grid.innerHTML = `<button onclick="loadHome()" class="mb-8 text-cyan-400 text-xs font-bold uppercase tracking-widest">← Regresar al Inicio</button>
                          <div class="grid grid-cols-2 gap-4">
                          ${d.results.filter(m=>m.poster_path).map(m => `
                              <div class="aspect-[2/3] rounded-xl bg-cover border border-white/10" 
                                   onclick="abrirDetalle(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                                   style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
                          `).join('')}</div>`;
    });
}
document.getElementById('main-search').onkeyup = (e) => { if(e.key === 'Enter') ejecutarBusqueda(); };

// GESTIÓN DE VISTAS
async function abrirDetalle(id, tipo) {
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        document.getElementById('serie-title').innerText = data.name;
        document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <div class="bg-white/5 p-5 rounded-xl border border-white/10 flex justify-between" onclick="cargarEpisodios(${id}, ${s.season_number})">
                <span class="font-bold">${s.name}</span>
                <i class="fas fa-chevron-right text-cyan-400"></i>
            </div>
        `).join('');
        document.getElementById('series-layer').style.display = 'block';
    } else {
        abrirReproductor(id, 'movie');
    }
}

async function cargarEpisodios(id, season) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-container').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-4 rounded-xl text-sm flex justify-between items-center" onclick="abrirReproductor(${id}, 'tv', ${season}, ${e.episode_number})">
            <span><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play text-xs text-cyan-400"></i>
        </div>
    `).join('');
    document.getElementById('episodes-layer').style.display = 'block';
}

// REPRODUCTOR (INSTANTÁNEO)
function abrirReproductor(id, tipo, s=1, e=1) {
    const layer = document.getElementById('player-layer');
    const trigger = document.getElementById('play-trigger');
    const root = document.getElementById('video-root');
    
    layer.style.display = 'flex';
    root.innerHTML = '';
    trigger.style.display = 'flex';

    trigger.onclick = () => {
        trigger.style.display = 'none';
        const url = tipo === 'movie' ? 
            `https://vidsrc.me/embed/movie?tmdb=${id}` : 
            `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
        
        // Bloqueo de redirecciones forzadas (Sandboxing)
        root.innerHTML = `<iframe src="${url}" class="w-full h-full" allowfullscreen allow="autoplay" referrerpolicy="no-referrer" sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"></iframe>`;
        revenue += 0.25; // Monetización por clic
        localStorage.setItem('dabo_revenue', revenue.toFixed(2));
    };
}

function cerrarCapa(id) { document.getElementById(id).style.display = 'none'; }
function cerrarReproductor() { 
    document.getElementById('player-layer').style.display = 'none'; 
    document.getElementById('video-root').innerHTML = ''; 
}

// CONTROL ARQUITECTO
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ACCESO:") === "110103") alert("Balance DV Global: $" + revenue.toFixed(2));
};
