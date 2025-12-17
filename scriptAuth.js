// Inicializados desde firebaseConfig.js
// const auth, db

function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function togglePassword(id) {
  const input = document.getElementById(id);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
}

function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('signup-form').style.display = 'none';
}

function showSignupForm() {
  document.getElementById('signup-form').style.display = 'block';
  document.getElementById('login-form').style.display = 'none';
}

// Redirigir tras login
auth.onAuthStateChanged(user => {
  if (user) {
    window.location.href = 'app.html';
  }
});

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
      window.location.href = 'app.html';
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

// Soporte para ?mode=signup en URL
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'signup') {
    showSignupForm();
  }
});