import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, off } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

let user = JSON.parse(localStorage.getItem('ghost_session')) || null;
let currentChat = 'secure';

// --- NAVEGACIÓN SEGURA ---
function goTo(id) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.style.display = 'none');
    const target = document.getElementById(id);
    if(target) target.style.display = 'flex';
}

// --- INICIO DE LA APP ---
window.addEventListener('DOMContentLoaded', () => {
    // Splash Screen
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.style.display = 'none';
        
        if (user) {
            updateUI();
            goTo('main-screen');
        } else {
            goTo('login-screen');
        }
    }, 2000);

    // BOTÓN ENTRAR
    const btnEntrar = document.getElementById('btn-entrar');
    if(btnEntrar) {
        btnEntrar.onclick = () => {
            const nick = document.getElementById('username').value;
            const pass = document.getElementById('chat-key').value;
            if(nick && pass) {
                user = { nick, pass, id: "GHOST-"+Math.floor(Math.random()*9999), color: '#bc13fe' };
                localStorage.setItem('ghost_session', JSON.stringify(user));
                location.reload();
            }
        };
    }

    // OJITO
    const eye = document.getElementById('toggle-pass');
    if(eye) {
        eye.onclick = () => {
            const input = document.getElementById('chat-key');
            input.type = input.type === 'password' ? 'text' : 'password';
        };
    }

    // CONFIGURACIÓN
    document.getElementById('btn-config-nav').onclick = () => goTo('config-screen');
    document.getElementById('btn-cerrar-config').onclick = () => goTo('main-screen');
    document.getElementById('btn-logout').onclick = () => { localStorage.clear(); location.reload(); };

    // SALAS
    document.getElementById('item-secure').onclick = () => openChatRoom('secure');
    document.getElementById('item-normal').onclick = () => openChatRoom('normal');
    document.getElementById('btn-volver').onclick = () => goTo('main-screen');

    // ENVIAR
    document.getElementById('btn-enviar').onclick = sendMessage;

    // COLOR
    document.getElementById('color-picker').oninput = (e) => {
        const c = e.target.value;
        document.documentElement.style.setProperty('--primary', c);
        user.color = c;
        localStorage.setItem('ghost_session', JSON.stringify(user));
    };
});

function updateUI() {
    if(!user) return;
    document.getElementById('conf-id').innerText = user.id;
    document.documentElement.style.setProperty('--primary', user.color || '#bc13fe');
    document.getElementById('color-picker').value = user.color || '#bc13fe';
}

function openChatRoom(type) {
    currentChat = type;
    document.getElementById('chat-title-display').innerText = type === 'secure' ? 'Canal Cifrado' : 'Canal Abierto';
    const box = document.getElementById('chat-box');
    box.innerHTML = "";
    goTo('chat-screen');

    // Limpiar escuchas previas para no duplicar mensajes
    off(ref(db, 'mensajes_' + currentChat));

    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        const m = data.val();
        let txt = m.text;
        if(currentChat === 'secure') {
            try {
                const bytes = CryptoJS.AES.decrypt(m.text, user.pass);
                txt = bytes.toString(CryptoJS.enc.Utf8) || "[Cifrado]";
            } catch(e) { txt = "[Error de Llave]"; }
        }
        const div = document.createElement('div');
        div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
        div.innerHTML = `<b>${m.sender}</b><br>${txt}`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    });
}

function sendMessage() {
    const input = document.getElementById('message-input');
    if(!input.value) return;
    const txt = currentChat === 'secure' ? CryptoJS.AES.encrypt(input.value, user.pass).toString() : input.value;
    push(ref(db, 'mensajes_' + currentChat), { sender: user.nick, text: txt });
    input.value = "";
}

// MATRIX ANIMATION
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const drops = Array(Math.floor(canvas.width/20)).fill(1);
setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = user?.color || "#bc13fe";
    drops.forEach((y,i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
    });
}, 50);
