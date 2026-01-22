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

function goTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        if (user) { loadSettings(); goTo('main-screen'); } 
        else { goTo('login-screen'); }
    }, 2000);

    // --- BUSCADOR REAL ---
    document.getElementById('search-input').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const text = item.innerText.toLowerCase();
            const searchData = item.getAttribute('data-search');
            // Busca en el texto visible o en la ID/Tags ocultos
            if(text.includes(val) || searchData.includes(val)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        });
    };

    // LOGIN
    document.getElementById('btn-entrar').onclick = () => {
        const nick = document.getElementById('username').value;
        const pass = document.getElementById('chat-key').value;
        if(nick && pass) {
            // Generar ID único por usuario
            const randomID = "GHOST-" + Math.random().toString(36).substr(2, 6).toUpperCase();
            user = { nick, pass, id: randomID, color: '#bc13fe', prefs: {} };
            localStorage.setItem('ghost_session', JSON.stringify(user));
            location.reload();
        }
    };

    // NAVEGACIÓN
    document.getElementById('btn-config-nav').onclick = () => goTo('config-screen');
    document.getElementById('btn-cerrar-config').onclick = () => {
        savePrefs();
        goTo('main-screen');
    };
    document.getElementById('btn-logout').onclick = () => { localStorage.clear(); location.reload(); };
    document.getElementById('item-secure').onclick = () => openChat('secure');
    document.getElementById('item-normal').onclick = () => openChat('normal');
    document.getElementById('btn-volver').onclick = () => goTo('main-screen');
    document.getElementById('btn-enviar').onclick = sendMsg;
    document.getElementById('toggle-pass').onclick = () => {
        const input = document.getElementById('chat-key');
        input.type = input.type === 'password' ? 'text' : 'password';
    };
});

function loadSettings() {
    document.getElementById('conf-nick').innerText = user.nick;
    document.getElementById('conf-id').innerText = user.id;
    document.documentElement.style.setProperty('--primary', user.color);
    document.getElementById('color-picker').value = user.color;
    // Cargar Checkboxes
    if(user.prefs) {
        document.getElementById('check-mic').checked = user.prefs.mic;
        document.getElementById('check-read').checked = user.prefs.read;
        document.getElementById('delete-timer').value = user.prefs.delete || 'off';
    }
}

function savePrefs() {
    user.color = document.getElementById('color-picker').value;
    user.prefs = {
        mic: document.getElementById('check-mic').checked,
        read: document.getElementById('check-read').checked,
        delete: document.getElementById('delete-timer').value
    };
    localStorage.setItem('ghost_session', JSON.stringify(user));
    document.documentElement.style.setProperty('--primary', user.color);
}

function openChat(type) {
    currentChat = type;
    document.getElementById('chat-title-display').innerText = type === 'secure' ? '🔒 Sala Encriptada' : '💬 Canal Público';
    const box = document.getElementById('chat-box');
    box.innerHTML = "";
    goTo('chat-screen');
    off(ref(db, 'mensajes_' + currentChat));
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        const m = data.val();
        let text = m.text;
        if(currentChat === 'secure') {
            try {
                const dec = CryptoJS.AES.decrypt(m.text, user.pass).toString(CryptoJS.enc.Utf8);
                text = dec || "[Cifrado]";
            } catch(e) { text = "[Error de Llave]"; }
        }
        const div = document.createElement('div');
        div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
        div.innerHTML = `<b>${m.sender}</b><br>${text}`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    });
}

function sendMsg() {
    const input = document.getElementById('message-input');
    if(!input.value) return;
    const txt = currentChat === 'secure' ? CryptoJS.AES.encrypt(input.value, user.pass).toString() : input.value;
    push(ref(db, 'mensajes_' + currentChat), { sender: user.nick, text: txt });
    input.value = "";
}

// Matrix Animation (Simplificada para rendimiento)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const columns = Math.floor(canvas.width / 20);
const drops = new Array(columns).fill(1);
setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = user?.color || "#bc13fe";
    drops.forEach((y, i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}, 50);
