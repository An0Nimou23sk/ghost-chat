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
let usuarioActual = "";
let typingTimer;

const sonidoNotificacion = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

// Login
document.getElementById('btn-entrar').addEventListener('click', () => {
    const inputUser = document.getElementById('username');
    if (inputUser.value.trim() !== "") {
        usuarioActual = inputUser.value;
        document.getElementById('display-name').innerText = usuarioActual.toUpperCase();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
    }
});

// Lógica de ENVIAR
function enviarMensaje() {
    const inputMsg = document.getElementById('message-input');
    const texto = inputMsg.value;
    if (texto.trim() !== "" && usuarioActual !== "") {
        push(dbRef, { usuario: usuarioActual, texto: texto, tiempo: Date.now() });
        inputMsg.value = "";
        // Al enviar, dejamos de escribir
        remove(ref(db, 'typing/' + usuarioActual));
    }
}

document.getElementById('btn-enviar').addEventListener('click', enviarMensaje);

// --- DETECTAR SI ESTÁ ESCRIBIENDO ---
const inputArea = document.getElementById('message-input');
inputArea.addEventListener('input', () => {
    if (usuarioActual) {
        // Marcamos en Firebase que este usuario está escribiendo
        set(ref(db, 'typing/' + usuarioActual), { typing: true });
        
        // Si deja de escribir por 2 segundos, borramos el estado
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            remove(ref(db, 'typing/' + usuarioActual));
        }, 2000);
    }
});

// ESCUCHAR QUIÉN ESTÁ ESCRIBIENDO
onValue(ref(db, 'typing'), (snapshot) => {
    const typingUsers = snapshot.val();
    const indicator = document.getElementById('typing-indicator');
    if (typingUsers) {
        const users = Object.keys(typingUsers).filter(u => u !== usuarioActual);
        if (users.length > 0) {
            indicator.innerText = `${users[0]} está escribiendo`;
        } else {
            indicator.innerText = "";
        }
    } else {
        indicator.innerText = "";
    }
});

// RECIBIR MENSAJES
onChildAdded(dbRef, (data) => {
    const msgData = data.val();
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    msgDiv.classList.add(msgData.usuario === usuarioActual ? 'mine' : 'other');
    if (msgData.usuario !== usuarioActual) sonidoNotificacion.play().catch(() => {});
    
    msgDiv.innerHTML = `<span class="msg-user">${msgData.usuario}</span>${msgData.texto}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});
