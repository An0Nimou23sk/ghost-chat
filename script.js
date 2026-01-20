// 1. Importaciones desde la red (CDN) para que funcione en el navegador
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. Tu configuración específica de Firebase (la que me pasaste)
const firebaseConfig = {
  apiKey: "AIzaSyD0PZK3Prt5CufdQyBOTrsGFPxYzt0l_XU",
  authDomain: "ghost-chat-an0nimous.firebaseapp.com",
  databaseURL: "https://ghost-chat-an0nimous-default-rtdb.firebaseio.com",
  projectId: "ghost-chat-an0nimous",
  storageBucket: "ghost-chat-an0nimous.firebasestorage.app",
  messagingSenderId: "611834273169",
  appId: "1:611834273169:web:f4a23d0bfb22fe1f7a0e30"
};

// 3. Inicializar la conexión
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'mensajes');

let usuarioActual = "";

// 4. Lógica para entrar al chat
document.getElementById('btn-entrar').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username.trim() !== "") {
        usuarioActual = username;
        document.getElementById('display-name').innerText = usuarioActual.toUpperCase();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('chat-screen').style.display = 'flex';
    } else {
        alert("Por favor, ingresa un apodo.");
    }
});

// 5. Función para ENVIAR mensajes a la nube de Firebase
document.getElementById('btn-enviar').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const mensaje = input.value;

    if (mensaje.trim() !== "") {
        push(dbRef, {
            usuario: usuarioActual,
            texto: mensaje,
            tiempo: Date.now()
        });
        input.value = "";
    }
});

// 6. Función para RECIBIR mensajes en tiempo real
onChildAdded(dbRef, (data) => {
    const msgData = data.val();
    const chatBox = document.getElementById('chat-box');
    
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message');
    
    // Si el mensaje es mío, lo alineamos a la derecha con color distinto
    if (msgData.usuario === usuarioActual) {
        msgDiv.classList.add('mine');
    }

    msgDiv.innerHTML = `<span class="msg-user">${msgData.usuario}</span>${msgData.texto}`;
    chatBox.appendChild(msgDiv);
    
    // Autoscroll para ver el último mensaje
    chatBox.scrollTop = chatBox.scrollHeight;
});