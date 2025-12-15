// ─── CONTROL DE PANELES ───────────────────────────────────────────────
function showLoginPanel() {
  const panel = document.getElementById('signup-panel');
  panel.classList.remove('active');
  setTimeout(() => {
    panel.classList.add('hidden');
  }, 400);
}

function showSignupPanel() {
  const panel = document.getElementById('signup-panel');
  panel.classList.remove('hidden');
  setTimeout(() => {
    panel.classList.add('active');
  }, 10);
}

// ─── LOGIN ────────────────────────────────────────────────────────────
function handleLogin() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Por favor ingresa correo y contraseña.');
    return;
  }

  // ✅ Conexión real con Firebase (descomenta en tu proyecto)
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      alert('Error al iniciar sesión: ' + (err.message || 'Intenta de nuevo.'));
    });
}

// ─── REGISTRO ─────────────────────────────────────────────────────────
function handleSignUp() {
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const fullname = document.getElementById('fullname').value;

  // Validación
  if (!email || !password) {
    alert('Por favor ingresa correo y contraseña.');
    return;
  }
  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres.');
    return;
  }
  if (password !== confirm) {
    alert('❌ Las contraseñas no coinciden.');
    return;
  }

  // ✅ Crear usuario en Firebase
  auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Guardar datos en Firestore
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
      alert('Error al crear cuenta: ' + msg);
    });
}

// ─── GOOGLE SIGN-IN ───────────────────────────────────────────────────
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .catch(err => {
      alert('Error con Google: ' + err.message);
    });
}