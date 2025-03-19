import { initializeApp } from 'firebase/app';
 import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIQIz-3oo2OfBaJp7DvKI7c8EM58xI5e8",
  authDomain: "discount-website-311aa.firebaseapp.com",
  projectId: "discount-website-311aa",
  storageBucket: "discount-website-311aa.firebasestorage.app",
  messagingSenderId: "429264401831",
  appId: "1:429264401831:web:963173303e72a4ed033282",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export { auth, provider, signInWithPopup, signOut };
