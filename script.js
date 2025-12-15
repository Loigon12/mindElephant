// ─── ESTADO GLOBAL ─────────────────────────────────────────────────────
let currentUser = null;

// ─── ESCUCHAR CAMBIOS DE AUTENTICACIÓN (CLAVE PARA REDIRECCIÓN) ───────
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showAgenda();
  } else {
    showLogin();
  }
});

// ─── CONTROL DE INTERFACES ─────────────────────────────────────────────
function showLogin() {
  const container = document.querySelector('.login-container');
  if (container) container.style.display = 'flex';
}

function showAgenda() {
  const container = document.querySelector('.login-container');
  if (container) container.style.display = 'none';

  // Si ya existe la agenda, solo la mostramos
  if (document.getElementById('app-container')) {
    document.getElementById('app-container').style.display = 'flex';
    return;
  }

  // Si no, la creamos (solo una vez)
  createAgendaInterface();
}

// ─── CREAR INTERFAZ DE LA AGENDA ───────────────────────────────────────
function createAgendaInterface() {
  const appContainer = document.createElement('div');
  appContainer.id = 'app-container';
  appContainer.style.cssText = `
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
    background: #f8f4e9;
    font-family: 'Quicksand', -apple-system, sans-serif;
    overflow: hidden;
  `;

  // Sidebar (menú lateral temático)
  const sidebar = document.createElement('aside');
  sidebar.style.cssText = `
    width: 260px;
    background: white;
    box-shadow: 8px 0 30px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
  `;

  const name = currentUser.email.split('@')[0];
  const initial = name[0].toUpperCase();

  sidebar.innerHTML = `
    <div style="padding: 1.8rem 1.5rem 1.5rem; border-bottom: 1px solid #e9ecef; display: flex; align-items: center; gap: 1rem;">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: #d4a017; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem;">${initial}</div>
      <div>
        <div style="font-weight: 600; color: #495057;">${name}</div>
        <div style="font-size: 0.85rem; color: #adb5bd;">MindElephant</div>
      </div>
    </div>
    <nav style="flex: 1; padding: 1rem 0;">
      <div class="nav-item active" data-section="ideas" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: #495057; font-weight: 500;">
        <span>💡</span> <span>Ideas</span>
      </div>
      <div class="nav-item" data-section="reminders" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: #495057; font-weight: 500;">
        <span>🔔</span> <span>Recordatorios</span>
      </div>
      <div class="nav-item" data-section="dates" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: #495057; font-weight: 500;">
        <span>📅</span> <span>Fechas</span>
      </div>
    </nav>
    <div style="padding: 0 0 1.5rem;">
      <button onclick="logout()" style="display: flex; align-items: center; gap: 1rem; width: calc(100% - 3rem); margin: 0 1.5rem; padding: 0.75rem; background: #e57373; color: white; border: none; border-radius: 50px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s;">
        <span>🚪</span> <span>Salir</span>
      </button>
    </div>
  `;

  // Contenido principal
  const main = document.createElement('main');
  main.style.cssText = `
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  `;

  main.innerHTML = `
    <div id="section-header" style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.8rem; color: #495057; margin-bottom: 0.4rem;">🧠 Mi Agenda</h1>
      <p id="section-subtitle" style="color: #6c757d; font-weight: 500;">¿Qué tienes en mente hoy?</p>
    </div>
    <div id="section-content" style="flex: 1;">
      <div style="text-align: center; color: #6c757d; padding: 2rem;">Cargando...</div>
    </div>
  `;

  appContainer.appendChild(sidebar);
  appContainer.appendChild(main);
  document.body.appendChild(appContainer);

  // Eventos de menú
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const section = e.currentTarget.dataset.section;
      loadSection(section);
    });
  });

  // Cargar primera sección
  loadSection('ideas');
}

