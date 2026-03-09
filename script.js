const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const ARCHITECT_PIN = "110103";
const ECOBANK_ACC = "4950666349242719";
const genres = ["estrenos nuevos", "películas", "series", "animes", "acción", "terror", "amor", "infantil"];

let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = () => { renderHome(); };

async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for(let g of genres) {
        const rowId = `row-${g.replace(/\s/g, '')}`;
        container.innerHTML += `<h3 class="px-6 text-[10px] font-black uppercase text-cyan-400 mb-2 tracking-widest">${g}</h3><div class="video-row" id="${rowId}"></div>`;
        let q = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${q}${q.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
        .then(r => r.json()).then(data => {
            document.getElementById(rowId).innerHTML = data.results.filter(m => m.poster_path).map(m => `
                <div class="movie-card" onclick="verificarYMonetizar(${m.id}, '${m.media_type || (m.name?'tv':'movie')}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>`).join('');
        });
    }
}

// MONETIZACIÓN POR REPRODUCCIÓN (PPV)
async function verificarYMonetizar(id, tipo) {
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
    document.getElementById('seasons-list').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="glass-btn flex justify-between" onclick="mostrarCapitulos(${data.id}, ${s.season_number}, '${s.name}')">
            <span>${s.name.toUpperCase()}</span><i class="fas fa-play"></i>
        </div>`).join('');
}

async function mostrarCapitulos(id, sNum, sName) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-menu').style.display = 'block';
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="glass-btn text-sm" onclick="reproducir(${id}, 'tv', ${sNum}, ${e.episode_number})">
            ${e.episode_number}. ${e.name}
        </div>`).join('');
}

// BYPASS DE VIDEO PARA EVITAR PANTALLA BLANCA
function reproducir(id, tipo, s=1, e=1) {
    document.getElementById('player-view').style.display = 'block';
    const container = document.getElementById('video-container');
    container.innerHTML = "";
    const url = tipo === 'movie' ? `https://vidsrc.icu/embed/movie/${id}` : `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`;
    const ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", url);
    ifrm.className = "w-full h-full";
    ifrm.setAttribute("allowfullscreen", "true");
    ifrm.setAttribute("referrerpolicy", "no-referrer"); // Crucial para saltar el bloqueo
    container.appendChild(ifrm);
}

function cerrarSerie() { document.getElementById('series-menu').style.display = 'none'; }
function cerrarPlayer() { document.getElementById('player-view').style.display = 'none'; document.getElementById('video-container').innerHTML = ''; }

// PANEL MAESTRO (PIN: 110103)
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("AUTENTICACIÓN ARQUITECTO:") === ARCHITECT_PIN) {
        alert(`ESTADO FINANCIERO DV\n------------------\nCuenta Ecobank: ${ECOBANK_ACC}\nSaldo Total: $${revenue.toFixed(2)}\nStatus: ACTIVE`);
    }
};

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const content = document.getElementById('catalog-content');
        content.innerHTML = `<h3 class="px-6 text-xs text-white mb-4">RESULTADOS: ${q.toUpperCase()}</h3>
            <div class="video-row">${d.results.filter(m=>m.poster_path).map(m => `
            <div class="movie-card" onclick="verificarYMonetizar(${m.id}, '${m.media_type || (m.name?'tv':'movie')}')" 
                 style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')"></div>`).join('')}
            </div><button onclick="renderHome()" class="m-6 text-[10px] text-cyan-400 border border-cyan-400/20 px-4 py-2 rounded-full">VOLVER</button>`;
    });
}

function activarVoz() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'es-ES';
    rec.start();
    rec.onresult = (e) => {
        const t = e.results[0][0].transcript.toLowerCase();
        if(t.includes("dieyna")) alert("Bienvenida, Dieyna ❤️"); 
        document.getElementById('main-search').value = t; buscar(t);
    };
}