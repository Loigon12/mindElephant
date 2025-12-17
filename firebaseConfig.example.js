
const firebaseConfig = {
  apiKey: "AIzaSyBTSxooiVG5p0LHPkYBIHgWRntsya-FTGY",
  authDomain: "mindelephant.firebaseapp.com",
  projectId: "mindelephant",
  storageBucket: "mindelephant.firebasestorage.app",
  messagingSenderId: "425227723420",
  appId: "1:425227723420:web:761a35aa7c532a088ec359",
  measurementId: "G-D2MG0GK2ZJ"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();