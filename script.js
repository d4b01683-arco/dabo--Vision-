const TMDB_KEY = 'a6178823f5e2f865dfd88e8cade51391';
const contentArea = document.getElementById('catalog-results');

// IDs oficiales de géneros de TMDB
const GENEROS = {
    "accion": 28, "comedia": 35, "terror": 27, "romance": 10749,
    "ciencia_ficcion": 878, "fantasia": 14, "historia": 36,
    "infantil": 10751, "drama": 18, "animacion": 16
};

window.onload = () => {
    // Secciones Dinámicas
    cargarSeccion("Estrenos Nuevos", "movie/now_playing");
    cargarSeccion("Tendencias", "trending/all/day");
    
    // Catálogos por Género (Filtrado real)
    cargarSeccion("Ciencia Ficción", "discover/movie", `&with_genres=${GENEROS.ciencia_ficcion}`);
    cargarSeccion("Historia", "discover/movie", `&with_genres=${GENEROS.historia}`);
    cargarSeccion("Fantasía", "discover/movie", `&with_genres=${GENEROS.fantasia}`);
    cargarSeccion("Acción", "discover/movie", `&with_genres=${GENEROS.accion}`);
    cargarSeccion("Terror", "discover/movie", `&with_genres=${GENEROS.terror}`);
    cargarSeccion("Animación / Anime", "discover/movie", `&with_genres=${GENEROS.animacion}`);
};

async function cargarSeccion(titulo, path, extraParams = "") {
    try {
        // La clave es añadir extraParams al final de la URL
        const url = `https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=es-ES${extraParams}`;
        const res = await fetch(url);
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
        console.error("Error en " + titulo, error);
    }
}

// Reproductor (Asegúrate de que esta función exista para que los videos funcionen)
function lanzarVideo(id, tipo, s=1, e=1) {
    const root = document.getElementById('video-root');
    document.getElementById('player-view').classList.remove('hidden');
    const url = tipo === 'movie' 
        ? `https://vidsrc.pro/embed/movie/${id}` 
        : `https://vidsrc.pro/embed/tv/${id}/${s}/${e}`;
    
    root.innerHTML = `<iframe src="${url}" class="w-full h-full border-none" allowfullscreen allow="autoplay"></iframe>`;
}
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
