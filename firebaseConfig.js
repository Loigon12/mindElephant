// ADVERTENCIA: Este archivo NO debe subirse a repositorios públicos.
// Para producción, usa:
//   - Variables de entorno (.env) + backend (Next.js, Vercel, etc.)
//   - O inyección de configuración vía build-time en CI/CD.

// Solo para entorno local o privado
const firebaseConfig = {
  apiKey: "AIzaSyBTSxooiVG5p0LHPkYBIHgWRntsya-FTGY",
  authDomain: "mindelephant.firebaseapp.com",
  projectId: "mindelephant",
  storageBucket: "mindelephant.firebasestorage.app",
  messagingSenderId: "425227723420",
  appId: "1:425227723420:web:761a35aa7c532a088ec359",
  measurementId: "G-D2MG0GK2ZJ"
};

// Inicialización
firebase.initializeApp(firebaseConfig);

// Acceso global a servicios (compatibilidad con script.js)
const db = firebase.firestore();
const auth = firebase.auth();