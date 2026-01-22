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
const dbRef = ref(db, 'mensajes');

let user = localStorage.getItem('ghost_user') || "";
let chatKey = localStorage.getItem('ghost_key') || "";
let userColor = localStorage.getItem('ghost_color') || "#bc13fe";

// Función para actualizar color dinámicamente
const updateThemeColor = (color) => {
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('ghost_color', color);
};

window.showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'flex';
};

// Al iniciar
if(user && chatKey) {
    updateThemeColor(userColor);
    document.getElementById('display-name').innerText = user;
    showScreen('main-screen');
}

// Login
document.getElementById('btn-entrar').onclick = () => {
    const nick = document.getElementById('username').value;
    const key = document.getElementById('chat-key').value;
    if(nick && key) {
        user = nick; chatKey = key;
        localStorage.setItem('ghost_user', nick);
        localStorage.setItem('ghost_key', key);
        document.getElementById('display-name').innerText = user;
        updateThemeColor(userColor);
        showScreen('main-screen');
    }
};

// Abrir Configuración
document.getElementById('btn-config').onclick = () => {
    document.getElementById('config-username').value = user;
    document.getElementById('theme-color-picker').value = userColor;
    document.getElementById('encrypted-nick').innerText = CryptoJS.MD5(user).toString();
    showScreen('config-screen');
};

// Guardar Configuración
document.getElementById('btn-save-config').onclick = () => {
    user = document.getElementById('config-username').value;
    userColor = document.getElementById('theme-color-picker').value;
    localStorage.setItem('ghost_user', user);
    updateThemeColor(userColor);
    showScreen('main-screen');
};

// Chat Logic
document.getElementById('btn-enviar').onclick = () => {
    const text = document.getElementById('message-input').value;
    if(text) {
        const encrypted = CryptoJS.AES.encrypt(text, chatKey).toString();
        push(dbRef, { usuario: user, texto: encrypted, tiempo: Date.now() });
        document.getElementById('message-input').value = "";
    }
};

onChildAdded(dbRef, (data) => {
    const msg = data.val();
    let decrypted = "";
    try {
        const bytes = CryptoJS.AES.decrypt(msg.texto, chatKey);
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if(!decrypted) decrypted = "[Mensaje Cifrado]";
    } catch(e) { decrypted = "[Error de Llave]"; }

    const div = document.createElement('div');
    div.className = `message ${msg.usuario === user ? 'mine' : 'other'}`;
    div.innerHTML = `<strong>${msg.usuario}</strong><br>${decrypted}`;
    document.getElementById('chat-box').appendChild(div);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
});

// Matrix Background
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const columns = canvas.width / 20;
const drops = Array(Math.floor(columns)).fill(1);
function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = userColor;
    ctx.font = "15px monospace";
    drops.forEach((y, i) => {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(draw, 50);
