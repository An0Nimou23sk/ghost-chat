:root {
    --purple: #bc13fe; --blue: #00d2ff; --green: #00ff41; --red: #ff3131;
    --primary: var(--purple);
    --bg: #050005;
    --glass: rgba(15, 0, 15, 0.85);
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Courier New', monospace; }

body { background: var(--bg); color: #fff; height: 100vh; overflow: hidden; }

/* Temas dinámicos */
.theme-blue { --primary: var(--blue); --bg: #000814; --glass: rgba(0, 20, 40, 0.85); }
.theme-green { --primary: var(--green); --bg: #000800; --glass: rgba(0, 20, 0, 0.85); }
.theme-red { --primary: var(--red); --bg: #0a0000; --glass: rgba(30, 0, 0, 0.85); }

#matrix-canvas { position: fixed; top: 0; left: 0; z-index: -1; opacity: 0.2; }

.screen { height: 100vh; display: flex; flex-direction: column; padding: 20px; }

.glass-card {
    background: var(--glass);
    border: 1px solid var(--primary);
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(188, 19, 254, 0.2);
    max-width: 400px; margin: auto; text-align: center;
}

h1 { color: var(--primary); text-shadow: 0 0 10px var(--primary); margin-bottom: 10px; }

input {
    width: 100%; padding: 12px; margin: 10px 0;
    background: rgba(0,0,0,0.5); border: 1px solid var(--primary);
    color: #fff; outline: none;
}

.btn-main {
    width: 100%; padding: 12px; background: var(--primary);
    color: #000; border: none; font-weight: bold; cursor: pointer;
}

/* Chat Styles */
#chat-box { flex-grow: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; }

.message {
    max-width: 80%; padding: 10px 15px; margin: 5px 0; border-radius: 5px;
    font-size: 0.9rem; position: relative;
}
.mine { align-self: flex-end; background: var(--primary); color: #000; }
.other { align-self: flex-start; background: rgba(255,255,255,0.1); border: 1px solid var(--primary); }

.chat-item {
    background: var(--glass); border: 1px solid var(--primary);
    padding: 20px; margin-top: 15px; display: flex; justify-content: space-between; cursor: pointer;
}

.color-dot { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #fff; cursor: pointer; margin: 5px; }
.purple { background: var(--purple); } .blue { background: var(--blue); } 
.green { background: var(--green); } .red { background: var(--red); }
