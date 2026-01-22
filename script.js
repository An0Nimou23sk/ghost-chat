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

// Estados locales persistentes
let user = JSON.parse(localStorage.getItem('ghost_session')) || null;
let currentChat = 'secure';

// 1. Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.fadeOut = "slow";
        document.getElementById('splash-screen').style.display = 'none';
        if (user) showScreen('main-screen');
        else showScreen('login-screen');
        initApp();
    }, 3000);
});

// 2. Navegación
window.showScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
};

// 3. Login e Identificador Único
document.getElementById('btn-entrar').onclick = () => {
    const nick = document.getElementById('username').value;
    const pass = document.getElementById('chat-key').value;
    if(nick && pass) {
        const idUnique = "GHOST-" + Math.floor(Math.random() * 1000000);
        user = { nick, pass, id: idUnique, theme: '#bc13fe' };
        localStorage.setItem('ghost_session', JSON.stringify(user));
        initApp();
        showScreen('main-screen');
    }
};

// 4. Ver/Ocultar Contraseña
document.getElementById('toggle-pass').onclick = function() {
    const input = document.getElementById('chat-key');
    input.type = input.type === 'password' ? 'text' : 'password';
};

function initApp() {
    if(!user) return;
    document.getElementById('conf-nick').innerText = user.nick;
    document.getElementById('conf-id').innerText = user.id;
    document.getElementById('display-name').innerText = user.nick;
}

// 5. Configuración
document.getElementById('btn-config-nav').onclick = () => showScreen('config-screen');

// 6. Enviar Mensaje con Multimedia (Simulada via Base64 para E2EE)
document.getElementById('btn-enviar').onclick = async () => {
    const text = document.getElementById('message-input').value;
    const fileInput = document.getElementById('file-input');
    let mediaData = null;

    if (fileInput.files[0]) {
        mediaData = await toBase64(fileInput.files[0]);
    }

    if (text || mediaData) {
        const msgObj = {
            sender: user.nick,
            text: currentChat === 'secure' ? CryptoJS.AES.encrypt(text, user.pass).toString() : text,
            media: mediaData,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            date: new Date().toLocaleDateString()
        };
        push(ref(db, 'mensajes_' + currentChat), msgObj);
        document.getElementById('message-input').value = "";
        fileInput.value = "";
    }
};

// 7. Cargar Chat
window.enterChat = (type) => {
    currentChat = type;
    document.getElementById('chat-title').innerText = type === 'secure' ? 'Canal Cifrado' : 'Canal Normal';
    document.getElementById('chat-box').innerHTML = ""; // Limpiar vista
    showScreen('chat-screen');
    
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        const m = data.val();
        renderMessage(m);
    });
};

function renderMessage(m) {
    let content = m.text;
    if(currentChat === 'secure') {
        try {
            content = CryptoJS.AES.decrypt(m.text, user.pass).toString(CryptoJS.enc.Utf8) || "[Contenido Cifrado]";
        } catch(e) { content = "[Error de Decifrado]"; }
    }

    const div = document.createElement('div');
    div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
    
    let html = `<strong>${m.sender}</strong><br>${content}`;
    if(m.media) {
        if(m.media.includes('image')) html += `<br><img src="${m.media}" style="max-width:100%; border-radius:8px; margin-top:5px;">`;
        if(m.media.includes('video')) html += `<br><video controls src="${m.media}" style="max-width:100%"></video>`;
        if(m.media.includes('audio')) html += `<br><audio controls src="${m.media}"></audio>`;
    }
    html += `<span class="msg-time">${m.date} - ${m.time}</span>`;
    
    div.innerHTML = html;
    document.getElementById('chat-box').appendChild(div);
    document.getElementById('chat-box').scrollTop = document.getElementById('chat-box').scrollHeight;
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Matrix Background
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
