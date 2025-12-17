// ─── ESTADO ─────────────────────────────────────────────────────────────
let currentUser = null;
let saveTimeout = null;

// ─── UTILIDADES ─────────────────────────────────────────────────────────
function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const id = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 3000);
}

function togglePassword(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function openAuthModal(mode = 'login') {
  document.getElementById('auth-modal').style.display = 'flex';
  if (mode === 'signup') {
    showSignupForm();
  } else {
    showLoginForm();
  }
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
}

function showSignupForm() {
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
}

// ─── AUTENTICACIÓN ──────────────────────────────────────────────────────
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
      closeAuthModal();
      showToast(`¡Bienvenido${fullname ? `, ${fullname}` : ''}!`, 'success');
    })
    .catch(err => {
      let msg = err.message;
      if (msg.includes('email-already-in-use')) msg = 'Este correo ya está registrado.';
      showToast(msg);
    });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

// ─── ESCUCHA DE ESTADO ──────────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById('landing').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'none';
    showAgenda();
  } else {
    if (saveTimeout) clearTimeout(saveTimeout);
    currentUser = null;
    // No mostramos landing automáticamente al salir — solo al cargar
  }
});

auth.getRedirectResult().catch(err => {
  console.error('Google Sign-In error:', err);
  if (document.getElementById('auth-modal').style.display === 'flex') {
    showToast('Error con Google: ' + (err.message || 'Intenta de nuevo.'));
  }
});

// ─── AGENDA ─────────────────────────────────────────────────────────────
function showAgenda() {
  const appContainer = document.getElementById('app-container');
  appContainer.style.display = 'flex';
  if (appContainer.children.length === 0) {
    createAgendaInterface();
  }
}

function createAgendaInterface() {
  const appContainer = document.getElementById('app-container');

  const sidebar = document.createElement('aside');
  const name = (currentUser?.email || 'Amigo').split('@')[0];
  const initial = name.charAt(0).toUpperCase();
  sidebar.innerHTML = `
    <div style="padding: 1.8rem 1.5rem 1.5rem; border-bottom: 1px solid var(--gray-soft); display: flex; align-items: center; gap: 1rem;">
      <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--amber); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem;">${initial}</div>
      <div>
        <div style="font-weight: 600; color: var(--gray-deep);">${name}</div>
        <div style="font-size: 0.85rem; color: var(--gray-mid);">MindElephant</div>
      </div>
    </div>
    <nav style="flex: 1; padding: 1rem 0;">
      <div class="nav-item active" data-section="ideas" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: var(--gray-deep); font-weight: 500;">
        <span>💡</span> <span>Ideas</span>
      </div>
      <div class="nav-item" data-section="reminders" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: var(--gray-deep); font-weight: 500;">
        <span>🔔</span> <span>Recordatorios</span>
      </div>
      <div class="nav-item" data-section="dates" style="display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.5rem; cursor: pointer; color: var(--gray-deep); font-weight: 500;">
        <span>📅</span> <span>Fechas</span>
      </div>
    </nav>
    <div style="padding: 0 0 1.5rem;">
      <button onclick="logout()" style="display: flex; align-items: center; gap: 1rem; width: calc(100% - 3rem); margin: 0 1.5rem; padding: 0.75rem; background: #e57373; color: white; border: none; border-radius: 50px; font-family: var(--font-main); font-weight: 600; cursor: pointer;">
        <span>🚪</span> <span>Salir</span>
      </button>
    </div>
  `;

  const main = document.createElement('main');
  main.innerHTML = `
    <div id="section-header">
      <h1 style="font-size: 1.8rem; color: var(--gray-deep); margin-bottom: 0.4rem;">Mi Agenda</h1>
      <p id="section-subtitle" style="color: var(--gray-mid); font-weight: 500;">¿Qué tienes en mente hoy?</p>
    </div>
    <div id="section-content">
      <div style="text-align: center; color: var(--gray-mid); padding: 2rem;">Cargando...</div>
    </div>
  `;

  appContainer.appendChild(sidebar);
  appContainer.appendChild(main);

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      e.currentTarget.classList.add('active');
      loadSection(e.currentTarget.dataset.section);
    });
  });

  loadSection('ideas');
}

function loadSection(section) {
  if (saveTimeout) clearTimeout(saveTimeout);
  if (!currentUser) return;

  const data = {
    ideas: { title: '💡 Ideas', subtitle: '¿Qué tienes en mente hoy?' },
    reminders: { title: '🔔 Recordatorios', subtitle: 'Lo que no debes olvidar' },
    dates: { title: '📅 Fechas Importantes', subtitle: 'Momentos que marcan la diferencia' }
  };

  const { title, subtitle } = data[section] || data.ideas;
  document.querySelector('#section-header h1').textContent = title;
  document.getElementById('section-subtitle').textContent = subtitle;

  document.getElementById('section-content').innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-mid);">Cargando...</div>`;

  db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
      const userData = doc.exists ? doc.data() : { ideas: '', reminders: '', dates: '' };
      const value = userData[section] || '';
      document.getElementById('section-content').innerHTML = `
        <textarea id="content-textarea" class="content-textarea" style="width:100%;min-height:400px;padding:1.4rem;border-radius:20px;border:2px solid var(--gray-soft);font-family:var(--font-main);font-size:1.1rem;line-height:1.7;resize:vertical;background:white;">${value}</textarea>
      `;
      const ta = document.getElementById('content-textarea');
      ta?.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          saveToFirestore(section, ta.value);
        }, 800);
      });
    })
    .catch(err => {
      console.error(err);
      showToast('Error al cargar. Revisa tu conexión.');
    });
}

function saveToFirestore(section, value) {
  if (!currentUser) return;
  db.collection('users').doc(currentUser.uid).update({
    [section]: value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    console.error('Guardado fallido:', err);
    showToast('No se pudo guardar. ¿Estás conectado?');
  });
}

function logout() {
  if (saveTimeout) clearTimeout(saveTimeout);
  auth.signOut();
  document.getElementById('app-container').style.display = 'none';
  document.getElementById('landing').style.display = 'flex';
}

// ─── EVENTOS ────────────────────────────────────────────────────────────
document.getElementById('btn-login-landing')?.addEventListener('click', () => openAuthModal('login'));
document.getElementById('btn-signup-landing')?.addEventListener('click', () => openAuthModal('signup'));
document.getElementById('btn-get-started')?.addEventListener('click', () => openAuthModal('signup'));