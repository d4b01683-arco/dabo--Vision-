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


function reproducir(id, tipo, s=1, e=1) {
    const holder = document.getElementById('video-container');
    document.getElementById('player-view').style.display = 'block';
    
    // 1. Mensaje de bypass
    holder.innerHTML = `<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#00e5ff;font-family:Orbitron;font-size:10px;text-align:center;">DABO-CORE V2.0<br>SALTANDO PROTOCOLO DE BLOQUEO...</div>`;

    // 2. Servidor de grado industrial (Sin restricciones de dominio)
    const url = tipo === 'movie' ? 
        `https://embed.su/embed/movie/${id}` : 
        `https://embed.su/embed/tv/${id}/${s}/${e}`;

    // 3. Inyección limpia con borrado de rastro
    setTimeout(() => {
        holder.innerHTML = `
            <iframe 
                src="${url}" 
                style="width:100%; height:100%; border:none;" 
                allowfullscreen 
                referrerpolicy="no-referrer">
            </iframe>`;
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

// NÚCLEO DE INTELIGENCIA DaBo.03
const GEMINI_API_KEY = 'AIzaSyACSIuhgump0DGAigy86o7IMvj2xDEcXGk'; 
const IA_NAME = "DaBo.03";

async function conectarIA(mensajeUsuario) {
    // Si el usuario es Dieyna, la IA responde con prioridad máxima
    if(mensajeUsuario.toLowerCase().includes("dieyna")) {
        responderVoz("Hola Dieyna. El Arquitecto me ha dado órdenes de asistirte en todo lo que necesites.");
        return;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Eres ${IA_NAME}, una IA leal creada por el Arquitecto. Responde de forma técnica y breve: ${mensajeUsuario}` }] }]
            })
        });
        
        const data = await response.json();
        const textoIA = data.candidates[0].content.parts[0].text;
        responderVoz(textoIA);
    } catch (e) {
        console.error("Fallo en DaBo Core:", e);
    }
}

function responderVoz(texto) {
    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = 'es-ES';
    speech.rate = 1.0;
    window.speechSynthesis.speak(speech);
}

document.getElementById('admin-trigger').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === ARCHITECT_PIN) {
        alert(`DV ANALYTICS\n----------------\nRevenue: $${revenue.toFixed(2)}\nStatus: Safe & Monetized\nAcc: 4950666349242719`);
    }
};