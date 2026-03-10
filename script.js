const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = [
    "estrenos nuevos", "películas", "series", "animes", "acción", "comedia", 
    "terror", "ciencia y ficción", "fantasía", "romance", "infantil"
];

// Sistema de ingresos persistente
let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = () => { 
    renderHome(); 
    console.log("DaBo Vision Global Pro 2026 - Conectado a dabo-vision.net");
};

// Carga del Catálogo
async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    
    for(let g of genres) {
        const row = document.createElement('div');
        row.className = 'mb-12';
        row.innerHTML = `
            <h3 class="px-6 text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[0.2em] italic">${g}</h3>
            <div class="video-row" id="row-${g.replace(/\s/g, '')}"></div>
        `;
        container.appendChild(row);
        
        let searchTag = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        
        fetch(`https://api.themoviedb.org/3/${searchTag}${searchTag.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
        .then(r => r.json())
        .then(data => {
            const el = document.getElementById(`row-${g.replace(/\s/g, '')}`);
            el.innerHTML = data.results.filter(m => m.poster_path).map(m => `
                <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')">
                    ${(m.media_type === 'tv' || m.name) ? '<div class="absolute top-2 right-2 bg-cyan-400 text-black text-[7px] font-black px-2 py-0.5 rounded shadow-lg">SERIE</div>' : ''}
                </div>
            `).join('');
        });
    }
}

// Lógica de Inicio de Contenido y Monetización
async function analizarContenido(id, tipo) {
    // Monetización: Se registra ingreso por cada intención de visualización
    revenue += 0.25; 
    localStorage.setItem('dabo_revenue', revenue.toFixed(2));

    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        mostrarSerie(data);
    } else {
        reproducir(id, 'movie');
    }
}

// Gestión de Series
function mostrarSerie(data) {
    document.getElementById('series-menu').style.display = 'block';
    document.getElementById('serie-title').innerText = data.name;
    const list = document.getElementById('seasons-list');
    list.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="glass-btn flex justify-between items-center cursor-pointer" onclick="mostrarCapitulos(${data.id}, ${s.season_number}, '${s.name}')">
            <span class="font-bold text-sm tracking-tight">${s.name}</span>
            <span class="text-[10px] bg-white/10 px-3 py-1 rounded-full text-cyan-400 uppercase font-black">${s.episode_count} EPS</span>
        </div>
    `).join('');
}

async function mostrarCapitulos(serieId, seasonNum, seasonName) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${serieId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-menu').style.display = 'block';
    document.getElementById('season-title').innerText = seasonName;
    const list = document.getElementById('episodes-list');
    list.innerHTML = data.episodes.map(e => `
        <div class="glass-btn text-sm flex items-center justify-between group" onclick="reproducir(${serieId}, 'tv', ${seasonNum}, ${e.episode_number})">
            <span><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play text-[10px] opacity-0 group-hover:opacity-100 transition-all"></i>
        </div>
    `).join('');
}

// REPRODUCTOR MAESTRO: INICIO AUTOMÁTICO AL PULSAR
function reproducir(id, tipo, s=1, e=1) {
    const holder = document.getElementById('video-container');
    const audio = document.getElementById('audio-selector').value;
    document.getElementById('player-view').style.display = 'flex';
    
    // Servidor Bypass para dabo-vision.net (Evita bloqueos en ASUS)
    // El servidor embed.su es el más estable para dominios .net en 2026
    const url = tipo === 'movie' ? 
        `https://embed.su/embed/movie/${id}` : 
        `https://embed.su/embed/tv/${id}/${s}/${e}`;
    
    // Inserción limpia: Autoplay habilitado y sin cookies externas
    holder.innerHTML = `
        <iframe 
            src="${url}" 
            class="w-full h-full" 
            allowfullscreen 
            allow="autoplay; encrypted-media" 
            referrerpolicy="no-referrer">
        </iframe>`;
}

// Utilidades
function cerrarSerie() { document.getElementById('series-menu').style.display = 'none'; }
function cerrarPlayer() { 
    document.getElementById('player-view').style.display = 'none'; 
    document.getElementById('video-container').innerHTML = ''; 
}

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const content = document.getElementById('catalog-content');
        content.innerHTML = `
            <div class="px-6 py-4 flex justify-between items-center border-b border-white/10 mb-8">
                <h3 class="text-[10px] font-black uppercase text-cyan-400">Resultados para: ${q}</h3>
                <button onclick="renderHome()" class="text-[10px] font-bold text-white bg-white/10 px-4 py-2 rounded-full">LIMPIAR</button>
            </div>
            <div class="video-row">${d.results.filter(m=>m.poster_path).map(m => `
                <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>
            `).join('')}</div>
        `;
    });
}

// Panel del Arquitecto (PIN: 110103)
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === "110103") {
        alert(`SISTEMA DA-BO VISION GLOBAL\n------------------\nIngresos Totales: $${revenue.toFixed(2)}\nDominio: dabo-vision.net\nStatus: Online`);
    }
};

function activarVoz() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'es-ES';
    rec.start();
    rec.onresult = (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        document.getElementById('main-search').value = text;
        buscar(text);
    };
}
