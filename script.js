const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const genres = ["estrenos nuevos", "acción", "animes", "terror", "comedia"];
let revenue = parseFloat(localStorage.getItem('dabo_revenue')) || 1240.50;

window.onload = renderHome;

// 1. CARGAR INICIO
async function renderHome() {
    const container = document.getElementById('catalog-content');
    container.innerHTML = '';
    for (let g of genres) {
        const rowId = `row-${g.replace(/\s/g, '')}`;
        container.innerHTML += `<div class="mb-10"><h3 class="text-[10px] font-black uppercase text-cyan-400 mb-4 tracking-[4px] italic">${g}</h3>
                                <div class="flex gap-4 overflow-x-auto pb-4 scroll-hide" id="${rowId}"></div></div>`;
        const path = g === "estrenos nuevos" ? "trending/all/week" : `search/multi?query=${g}`;
        fetch(`https://api.themoviedb.org/3/${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}&language=es-ES`)
            .then(r => r.json()).then(data => {
                document.getElementById(rowId).innerHTML = data.results.filter(m => m.poster_path).map(m => `
                    <div class="min-w-[140px] h-[210px] rounded-xl bg-cover bg-center border border-white/10 active:scale-95 transition-all" 
                         onclick="identificarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                         style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
                `).join('');
            });
    }
}

// 2. BUSCADOR FUNCIONAL
function ejecutarBusqueda() {
    const q = document.getElementById('main-search').value;
    if(q.length < 2) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        const container = document.getElementById('catalog-content');
        container.innerHTML = `<button onclick="renderHome()" class="mb-8 text-cyan-400 text-xs font-bold uppercase underline">← Regresar al Inicio</button>
                               <div class="grid grid-cols-2 gap-4">
                               ${d.results.filter(m=>m.poster_path).map(m => `
                                   <div class="aspect-[2/3] rounded-xl bg-cover border border-white/10" 
                                        onclick="identificarContenido(${m.id}, '${m.media_type || (m.name ? 'tv' : 'movie')}')" 
                                        style="background-image:url('https://image.tmdb.org/t/p/w300${m.poster_path}')"></div>
                               `).join('')}</div>`;
    });
}
document.getElementById('main-search').onkeyup = (e) => { if(e.key === 'Enter') ejecutarBusqueda(); };

// 3. RECONOCER SERIES O PELÍCULAS
async function identificarContenido(id, tipo) {
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_KEY}&language=es-ES`);
        const data = await res.json();
        document.getElementById('serie-title').innerText = data.name;
        document.getElementById('seasons-container').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <div class="bg-white/5 p-5 rounded-xl border border-white/10 flex justify-between items-center active:bg-cyan-400/10" onclick="verEpisodios(${id}, ${s.season_number})">
                <span class="font-bold tracking-tighter">${s.name}</span>
                <i class="fas fa-chevron-right text-cyan-400"></i>
            </div>
        `).join('');
        document.getElementById('series-layer').style.display = 'block';
    } else {
        lanzarVideo(id, 'movie');
    }
}

async function verEpisodios(id, season) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-container').innerHTML = data.episodes.map(e => `
        <div class="bg-white/5 p-4 rounded-xl text-sm flex justify-between items-center" onclick="lanzarVideo(${id}, 'tv', ${season}, ${e.episode_number})">
            <span><b class="text-cyan-400 mr-2">${e.episode_number}.</b> ${e.name}</span>
            <i class="fas fa-play text-[10px] text-cyan-400"></i>
        </div>
    `).join('');
    document.getElementById('episodes-layer').style.display = 'block';
}

// 4. REPRODUCTOR MAESTRO
function lanzarPlayer(id, tipo, s=1, e=1) {
    const p = document.getElementById('player');
    const root = document.getElementById('video-root');
    const btn = document.getElementById('play-btn');
    
    p.classList.remove('hidden');
    root.innerHTML = '';
    btn.style.display = 'flex';

    btn.onclick = () => {
        btn.style.display = 'none';
        
        // Usamos vidsrc.xyz que tiene mejor soporte multiaudio
        const url = tipo === 'movie' ? 
            `https://vidsrc.xyz/embed/movie?tmdb=${id}` : 
            `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
        
        root.innerHTML = `
            <iframe src="${url}" 
                style="width:100%; height:100%;" 
                allowfullscreen="true" 
                webkitallowfullscreen="true" 
                mozallowfullscreen="true" 
                allow="autoplay; encrypted-media" 
                referrerpolicy="no-referrer">
            </iframe>`;
    };
}


function cerrarCapa(id) { document.getElementById(id).style.display = 'none'; }
function cerrarReproductor() { 
    document.getElementById('player-layer').style.display = 'none'; 
    document.getElementById('video-root').innerHTML = ''; 
}

// PANEL ARQUITECTO
document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN:") === "110103") alert("Revenue: $" + revenue.toFixed(2));
};
function mostrarLegal(tipo) {
    const layer = document.getElementById('legal-layer');
    const content = document.getElementById('legal-content');
    layer.style.display = 'block';

    if (tipo === 'privacidad') {
        content.innerHTML = `
            <h2 class="text-2xl font-black text-white italic">POLÍTICA DE PRIVACIDAD</h2>
            <p>En <b>dabo-vision.net</b>, la privacidad de nuestros usuarios es prioridad. No recolectamos datos personales identificables sin consentimiento.</p>
            <p><b>Cookies:</b> Utilizamos cookies propias y de terceros (Google AdSense) para mejorar la experiencia y mostrar publicidad relevante.</p>
            <p><b>Publicidad de Google:</b> Google utiliza la cookie de DART para mostrar anuncios basados en intereses. Puedes desactivarla en la configuración de anuncios de tu cuenta de Google.</p>
        `;
    } else {
        content.innerHTML = `
            <h2 class="text-2xl font-black text-white italic">TÉRMINOS DE USO</h2>
            <p>El acceso a <b>DaBo Vision Global</b> implica la aceptación de estos términos.</p>
            <p><b>Uso del servicio:</b> Esta plataforma es un motor de búsqueda de metadatos que utiliza la API de TMDB. El contenido visual es servido por proveedores externos independientes.</p>
            <p><b>Responsabilidad:</b> No almacenamos archivos de video en nuestros servidores. El usuario es responsable del uso que haga de la información proporcionada.</p>
            <p><b>Propiedad Intelectual:</b> Todos los logos y marcas pertenecen a sus respectivos dueños.</p>
        `;
    }
}
// Servidor con mayor soporte de idiomas (vidsrc.xyz)
const url = tipo === 'movie' ? 
    `https://vidsrc.xyz/embed/movie?tmdb=${id}` : 
    `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
