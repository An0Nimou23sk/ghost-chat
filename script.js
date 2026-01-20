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
let usuarioActual = "";

const sonidoNotificacion = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

// ENTRAR AL CHAT
document.getElementById('btn-entrar').addEventListener('click', () => {
    const inputUser = document.getElementById('username');
    if (inputUser.value.trim() !== "") {
        usuarioActual = inputUser.value;
        document.getElementById('display-name').innerText = usuarioActual.toUpperCase();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
    }
});

// FUNCIÓN DE ENVÍO
function enviarMensaje() {
    const inputMsg = document.getElementById('message-input');
    const texto = inputMsg.value;

    if (texto.trim() !== "" && usuarioActual !== "") {
        push(dbRef, {
            usuario: usuarioActual,
            texto: texto,
            tiempo: Date.now()
        });
        inputMsg.value = "";
        inputMsg.focus(); // Mantiene el cursor en el cuadro de texto
    }
}

// CLICK EN EL BOTÓN
document.getElementById('btn-enviar').addEventListener('click', (e) => {
    e.preventDefault();
    enviarMensaje();
});

// TECLA ENTER (Solución aquí)
document.getElementById('message-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Evita que la página se refresque
        enviarMensaje();
    }
});

// RECIBIR MENSAJES
onChildAdded(dbRef, (data) => {
    const msgData = data.val();
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    
    if (msgData.usuario === usuarioActual) {
        msgDiv.classList.add('mine');
    } else {
        sonidoNotificacion.play().catch(() => {});
    }

    msgDiv.innerHTML = `<span class="msg-user">${msgData.usuario}</span>${msgData.texto}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});
