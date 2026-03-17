
const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const contentArea = document.getElementById('catalog-results');

// Diccionario de IDs de géneros de TMDB
const GENEROS = {
    "acción": 28, "comedia": 35, "terror": 27, "romance": 10749,
    "ciencia y ficción": 878, "fantasía": 14, "historia": 36,
    "infantil": 10751, "sobrenatural": 9648, "aventura": 12
};

window.onload = () => {
    // 1. Secciones Principales
    cargarSeccion("Estrenos Nuevos", "movie/now_playing");
    cargarSeccion("Tendencias", "trending/all/day");
    
    // 2. Por Tipo
    cargarSeccion("Películas", "discover/movie");
    cargarSeccion("Series de TV", "discover/tv");
    cargarSeccion("Animes", "discover/tv", "&with_keywords=210024&with_original_language=ja");

    // 3. Por Géneros (Usando el diccionario)
    cargarSeccion("Acción", "discover/movie", `&with_genres=${GENEROS["acción"]}`);
    cargarSeccion("Comedia", "discover/movie", `&with_genres=${GENEROS["comedia"]}`);
    cargarSeccion("Terror", "discover/movie", `&with_genres=${GENEROS["terror"]}`);
    cargarSeccion("Romance y Amor", "discover/movie", `&with_genres=${GENEROS["romance"]}`);
    cargarSeccion("Ciencia Ficción", "discover/movie", `&with_genres=${GENEROS["ciencia y ficción"]}`);
    cargarSeccion("Fantasía", "discover/movie", `&with_genres=${GENEROS["fantasía"]}`);
    cargarSeccion("Historia", "discover/movie", `&with_genres=${GENEROS["historia"]}`);
    cargarSeccion("Infantil", "discover/movie", `&with_genres=${GENEROS["infantil"]}`);
};

async function cargarSeccion(titulo, path, extraParams = "") {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=es-ES${extraParams}`);
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) return;

        let html = `
            <section class="mb-10">
                <h2 class="text-[10px] font-black uppercase text-cyan-400 mb-6 tracking-[5px] italic">${titulo}</h2>
                <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide">`;
        
        data.results.forEach(m => {
            if(m.poster_path) {
                const tipo = m.media_type || (m.title ? 'movie' : 'tv');
                html += `
                    <div class="min-w-[160px] h-[240px] rounded-3xl bg-cover bg-center border border-white/10 active:scale-95 transition-all cursor-pointer shadow-2xl" 
                         onclick="verificarContenido(${m.id}, '${tipo}')" 
                         style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')">
                    </div>`;
            }
        });
        
        html += `</div></section>`;
        contentArea.innerHTML += html;
    } catch (error) {
        console.error("Error cargando sección:", titulo, error);
    }
}

async function cargarSeccion(titulo, path) {
    const res = await fetch(`https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    
    let html = `
        <section class="mb-8">
            <h2 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px] italic">${titulo}</h2>
            <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide">`;
    
    data.results.forEach(m => {
        if(m.poster_path) {
            const tipo = m.media_type || (m.title ? 'movie' : 'tv');
            html += `
                <div class="min-w-[140px] h-[210px] rounded-2xl bg-cover bg-center border border-white/5 cursor-pointer shadow-xl" 
                     onclick="gestionarClick(${m.id}, '${tipo}')" 
                     style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')">
                </div>`;
        }
    });
    contentArea.innerHTML += html + `</div></section>`;
}

function gestionarClick(id, tipo) {
    if (tipo === 'tv') abrirModalSeries(id);
    else lanzarVideo(id, 'movie');
}

async function abrirModalSeries(id) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
        <div class="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center" onclick="cargarCapitulos(${id}, ${s.season_number})">
            <span class="font-bold text-xs uppercase italic">${s.name}</span>
            <span class="text-cyan-400 text-[10px]">${s.episode_count} EPS</span>
        </div>`).join('');
    document.getElementById('series-modal').classList.remove('hidden');
}

async function cargarCapitulos(id, s) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${s}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-3 rounded-lg flex justify-between items-center" onclick="lanzarVideo(${id}, 'tv', ${s}, ${e.episode_number})">
            <span class="text-xs italic"><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
        </div>`).join('');
    document.getElementById('episodes-container').classList.remove('hidden');
}

// SOLUCIÓN AL PROBLEMA DE REPRODUCCIÓN (PANTALLA NEGRA)
function lanzarVideo(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    document.getElementById('player-view').classList.remove('hidden');
    
    // Cambiamos a vidsrc.xyz que es el más compatible con iPhone/Android
    const url = tipo === 'movie' 
        ? `https://vidsrc.xyz/embed/movie?tmdb=${id}` 
        : `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
    
    root.innerHTML = `
        <iframe src="${url}" 
            style="width:100%; height:100%; border:none;" 
            allowfullscreen allow="autoplay">
        </iframe>`;
}

// FUNCIONES DE PRIVACIDAD (TU CÓDIGO)
function togglePrivacy(show) {
    const modal = document.getElementById('privacy-modal');
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Escape') togglePrivacy(false); });
function cerrarPlayer() { document.getElementById('player-view').classList.add('hidden'); document.getElementById('video-root').innerHTML = ''; }
function cerrarModalSeries() { document.getElementById('series-modal').classList.add('hidden'); }

// BUSCADOR
document.getElementById('main-search').addEventListener('keypress', async (e) => {
    if(e.key === 'Enter') {
        const q = e.target.value;
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`);
        const data = await res.json();
        contentArea.innerHTML = `<div class="grid grid-cols-2 gap-4">
            ${data.results.filter(m => m.poster_path).map(m => `
                <div class="aspect-[2/3] rounded-xl bg-cover" onclick="gestionarClick(${m.id}, '${m.media_type}')" style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
            `).join('')}</div>`;
    }
});
// Función para mostrar/ocultar la política de privacidad
function togglePrivacy(show) {
    const modal = document.getElementById('privacy-modal');
    if (show) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll de fondo
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Libera el scroll
    }
}

// Cerrar con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePrivacy(false);
});
