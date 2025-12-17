// Inicializados desde firebaseConfig.js
// const auth, db

let currentUser = null;
let saveTimeout = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUserInfo();
    loadSection('ideas');
  } else {
    window.location.href = 'auth.html';
  }
});

function loadUserInfo() {
  const name = (currentUser.email || 'Amigo').split('@')[0];
  const initial = name.charAt(0).toUpperCase();
  document.getElementById('user-avatar').textContent = initial;
  document.getElementById('user-name').textContent = name;
  document.getElementById('user-email').textContent = currentUser.email;
}

function loadSection(section) {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  const data = {
    ideas: { title: '💡 Ideas', subtitle: '¿Qué tienes en mente hoy?' },
    reminders: { title: '🔔 Recordatorios', subtitle: 'Lo que no debes olvidar' },
    dates: { title: '📅 Fechas Importantes', subtitle: 'Momentos que marcan la diferencia' }
  };
  
  const { title, subtitle } = data[section];
  document.getElementById('section-title').textContent = title;
  document.getElementById('section-subtitle').textContent = subtitle;
  
  document.querySelector('.section-content').innerHTML = '<div class="loading">Cargando...</div>';
  
  db.collection('users').doc(currentUser.uid).get()
    .then(doc => {
      const userData = doc.exists ? doc.data() : { ideas: '', reminders: '', dates: '' };
      const value = userData[section] || '';
      document.querySelector('.section-content').innerHTML = `
        <textarea id="content-textarea">${value}</textarea>
      `;
      const ta = document.getElementById('content-textarea');
      ta.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => saveToFirestore(section, ta.value), 800);
      });
    })
    .catch(err => {
      console.error(err);
      document.querySelector('.section-content').innerHTML = '<div class="loading">Error al cargar. Revisa tu conexión.</div>';
    });
}

function saveToFirestore(section, value) {
  db.collection('users').doc(currentUser.uid).update({
    [section]: value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    console.error('Guardado fallido:', err);
    const container = document.getElementById('toast-container');
    if (container) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = '⚠️ No se guardó. ¿Estás conectado?';
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }
  });
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    e.currentTarget.classList.add('active');
    loadSection(e.currentTarget.dataset.section);
  });
});

function logout() {
  if (saveTimeout) clearTimeout(saveTimeout);
  auth.signOut();
}