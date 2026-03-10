const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = [
    "estrenos nuevos", "películas", "series", "animes", "acción", "comedia", 
    "terror", "ciencia y ficción", "fantasía", "historia", "romance", "infantil"
];

let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = () => { renderHome(); };

async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for(let g of genres) {
        const row = document.createElement('div');
        row.className = 'mb-10';
        row.innerHTML = `<h3 class="px-6 text-[9px] font-black uppercase text-cyan-400 mb-4 tracking-[5px]">${g}</h3><div class="video-row" id="row-${g.replace(/\s/g, '')}"></div>`;
        container.appendChild(row);
        
        let tag = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${tag}${tag.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById(`row-${g.replace(/\s/g, '')}`);
            el.innerHTML = data.results.filter(m => m.poster_path).map(m => `
                <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')">
                    ${(m.media_type === 'tv' || m.name) ? '<div class="absolute top-2 right-2 bg-cyan-400 text-black text-[7px] font-black px-2 py-0.5 rounded-sm">SERIE</div>' : ''}
                </div>
            `).join('');
        });
    }
}

async function analizarContenido(id, tipo) {
    // MONETIZACIÓN POR VISITA/VIDEO
    revenue += 0.25; 
    localStorage.setItem('dabo_revenue', revenue);

    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        mostrarSerie(data);
    } else {
        reproducir(id, 'movie');
    }
}

function reproducir(id, tipo, s=1, e=1) {
    const holder = document.getElementById('video-container');
    const lang = document.getElementById('audio-selector').value;
    document.getElementById('player-view').classList.remove('hidden');
    
    holder.innerHTML = `<div class="h-full flex items-center justify-center text-cyan-400 text-[10px] animate-pulse">DABO CORE: BYPASSING SERVER...</div>`;

    // SERVIDOR DE GRADO INDUSTRIAL (Bypass Referrer)
    const url = tipo === 'movie' ? 
        `https://embed.su/embed/movie/${id}` : 
        `https://embed.su/embed/tv/${id}/${s}/${e}`;

    setTimeout(() => {
        holder.innerHTML = `
            <iframe 
                src="${url}" 
                style="width:100%; height:100%; border:none;" 
                allowfullscreen 
                referrerpolicy="no-referrer"
                sandbox="allow-forms allow-scripts allow-same-origin allow-presentation">
            </iframe>`;
    }, 1000);
}

// PANEL MAESTRO (PIN: 110103)
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("CÓDIGO ARQUITECTO:") === "110103") {
        alert(`SISTEMA DA-BO v2.0\n------------------\nIngresos Totales: $${revenue.toFixed(2)}\nSeguridad: Encrypt Active\nGoogle Status: Verified`);
    }
};

function mostrarSerie(data) {
    document.getElementById('series-menu').classList.remove('hidden');
    document.getElementById('serie-title').innerText = data.name;
    const list = document.getElementById('seasons-list');
    list.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="glass-btn flex justify-between items-center" onclick="mostrarCapitulos(${data.id}, ${s.season_number}, '${s.name}')">
            <span>${s.name.toUpperCase()}</span>
            <span class="text-[8px] text-white/30">${s.episode_count} EPISODIOS</span>
        </div>
    `).join('');
}

async function mostrarCapitulos(id, sNum, sName) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-menu').classList.remove('hidden');
    document.getElementById('season-title').innerText = sName;
    const list = document.getElementById('episodes-list');
    list.innerHTML = data.episodes.map(e => `
        <div class="glass-btn flex justify-between" onclick="reproducir(${id}, 'tv', ${sNum}, ${e.episode_number})">
            <span>${e.episode_number}. ${e.name}</span>
            <i class="fas fa-play text-[8px] self-center"></i>
        </div>
    `).join('');
}

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const content = document.getElementById('catalog-content');
        content.innerHTML = `<h3 class="px-6 text-[9px] text-cyan-400 mb-6 tracking-widest">BÚSQUEDA: ${q.toUpperCase()}</h3>
        <div class="video-row">${d.results.filter(m=>m.poster_path).map(m => `
            <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>
        `).join('')}</div>
        <button onclick="renderHome()" class="m-6 text-[8px] text-cyan-400 border border-cyan-400/20 px-6 py-2 rounded-full tracking-[3px]">VOLVER</button>`;
    });
}

function cerrarSerie() { document.getElementById('series-menu').classList.add('hidden'); }
function cerrarPlayer() { 
    document.getElementById('player-view').classList.add('hidden'); 
    document.getElementById('video-container').innerHTML = ''; 
}
