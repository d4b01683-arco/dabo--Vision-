const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = ["estrenos nuevos", "películas", "series", "animes", "acción", "comedia", "terror", "cine", "ciencia y ficción", "fantasía", "romance"];

let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = () => { renderHome(); };

async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for(let g of genres) {
        const row = document.createElement('div');
        row.className = 'mb-8';
        row.innerHTML = `<h3 class="px-6 text-[10px] font-black uppercase text-cyan-400 mb-2 tracking-widest">${g}</h3><div class="video-row" id="row-${g.replace(/\s/g, '')}"></div>`;
        container.appendChild(row);
        
        let searchTag = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${searchTag}${searchTag.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
        .then(r => r.json()).then(data => {
            const el = document.getElementById(`row-${g.replace(/\s/g, '')}`);
            el.innerHTML = data.results.filter(m => m.poster_path).map(m => `
                <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')">
                    ${(m.media_type === 'tv' || m.name) ? '<div class="absolute top-2 right-2 bg-cyan-400 text-black text-[8px] font-bold px-2 py-1 rounded">SERIE</div>' : ''}
                </div>
            `).join('');
        });
    }
}

async function analizarContenido(id, tipo) {
    revenue += 0.20; // Monetización por clic
    localStorage.setItem('dabo_revenue', revenue);
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        mostrarSerie(data);
    } else {
        prepararReproductor(id, 'movie');
    }
}

function mostrarSerie(data) {
    document.getElementById('series-menu').style.display = 'block';
    document.getElementById('serie-title').innerText = data.name;
    const list = document.getElementById('seasons-list');
    list.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="glass-btn flex justify-between items-center" onclick="mostrarCapitulos(${data.id}, ${s.season_number}, '${s.name}')">
            <span>${s.name}</span>
            <span class="text-[10px] text-white/40">${s.episode_count} Caps</span>
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
        <div class="glass-btn text-sm" onclick="prepararReproductor(${serieId}, 'tv', ${seasonNum}, ${e.episode_number})">
            <span class="text-cyan-400 font-bold">${e.episode_number}.</span> ${e.name}
        </div>
    `).join('');
}

// NUEVA FUNCIÓN CON BOTÓN DE PLAY
function prepararReproductor(id, tipo, s=1, e=1) {
    document.getElementById('player-view').style.display = 'block';
    const playBtn = document.getElementById('master-play-btn');
    const container = document.getElementById('video-container');
    
    playBtn.style.display = 'flex'; // Mostrar el botón
    container.innerHTML = ''; // Limpiar previo

    playBtn.onclick = () => {
        playBtn.style.display = 'none'; // Ocultar al tocar
        const url = tipo === 'movie' ? 
            `https://vidsrc.icu/embed/movie/${id}` : 
            `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`;
        
        container.innerHTML = `<iframe src="${url}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe>`;
    };
}

function cerrarPlayer() { 
    document.getElementById('player-view').style.display = 'none'; 
    document.getElementById('video-container').innerHTML = ''; 
}

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const content = document.getElementById('catalog-content');
        content.innerHTML = `<h3 class="px-6 text-xs text-white mb-4">RESULTADOS: ${q.toUpperCase()}</h3><div class="video-row">${d.results.filter(m=>m.poster_path).map(m => `
            <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>
        `).join('')}</div><button onclick="renderHome()" class="m-6 text-[10px] text-cyan-400 border border-cyan-400/20 px-4 py-2 rounded-full">← VOLVER</button>`;
    });
}

document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === "110103") {
        alert(`DV GLOBAL ANALYTICS\n------------------\nIngresos: $${revenue.toFixed(2)}\nStatus: dabo-vision.net ONLINE`);
    }
};

function activarVoz() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'es-ES';
    rec.start();
    rec.onresult = (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        if(text.includes("dieyna")) alert("Bienvenida, Dieyna ❤️");
        document.getElementById('main-search').value = text;
        buscar(text);
    };
}
