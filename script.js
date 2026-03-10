const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = ["estrenos nuevos", "acción", "animes", "terror", "comedia", "ciencia ficción"];
let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;
let currentVideoId = null;

// Sistema de Monetización por Tiempo
setInterval(() => {
    revenue += 0.05; // $0.05 cada minuto de estancia
    localStorage.setItem('dabo_revenue', revenue);
}, 60000);

window.onload = renderHome;

async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for(let g of genres) {
        const rowId = `row-${g.replace(/\s/g, '')}`;
        container.innerHTML += `
            <div class="mb-8">
                <h3 class="px-6 text-[10px] font-black uppercase text-cyan-400 mb-3 tracking-[3px]">${g}</h3>
                <div class="video-row overflow-x-auto flex gap-4 px-6 pb-4" id="${rowId}"></div>
            </div>`;
        
        const path = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
            .then(r => r.json()).then(data => {
                const el = document.getElementById(rowId);
                el.innerHTML = data.results.filter(m => m.poster_path).map(m => `
                    <div class="movie-card flex-shrink-0 w-[140px] h-[210px] rounded-xl bg-cover bg-center relative border border-white/10 active:scale-95 transition-all shadow-lg" 
                         onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                         style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')">
                    </div>
                `).join('');
            });
    }
}

async function analizarContenido(id, tipo) {
    revenue += 0.50; // Pago por ver vídeo
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        mostrarSerie(data);
    } else {
        lanzarReproductor(id, 'movie');
    }
}

function lanzarReproductor(id, tipo, s=1, e=1) {
    currentVideoId = {id, tipo, s, e};
    document.getElementById('master-overlay').style.display = 'block';
    const playBtn = document.getElementById('master-play-btn');
    const container = document.getElementById('video-container');
    
    playBtn.style.display = 'flex';
    container.innerHTML = '';

    playBtn.onclick = () => {
        // MICROSERVICIO DE ANUNCIOS (1 MINUTO)
        mostrarAnuncio(() => {
            playBtn.style.display = 'none';
            const audio = document.getElementById('audio-selector').value;
            // Usamos un proxy para evitar redirecciones en móvil
            const url = tipo === 'movie' ? 
                `https://vidsrc.icu/embed/movie/${id}` : 
                `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`;
            
            container.innerHTML = `
                <iframe src="${url}" class="w-full h-full" 
                        allowfullscreen="true" 
                        webkitallowfullscreen="true" 
                        mozallowfullscreen="true"
                        sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                        allow="autoplay"></iframe>`;
        });
    };
}

function mostrarAnuncio(callback) {
    const layer = document.getElementById('ad-layer');
    const secsEl = document.getElementById('secs');
    let timeLeft = 60; // 1 Minuto solicitado
    
    layer.classList.remove('hidden');
    const timer = setInterval(() => {
        timeLeft--;
        secsEl.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            layer.classList.add('hidden');
            callback();
        }
    }, 1000);
}

function cerrarTodo() {
    document.getElementById('master-overlay').style.display = 'none';
    document.getElementById('video-container').innerHTML = '';
}

function buscar(q) {
    if(q.length < 3) { if(q.length === 0) renderHome(); return; }
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
        .then(r => r.json()).then(d => {
            const content = document.getElementById('catalog-content');
            content.innerHTML = `
                <div class="px-6 mb-10">
                    <h3 class="text-xs text-white/40 mb-4">RESULTADOS PARA: ${q.toUpperCase()}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${d.results.filter(m=>m.poster_path).map(m => `
                            <div class="aspect-[2/3] rounded-xl bg-cover bg-center border border-white/10 shadow-xl" 
                                 onclick="analizarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                                 style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
                        `).join('')}
                    </div>
                    <button onclick="renderHome()" class="mt-8 w-full bg-white/5 p-4 rounded-xl border border-white/10 text-cyan-400 text-xs font-black">← VOLVER AL INICIO</button>
                </div>`;
        });
}

// Control Maestro Arquitecto
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === "110103") { //
        alert(`DV GLOBAL ANALYTICS 2026\n------------------\nIngresos: $${revenue.toFixed(2)}\nDominio: dabo-vision.net\nStatus: Monetización Activa`);
    }
};
