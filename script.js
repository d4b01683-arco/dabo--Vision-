/**
 * DV GLOBAL - PRO HYBRID ENGINE v8.0
 * Database: Local JSON + Multi-API
 */

const KEYS = {
    tmdb: 'a6178823f5e2f865dfd88e8cade51391',
    trakt: 'e27de53be7675061564fde80a3b1e04443b22831627664ce1c8119476d959ca0'
};

let DB_PROPIA = [];

// CARGAR BASE DE DATOS EXTERNA AL INICIAR
async function cargarBaseDatosPropia() {
    try {
        const response = await fetch('videos.json');
        const data = await response.json();
        DB_PROPIA = data.manual_database;
        console.log("DV GLOBAL: Base de datos propia cargada.");
    } catch (e) {
        console.warn("No se encontró videos.json o está vacío.");
    }
}

window.onload = async () => {
    await cargarBaseDatosPropia();
    await cargarSeccionTrakt("Tendencias Globales", "movies/trending");
    await cargarSeccionTMDB("Estrenos", "movie/now_playing");
    await cargarSeccionTVMaze("Series & Anime", "anime");
};

// --- REPRODUCTOR HÍBRIDO (EL CORAZÓN DEL SISTEMA) ---
function lanzarReproductor(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    const selector = document.getElementById('server-selector');
    document.getElementById('player-view').classList.remove('hidden');

    // BUSCAMOS SI EL VIDEO EXISTE EN NUESTRO SERVIDOR PROPIO
    const videoPropio = DB_PROPIA.find(item => 
        item.tmdb_id == id && 
        item.tipo == tipo && 
        (tipo === 'movie' || (item.temporada == s && item.episodio == e))
    );

    let botonesHTML = "";

    if (videoPropio) {
        // Generamos botones para cada idioma disponible en tu JSON
        Object.keys(videoPropio.links).forEach(idioma => {
            const banderas = { latino: "🇲🇽", castellano: "🇪🇸", english: "🇺🇸", french: "🇫🇷" };
            botonesHTML += `
                <button onclick="cargarVideoDirecto('${videoPropio.links[idioma]}')" 
                    class="bg-cyan-600 hover:bg-white hover:text-black text-[8px] font-black px-4 py-2 rounded-full uppercase transition-all">
                    ${banderas[idioma] || "🌐"} ${idioma}
                </button>
            `;
        });
    }

    // SERVIDORES AUTOMÁTICOS DE RESPALDO
    const servidores = [
        { nombre: "AUTO 1 (IDIOMAS)", url: tipo === 'movie' ? `https://vidsrc.pro/embed/movie/${id}` : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
        { nombre: "AUTO 2 (ESTABLE)", url: tipo === 'movie' ? `https://vidsrc.cc/v2/embed/movie/${id}` : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` }
    ];

    selector.innerHTML = botonesHTML + servidores.map(serv => `
        <button onclick="cambiarServidor('${serv.url}')" 
            class="bg-white/5 border border-white/10 hover:bg-cyan-500 text-[8px] font-black px-4 py-2 rounded-full uppercase">
            ${serv.nombre}
        </button>
    `).join('');

    // Prioridad: Si hay video propio, cargar el primer idioma. Si no, servidor AUTO 1.
    if (videoPropio) {
        const primerIdioma = Object.keys(videoPropio.links)[0];
        cargarVideoDirecto(videoPropio.links[primerIdioma]);
    } else {
        cambiarServidor(servidores[0].url);
    }
}

// CARGA DIRECTA (ESTILO NETFLIX/DISNEY)
function cargarVideoDirecto(url) {
    const root = document.getElementById('video-root');
    root.innerHTML = `
        <video controls autoplay class="w-full h-full bg-black shadow-2xl">
            <source src="${url}" type="video/mp4">
            <source src="${url}" type="video/webm">
            Tu navegador no soporta el reproductor nativo de DV GLOBAL.
        </video>
    `;
}

function cambiarServidor(url) {
    const root = document.getElementById('video-root');
    root.innerHTML = `<iframe src="${url}" style="width:100%; height:100%; border:none;" 
                        allowfullscreen allow="autoplay; encrypted-media; fullscreen" referrerpolicy="no-referrer"></iframe>`;
}

// ... (Mantén el resto de funciones como cargarSeccionTMDB, abrirModalSerie, etc. del código anterior)
