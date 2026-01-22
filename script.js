import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD0PZK3Prt5CufdQyBOTrsGFPxYzt0l_XU",
  authDomain: "ghost-chat-an0nimous.firebaseapp.com",
  databaseURL: "https://ghost-chat-an0nimous-default-rtdb.firebaseio.com",
  projectId: "ghost-chat-an0nimous",
  storageBucket: "ghost-chat-an0nimous.firebasestorage.app",
  messagingSenderId: "611834273169",
  appId: "1:611834273169:web:f4a23d0bfb22fe1f7a0e30"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables de Estado
let user = JSON.parse(localStorage.getItem('ghost_session')) || null;
let currentChat = 'secure';

// --- CONTROL DE PANTALLAS ---
const showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';
};

// --- INICIO DE LA APP ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Quitar Splash después de 2.5s
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.display = 'none';
        
        if (user) {
            initUserData();
            showScreen('main-screen');
        } else {
            showScreen('login-screen');
        }
    }, 2500);

    // 2. Vincular botón de Entrada
    document.getElementById('btn-entrar').onclick = () => {
        const nick = document.getElementById('username').value.trim();
        const pass = document.getElementById('chat-key').value.trim();
        
        if (nick && pass) {
            const idUnique = "GHOST-" + Math.floor(Math.random() * 900000 + 100000);
            user = { nick, pass, id: idUnique, theme: '#bc13fe' };
            localStorage.setItem('ghost_session', JSON.stringify(user));
            initUserData();
            showScreen('main-screen');
        } else {
            alert("Completa los datos de acceso.");
        }
    };

    // 3. Ojito de contraseña
    document.getElementById('toggle-pass').onclick = () => {
        const input = document.getElementById('chat-key');
        input.type = input.type === 'password' ? 'text' : 'password';
    };

    // 4. Botones Navegación
    document.getElementById('btn-sala-segura').onclick = () => startChat('secure');
    document.getElementById('btn-sala-normal').onclick = () => startChat('normal');
    document.getElementById('btn-volver').onclick = () => showScreen('main-screen');
    document.getElementById('btn-config-nav').onclick = () => showScreen('config-screen');
    document.getElementById('btn-cerrar-config').onclick = () => showScreen('main-screen');
    
    document.getElementById('btn-logout').onclick = () => {
        localStorage.clear();
        location.reload();
    };

    // 5. Envío de Mensajes
    document.getElementById('btn-enviar').onclick = () => {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        if(!text) return;

        const encrypted = currentChat === 'secure' ? CryptoJS.AES.encrypt(text, user.pass).toString() : text;
        
        push(ref(db, 'mensajes_' + currentChat), {
            sender: user.nick,
            text: encrypted,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        input.value = "";
    };
});

const initUserData = () => {
    document.getElementById('conf-nick').innerText = user.nick;
    document.getElementById('conf-id').innerText = user.id;
    if(user.theme) document.documentElement.style.setProperty('--primary', user.theme);
};

const startChat = (type) => {
    currentChat = type;
    document.getElementById('chat-title').innerText = type === 'secure' ? 'Canal Cifrado' : 'Canal Abierto';
    document.getElementById('chat-box').innerHTML = "";
    showScreen('chat-screen');
    
    // Escuchar mensajes de la sala específica
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        renderMessage(data.val());
    });
};

const renderMessage = (m) => {
    let content = m.text;
    if(currentChat === 'secure') {
        try {
            const bytes = CryptoJS.AES.decrypt(m.text, user.pass);
            content = bytes.toString(CryptoJS.enc.Utf8);
            if(!content) content = "[Cifrado: Llave Inválida]";
        } catch(e) { content = "[Error de Cifrado]"; }
    }

    const div = document.createElement('div');
    div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
    div.innerHTML = `<strong>${m.sender}</strong><br>${content}<br><small style="font-size:0.6rem; opacity:0.5">${m.time}</small>`;
    const box = document.getElementById('chat-box');
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
};

// --- FONDO MATRIX ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const drops = Array(Math.floor(canvas.width/20)).fill(1);
function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = user?.theme || "#bc13fe";
    ctx.font = "15px monospace";
    drops.forEach((y,i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
    });
}
setInterval(draw, 50);
