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

const goTo = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
};

window.addEventListener('DOMContentLoaded', () => {
    // Splash
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        if (user) { loadProfile(); goTo('main-screen'); } 
        else { goTo('login-screen'); }
    }, 2000);

    // Lógica Ojito
    document.getElementById('toggle-pass').onclick = () => {
        const input = document.getElementById('chat-key');
        input.type = input.type === 'password' ? 'text' : 'password';
    };

    // Buscador Simple
    document.getElementById('search-input').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            item.style.display = item.innerText.toLowerCase().includes(term) ? 'block' : 'none';
        });
    };

    // Login
    document.getElementById('btn-entrar').onclick = () => {
        const nick = document.getElementById('username').value;
        const pass = document.getElementById('chat-key').value;
        if(nick && pass) {
            user = { nick, pass, id: "GHOST-"+Math.floor(Math.random()*9999), color: '#bc13fe' };
            localStorage.setItem('ghost_session', JSON.stringify(user));
            location.reload();
        }
    };

    // Color Picker
    document.getElementById('color-picker').oninput = (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--primary', color);
        user.color = color;
        localStorage.setItem('ghost_session', JSON.stringify(user));
    };

    // Logout
    document.getElementById('btn-logout').onclick = () => { localStorage.clear(); location.reload(); };

    // Envío
    document.getElementById('btn-enviar').onclick = () => {
        const input = document.getElementById('message-input');
        if(!input.value) return;
        const txt = currentChat === 'secure' ? CryptoJS.AES.encrypt(input.value, user.pass).toString() : input.value;
        push(ref(db, 'mensajes_' + currentChat), { sender: user.nick, text: txt });
        input.value = "";
    };

    document.getElementById('btn-config-nav').onclick = () => goTo('config-screen');
});

function loadProfile() {
    document.getElementById('conf-nick').innerText = user.nick;
    document.getElementById('conf-id').innerText = user.id;
    document.documentElement.style.setProperty('--primary', user.color);
    document.getElementById('color-picker').value = user.color;
}

window.openChat = (type) => {
    currentChat = type;
    document.getElementById('chat-title-display').innerText = type === 'secure' ? 'Canal Cifrado' : 'Canal Abierto';
    document.getElementById('chat-box').innerHTML = "";
    goTo('chat-screen');
    onChildAdded(ref(db, 'mensajes_' + currentChat), (data) => {
        const m = data.val();
        let txt = m.text;
        if(currentChat === 'secure') {
            try { txt = CryptoJS.AES.decrypt(m.text, user.pass).toString(CryptoJS.enc.Utf8) || "[Cifrado]"; }
            catch(e) { txt = "[Error]"; }
        }
        const div = document.createElement('div');
        div.className = `message ${m.sender === user.nick ? 'mine' : 'other'}`;
        div.innerHTML = `<b>${m.sender}</b><br>${txt}`;
        document.getElementById('chat-box').appendChild(div);
    });
};

// MATRIX
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const drops = Array(Math.floor(canvas.width/20)).fill(1);
setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary');
    drops.forEach((y,i) => {
        ctx.fillText(String.fromCharCode(Math.random()*128), i*20, y*20);
        if(y*20 > canvas.height && Math.random() > 0.975) drops[i]=0;
        drops[i]++;
    });
}, 50);

// Hacer goTo accesible globalmente para el HTML
window.goTo = goTo;
