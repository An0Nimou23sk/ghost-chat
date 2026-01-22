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

let user = JSON.parse(localStorage.getItem('ghost_session')) || null;
let currentChat = 'secure';

// --- NAVEGACIÓN ---
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
}

// --- PANTALLA DE CARGA ---
window.onload = () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        if (user) {
            initUserData();
            showScreen('main-screen');
        } else {
            showScreen('login-screen');
        }
    }, 2500);
};

// --- LOGICA DE INICIO DE SESIÓN ---
document.getElementById('btn-entrar').onclick = () => {
    const nick = document.getElementById('username').value.trim();
    const pass = document.getElementById('chat-key').value.trim();
    
    if (nick && pass) {
        const idUnique = "ID-" + Math.floor(Math.random() * 900000 + 100000);
        user = { nick, pass, id: idUnique, theme: '#bc13fe' };
        localStorage.setItem('ghost_session', JSON.stringify(user));
        initUserData();
        showScreen('main-screen');
    } else {
        alert("Por favor, ingresa un alias y una llave.");
    }
};

// --- OJITO DE CONTRASEÑA ---
document.getElementById('toggle-pass').onclick = () => {
    const passInput = document.getElementById('chat-key');
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
};

function initUserData() {
    document.getElementById('conf-nick').innerText = user.nick;
    document.getElementById('conf-id').innerText = user.id;
    document.getElementById('display-name').innerText = user.nick.toUpperCase();
}

// --- SALAS ---
document.getElementById('btn-sala-segura').onclick = () => startChat('secure');
document.getElementById('btn-sala-normal').onclick = () => startChat('normal');
document.getElementById('btn-volver').onclick = () => showScreen('main-screen');
document.getElementById('btn-config-nav').onclick = () => showScreen('config-screen');
document.getElementById('btn-cerrar-config').onclick = () => showScreen('main-screen');

function startChat(type) {
    currentChat = type;
    document.getElementById('chat-title').innerText = type === 'secure' ? 'Canal Cifrado' : 'Canal Abierto';
    document.getElementById('chat-box').innerHTML = "";
    showScreen('chat-screen');
    
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        renderMessage(data.val());
    });
}

// --- MENSAJES ---
document.getElementById('btn-enviar').onclick = async () => {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (!text) return;

    const encryptedText = currentChat === 'secure' ? CryptoJS.AES.encrypt(text, user.pass).toString() : text;
    
    push(ref(db, 'mensajes_' + currentChat), {
        sender: user.nick,
        text: encryptedText,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString()
    });
    input.value = "";
};

function renderMessage(m) {
    let content = m.text;
    if(currentChat === 'secure') {
        try {
            const bytes = CryptoJS.AES.decrypt(m.text, user.pass);
            content = bytes.toString(CryptoJS.enc.Utf8);
            if(!content) content = "[Cifrado: Llave Errónea]";
        } catch(e) { content = "[Error de Descifrado]"; }
    }

    const div = document.createElement('div');
    div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
    div.innerHTML = `<strong>${m.sender}</strong><br>${content}<span class="msg-time">${m.time}</span>`;
    document.getElementById('chat-box').appendChild(div);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
}

// --- MATRIX ---
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const drops = Array(Math.floor(canvas.width/20)).fill(1);
function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = user?.theme || "#bc13fe";
    drops.forEach((y,i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
    });
}
setInterval(draw, 50);