// ─── CARGAR SECCIÓN DINÁMICAMENTE ───────────────────────────────────────
let saveTimeout;
async function loadSection(section) {
  if (!currentUser) return;

  const titles = {
    ideas: '💡 Ideas',
    reminders: '🔔 Recordatorios',
    dates: '📅 Fechas Importantes'
  };

  const subtitles = {
    ideas: '¿Qué tienes en mente hoy?',
    reminders: 'Lo que no debes olvidar',
    dates: 'Momentos que marcan la diferencia'
  };

  const placeholders = {
    ideas: `Ej: 
• Diseñar MindElephant v2
• Leer 'Sapiens' antes de fin de año
• Aprender a tocar piano 🎹`,
    reminders: `Ej: 
• Llamar a mamá (viernes 18:00)
• Revisar contrato (antes del 30)
• Comprar víveres`,
    dates: `Ej: 
• 2025-12-16 → Entrega MVP
• 2026-03-10 → Cumple de Ana
• 2026-06-?? → Vacaciones`
  };

  document.getElementById('section-header').querySelector('h1').textContent = titles[section];
  document.getElementById('section-subtitle').textContent = subtitles[section];

  // Mostrar loading
  document.getElementById('section-content').innerHTML = `
    <div style="text-align: center; color: #6c757d; padding: 2rem;">Cargando...</div>
  `;

  try {
    // Cargar datos de Firestore
    const doc = await db.collection('users').doc(currentUser.uid).get();
    const data = doc.exists ? doc.data() : { ideas: '', reminders: '', dates: '' };

    // Renderizar textarea
    document.getElementById('section-content').innerHTML = `
      <textarea id="content-textarea" 
                style="width: 100%; min-height: 400px; padding: 1.4rem; border-radius: 20px; border: 2px solid #e9ecef; font-family: inherit; font-size: 1.1rem; line-height: 1.7; resize: vertical; background: white; transition: all 0.3s;"
                placeholder="${placeholders[section]}">${data[section] || ''}</textarea>
    `;

    // Guardar automáticamente con debounce
    const textarea = document.getElementById('content-textarea');
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveToFirestore(section, textarea.value);
      }, 800);
    });

  } catch (err) {
    console.error('Error cargando sección:', err);
    document.getElementById('section-content').innerHTML = `
      <div style="text-align: center; color: #e57373; padding: 2rem;">⚠️ Error al cargar. Revisa tu conexión.</div>
    `;
  }
}

// ─── GUARDAR EN FIRESTORE ───────────────────────────────────────────────
async function saveToFirestore(section, value) {
  if (!currentUser) return;
  try {
    await db.collection('users').doc(currentUser.uid).update({
      [section]: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ ${section} guardado`);
  } catch (err) {
    console.error('Error al guardar:', err);
  }
}

// ─── FUNCIONES DE AUTENTICACIÓN ─────────────────────────────────────────
function handleLogin() {
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  if (!email || !password) return alert('Por favor ingresa correo y contraseña.');
  
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert('Error: ' + (err.message || 'Intenta de nuevo.')));
}

function handleSignUp() {
  const email = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirm = document.getElementById('signup-confirm')?.value;
  const fullname = document.getElementById('fullname')?.value;

  if (!email || !password) return alert('Correo y contraseña obligatorios.');
  if (password.length < 6) return alert('Contraseña ≥6 caracteres.');
  if (password !== confirm) return alert('❌ Las contraseñas no coinciden.');

  auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      await db.collection('users').doc(user.uid).set({
        name: fullname || email.split('@')[0],
        email: user.email,
        ideas: '',
        reminders: '',
        dates: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert(`🎉 ¡Cuenta creada!\nBienvenido a MindElephant, ${fullname || 'amigo'} 🐘`);
    })
    .catch(err => {
      let msg = err.message;
      if (msg.includes('email-already-in-use')) {
        msg = 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
      }
      alert('Error: ' + msg);
    });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

// Manejar resultado de redirección (importante para Google)
auth.getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("✅ Login con Google exitoso");
    }
  })
  .catch((error) => {
    console.error("⚠️ Error en Google Sign-In:", error);
    alert('Error con Google: ' + error.message);
  });

// ─── CERRAR SESIÓN ──────────────────────────────────────────────────────
function logout() {
  auth.signOut();
}

// ─── CONTROL DE PANELES (login/signup) ──────────────────────────────────
function showLoginPanel() {
  const panel = document.getElementById('signup-panel');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => panel.classList.add('hidden'), 400);
  }
}

function showSignupPanel() {
  const panel = document.getElementById('signup-panel');
  if (panel) {
    panel.classList.remove('hidden');
    setTimeout(() => panel.classList.add('active'), 10);
  }
}