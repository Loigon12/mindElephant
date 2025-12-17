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
  
  // Cargar template HTML desde templates/
  fetch(`templates/${section}.html`)
    .then(res => res.text())
    .then(html => {
      document.querySelector('.section-content').innerHTML = html;
      
      // Cargar datos de Firestore
      db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
          const userData = doc.exists ? doc.data() : { ideas: '', reminders: '', dates: '' };
          const value = userData[section] || '';
          
          const textarea = document.getElementById(`${section}-textarea`);
          if (textarea) {
            textarea.value = value;
            textarea.addEventListener('input', () => {
              clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => saveToFirestore(section, textarea.value), 800);
            });
          }
        })
        .catch(err => {
          console.error(err);
          document.querySelector('.section-content').innerHTML = '<div class="loading">Error al cargar. Revisa tu conexión.</div>';
        });
    })
    .catch(err => {
      console.error('Error cargando template:', err);
      document.querySelector('.section-content').innerHTML = '<div class="loading">Error al cargar la sección.</div>';
    });
}

function saveToFirestore(section, value) {
  db.collection('users').doc(currentUser.uid).update({
    [section]: value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(err => {
    console.error('Guardado fallido:', err);
    showToast('⚠️ No se guardó. ¿Estás conectado?', 'error');
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