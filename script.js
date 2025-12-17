// ─── ESTADO GLOBAL ─────────────────────────────────────────────────────
let currentUser = null;
let saveTimeout = null;
let toastId = 0;

// ─── UTILIDADES ─────────────────────────────────────────────────────────
function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'toast-container';
    newContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(newContainer);
  }

  const id = `toast-${++toastId}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    background: ${type === 'success' ? '#66bb6a' : '#e57373'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 10px;
    animation: fadeIn 0.3s, fadeOut 0.5s 2.5s forwards;
  `;
  toast.innerHTML += `
    <style>
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeOut { to { opacity: 0; transform: translateY(-20px); } }
    </style>
  `;
  document.getElementById('toast-container').appendChild(toast);

  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 3000);
}

function togglePassword(id) {
  const input = document.getElementById(id);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// ─── ESCUCHAR CAMBIOS DE AUTENTICACIÓN ──────────────────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showAgenda();
  } else {
    if (saveTimeout) clearTimeout(saveTimeout);
    currentUser = null;
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

  if (document.getElementById('app-container')) {
    document.getElementById('app-container').style.display = 'flex';
    return;
  }

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

  // Sidebar
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

  // Manejo seguro de nombre/email
  const name = (currentUser?.email || 'Usuario').split('@')[0];
  const initial = name.charAt(0).toUpperCase();

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
        <span></span> <span>Ideas</span>
      </div>
      <div class="nav-item" data-section="reminders" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: #495057; font-weight: 500;">
        <span></span> <span>Recordatorios</span>
      </div>
      <div class="nav-item" data-section="dates" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: #495057; font-weight: 500;">
        <span></span> <span>Fechas</span>
      </div>
    </nav>
    <div style="padding: 0 0 1.5rem;">
      <button onclick="logout()" style="display: flex; align-items: center; gap: 1rem; width: calc(100% - 3rem); margin: 0 1.5rem; padding: 0.75rem; background: #e57373; color: white; border: none; border-radius: 50px; font-family: inherit; font-weight: 600; cursor: pointer; transition: all 0.2s;">
        <span></span> <span>Salir</span>
      </button>
    </div>
  `;

  // Main content
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
      <h1 style="font-size: 1.8rem; color: #495057; margin-bottom: 0.4rem;">Mi Agenda</h1>
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

  loadSection('ideas');
}

// ─── CARGAR SECCIÓN DINÁMICAMENTE ───────────────────────────────────────
async function loadSection(section) {
  if (!currentUser) return;

  // Limpiar timeout anterior al cambiar de sección
  if (saveTimeout) clearTimeout(saveTimeout);

  const sectionData = {
    ideas: {
      title: 'Ideas',
      subtitle: '¿Qué tienes en mente hoy?',
      placeholder: `Ej: \n• Diseñar MindElephant v2\n• Leer 'Sapiens' antes de fin de año\n• Aprender a tocar piano 🎹`
    },
    reminders: {
      title: 'Recordatorios',
      subtitle: 'Lo que no debes olvidar',
      placeholder: `Ej: \n• Llamar a mamá (viernes 18:00)\n• Revisar contrato (antes del 30)\n• Comprar víveres`
    },
    dates: {
      title: 'Fechas Importantes',
      subtitle: 'Momentos que marcan la diferencia',
      placeholder: `Ej: \n• 2025-12-16 → Entrega MVP\n• 2026-03-10 → Cumple de Ana\n• 2026-06-?? → Vacaciones`
    }
  };

  const { title, subtitle, placeholder } = sectionData[section] || sectionData.ideas;

  document.querySelector('#section-header h1').textContent = title;
  document.getElementById('section-subtitle').textContent = subtitle;

  document.getElementById('section-content').innerHTML = `
    <div style="text-align: center; color: #6c757d; padding: 2rem;">Cargando...</div>
  `;

  try {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const data = userDoc.exists ? userDoc.data() : { ideas: '', reminders: '', dates: '' };

    document.getElementById('section-content').innerHTML = `
      <textarea id="content-textarea"
                style="width: 100%; min-height: 400px; padding: 1.4rem; border-radius: 20px; border: 2px solid #e9ecef; font-family: inherit; font-size: 1.1rem; line-height: 1.7; resize: vertical; background: white; transition: all 0.3s;"
                placeholder="${placeholder.replace(/</g, '&lt;').replace(/>/g, '&gt;')}">${(data[section] || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    `;

    const textarea = document.getElementById('content-textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveToFirestore(section, textarea.value);
        }, 800);
      });
    }
  } catch (err) {
    console.error('Error cargando sección:', err);
    showToast('No se pudo cargar. ¿Estás conectado?', 'error');
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
    console.log(`${section} guardado`);
  } catch (err) {
    console.error('Error al guardar:', err);
    showToast('No se pudo guardar. Revisa tu conexión.', 'error');
  }
}

// ─── FUNCIONES DE AUTENTICACIÓN ─────────────────────────────────────────
function handleLogin() {
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  if (!email || !password) return showToast('Correo y contraseña obligatorios.');

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      let msg = err.message;
      if (msg.includes('user-not-found') || msg.includes('wrong-password')) {
        msg = 'Correo o contraseña incorrectos.';
      }
      showToast(msg);
    });
}

function handleSignUp() {
  const email = document.getElementById('signup-email')?.value.trim();
  const password = document.getElementById('signup-password')?.value;
  const confirm = document.getElementById('signup-confirm')?.value;
  const fullname = document.getElementById('fullname')?.value;

  if (!email || !password) return showToast('Correo y contraseña obligatorios.');
  if (password.length < 6) return showToast('Contraseña debe tener ≥6 caracteres.');
  if (password !== confirm) return showToast('Las contraseñas no coinciden.');

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
      showToast(`¡Bienvenido${fullname ? `, ${fullname}` : ''}!`, 'success');
    })
    .catch(err => {
      let msg = err.message;
      if (msg.includes('email-already-in-use')) {
        msg = 'Este correo ya está registrado.';
      }
      showToast(msg);
    });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

// Manejar resultado de redirección
auth.getRedirectResult()
  .then((result) => {
    if (result.user) {
      console.log("Login con Google exitoso");
    }
  })
  .catch((error) => {
    console.error("Error en Google Sign-In:", error);
    showToast('Error con Google: ' + (error.message || 'Intenta de nuevo.'));
  });

// ─── CERRAR SESIÓN ──────────────────────────────────────────────────────
function logout() {
  if (saveTimeout) clearTimeout(saveTimeout);
  auth.signOut().catch(err => {
    console.error('Error al cerrar sesión:', err);
    showToast('Error al cerrar sesión. Intenta de nuevo.');
  });
}

// ─── CONTROL DE PANELES (login/signup) ───────────────────────────────────
function showLoginPanel() {
  const panel = document.getElementById('signup-panel');
  if (panel) {
    panel.classList.remove('active');
    setTimeout(() => {
      panel.classList.add('hidden');
    }, 400);
  }
}

function showSignupPanel() {
  const panel = document.getElementById('signup-panel');
  if (panel) {
    panel.classList.remove('hidden');
    setTimeout(() => {
      panel.classList.add('active');
    }, 10);
  }
}