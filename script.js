import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Variables Globales
let user = localStorage.getItem('ghost_user') || "";
let chatKey = localStorage.getItem('ghost_key') || "";
let currentTheme = localStorage.getItem('ghost_theme') || "purple";

// Cambiar pantallas
window.showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'flex';
};

// Cambiar Temas
window.changeTheme = (color) => {
    document.body.className = `theme-${color}`;
    localStorage.setItem('ghost_theme', color);
};

// Al iniciar, cargar sesión si existe
if(user && chatKey) {
    document.getElementById('display-name').innerText = user;
    changeTheme(currentTheme);
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
        showScreen('main-screen');
    }
};

// Configuración
document.getElementById('btn-config').onclick = () => {
    document.getElementById('config-username').value = user;
    // Mostrar Alias Encriptado (SHA256 simulado con MD5 o similar para visual)
    document.getElementById('encrypted-nick').innerText = CryptoJS.MD5(user).toString().substring(0,16);
    showScreen('config-screen');
};

document.getElementById('btn-save-config').onclick = () => {
    user = document.getElementById('config-username').value;
    localStorage.setItem('ghost_user', user);
    document.getElementById('display-name').innerText = user;
    showScreen('main-screen');
};

// Enviar Mensaje Cifrado
document.getElementById('btn-enviar').onclick = () => {
    const text = document.getElementById('message-input').value;
    if(text) {
        const encrypted = CryptoJS.AES.encrypt(text, chatKey).toString();
        push(dbRef, { usuario: user, texto: encrypted, tiempo: Date.now() });
        document.getElementById('message-input').value = "";
    }
};

// Recibir y Descifrar
onChildAdded(dbRef, (data) => {
    const msg = data.val();
    let decrypted = "";
    try {
        const bytes = CryptoJS.AES.decrypt(msg.texto, chatKey);
        decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if(!decrypted) decrypted = "[Cifrado: Llave Inválida]";
    } catch(e) { decrypted = "[Error de Cifrado]"; }

    const div = document.createElement('div');
    div.className = `message ${msg.usuario === user ? 'mine' : 'other'}`;
    div.innerHTML = `<strong>${msg.usuario}:</strong> <br> ${decrypted}`;
    document.getElementById('chat-box').appendChild(div);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
});

// Matrix Background (Simplificado)
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const columns = canvas.width / 15;
const drops = Array(Math.floor(columns)).fill(1);
function draw() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary');
    ctx.font = "15px monospace";
    drops.forEach((y, i) => {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 15, y * 15);
        if (y * 15 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(draw, 50);
