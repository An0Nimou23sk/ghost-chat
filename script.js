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

// FUNCIÓN DE NAVEGACIÓN SEGURA
function goTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const el = document.getElementById(id);
    if(el) el.style.display = 'flex';
}

window.addEventListener('DOMContentLoaded', () => {
    // 1. Quitar Splash obligatoriamente
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        if (user) {
            document.getElementById('conf-id').innerText = user.id;
            goTo('main-screen');
        } else {
            goTo('login-screen');
        }
    }, 2000);

    // 2. Eventos de Botones
    document.getElementById('btn-entrar').onclick = () => {
        const nick = document.getElementById('username').value;
        const pass = document.getElementById('chat-key').value;
        if(nick && pass) {
            user = { nick, pass, id: "GHOST-"+Math.floor(Math.random()*999), theme: '#bc13fe' };
            localStorage.setItem('ghost_session', JSON.stringify(user));
            location.reload(); // Recargamos para limpiar cualquier error previo
        }
    };

    document.getElementById('btn-sala-segura').onclick = () => openChat('secure');
    document.getElementById('btn-sala-normal').onclick = () => openChat('normal');
    document.getElementById('btn-volver').onclick = () => goTo('main-screen');
    document.getElementById('btn-config-nav').onclick = () => goTo('config-screen');
    document.getElementById('btn-cerrar-config').onclick = () => goTo('main-screen');
    document.getElementById('btn-logout').onclick = () => { localStorage.clear(); location.reload(); };

    document.getElementById('btn-enviar').onclick = () => {
        const input = document.getElementById('message-input');
        if(!input.value) return;
        const txt = currentChat === 'secure' ? CryptoJS.AES.encrypt(input.value, user.pass).toString() : input.value;
        push(ref(db, 'mensajes_' + currentChat), { sender: user.nick, text: txt });
        input.value = "";
    };
});

function openChat(type) {
    currentChat = type;
    document.getElementById('chat-box').innerHTML = "";
    goTo('chat-screen');
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        const m = data.val();
        let finalTxt = m.text;
        if(currentChat === 'secure') {
            try { finalTxt = CryptoJS.AES.decrypt(m.text, user.pass).toString(CryptoJS.enc.Utf8) || "[Cifrado]"; } 
            catch(e) { finalTxt = "[Error]"; }
        }
        const div = document.createElement('div');
        div.className = `message ${m.sender === user?.nick ? 'mine' : 'other'}`;
        div.innerHTML = `<b>${m.sender}</b><br>${finalTxt}`;
        document.getElementById('chat-box').appendChild(div);
    });
}

// MATRIX
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const drops = Array(Math.floor(canvas.width/20)).fill(1);
setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#bc13fe";
    drops.forEach((y,i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
    });
}, 50);
