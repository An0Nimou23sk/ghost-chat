import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. Configuración de tu App
const firebaseConfig = {
  apiKey: "AIzaSyD0PZK3Prt5CufdQyBOTrsGFPxYzt0l_XU",
  authDomain: "ghost-chat-an0nimous.firebaseapp.com",
  databaseURL: "https://ghost-chat-an0nimous-default-rtdb.firebaseio.com",
  projectId: "ghost-chat-an0nimous",
  storageBucket: "ghost-chat-an0nimous.firebasestorage.app",
  messagingSenderId: "611834273169",
  appId: "1:611834273169:web:f4a23d0bfb22fe1f7a0e30"
};

// 2. Inicialización
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'mensajes');
let usuarioActual = "";

// --- NUEVO: Sonido de notificación ---
const sonidoNotificacion = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

// 3. Lógica de Ingreso
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

// 4. Función Maestra de Envío (Para reusar en botón y tecla Enter)
function enviarMensaje() {
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
}

// Escuchar clic en el botón
document.getElementById('btn-enviar').addEventListener('click', enviarMensaje);

// --- NUEVO: Escuchar tecla ENTER ---
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        enviarMensaje();
    }
});

// 5. Recepción de mensajes en tiempo real
onChildAdded(dbRef, (data) => {
    const msgData = data.val();
