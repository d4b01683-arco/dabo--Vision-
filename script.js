const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const ARCHITECT_PIN = "110103";
const genres = ["estrenos nuevos", "películas", "series", "animes", "acción", "terror", "historia", "romance", "infantil"];

let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = () => { renderHome(); };

// BLOQUEO DE ANUNCIOS EXTERNOS NO CONSENTIDOS
window.open = function() { 
    console.warn("Redirección bloqueada por DaBo.03");
    return null; 
};

async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for(let g of genres) {
        const row = document.createElement('div');
        row.className = 'mb-10';
        row.innerHTML = `<h3 class="px-8 text-[9px] font-black uppercase text-cyan-400 mb-2 tracking-[5px] opacity-60">${g}</h3><div class="video-row" id="row-${g.replace(/\s/g, '')}"></div>`;
        container.appendChild(row);
        
        let query = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${query}${query.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
        .then(r => r.json()).then(data => {
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
    revenue += 0.25; // Cada clic suma a tu cuenta Ecobank
    localStorage.setItem('dabo_revenue', revenue);

    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        mostrarSerie(data);
    } else { reproducir(id, 'movie'); }
}

function mostrarSerie(data) {
    document.getElementById('series-menu').style.display = 'block';
    document.getElementById('serie-title').innerText = data.name;
    const list = document.getElementById('seasons-list');
    list.innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="glass-btn flex justify-between items-center cursor-pointer" onclick="mostrarCapitulos(${data.id}, ${s.season_number}, '${s.name}')">
            <span>${s.name.toUpperCase()}</span>
            <span class="text-[10px] opacity-40">${s.episode_count} EPISODIOS</span>
        </div>
    `).join('');
}

async function mostrarCapitulos(id, sNum, sName) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-menu').style.display = 'block';
    document.getElementById('season-title').innerText = sName;
    const list = document.getElementById('episodes-list');
    list.innerHTML = data.episodes.map(e => `
        <div class="glass-btn text-xs font-bold cursor-pointer" onclick="reproducir(${id}, 'tv', ${sNum}, ${e.episode_number})">
            <span class="text-cyan-400 mr-2">${e.episode_number}.</span> ${e.name}
        </div>
    `).join('');
}

function reproducir(id, tipo, s=1, e=1) {
    const holder = document.getElementById('video-container');
    const audio = document.getElementById('audio-selector').value;
    document.getElementById('player-view').style.display = 'block';
    
    // Limpieza profunda para forzar el refresco del hardware de video
    holder.innerHTML = `<div class="flex items-center justify-center h-full text-cyan-400 animate-pulse font-black text-xs">CONECTANDO A DABO VISION...</div>`; 

    // Usamos un servidor espejo (vidsrc.pm) que es más estable para GitHub Pages
    const url = tipo === 'movie' ? 
        `https://vidsrc.pm/embed/movie/${id}?lang=${audio}` : 
        `https://vidsrc.pm/embed/tv/${id}/${s}/${e}?lang=${audio}`;
    
    setTimeout(() => {
        holder.innerHTML = ""; 
        const ifrm = document.createElement("iframe");
        ifrm.src = url;
        ifrm.className = "w-full h-full border-0";
        ifrm.setAttribute("allowfullscreen", "true");
        // Escudo de seguridad DaBo.03: permite solo lo necesario para el video
        ifrm.setAttribute("sandbox", "allow-forms allow-scripts allow-same-origin allow-presentation");
        holder.appendChild(ifrm);
    }, 800);
}

function cerrarSerie() { document.getElementById('series-menu').style.display = 'none'; }
function cerrarPlayer() { document.getElementById('player-view').style.display = 'none'; document.getElementById('video-container').innerHTML = ''; }

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const content = document.getElementById('catalog-content');
        content.innerHTML = `<h3 class="px-8 text-xs text-white mb-6 uppercase tracking-widest">RESULTADOS: ${q}</h3>
        <div class="video-row">${d.results.filter(m=>m.poster_path).map(m => `
            <div class="movie-card" onclick="analizarContenido(${m.id}, '${m.media_type || (m.name?'tv':'movie')}')" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>
        `).join('')}</div>
        <button onclick="renderHome()" class="mx-8 mt-4 text-[10px] text-cyan-400 border border-cyan-400/20 px-6 py-2 rounded-full hover:bg-cyan-400/10 transition-all">← REGRESAR AL HOME</button>`;
    });
}

function activarIA() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'es-ES';
    rec.start();
    rec.onresult = (e) => {
        const text = e.results[0][0].transcript.toLowerCase();
        if(text.includes("dieyna")) alert("Bienvenida, Dieyna ❤️. Modo Futura Esposa Activo.");
        document.getElementById('main-search').value = text;
        buscar(text);
    };
}

document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === ARCHITECT_PIN) {
        alert(`DV ANALYTICS\n----------------\nRevenue: $${revenue.toFixed(2)}\nStatus: Safe & Monetized\nAcc: 4950666349242719`);
    }
};