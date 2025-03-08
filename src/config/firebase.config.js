// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
<<<<<<< HEAD
    apiKey: "AIzaSyAIQIz-3oo2OfBaJp7DvKI7c8EM58xI5e8",
    authDomain: "discount-website-311aa.firebaseapp.com",
    projectId: "discount-website-311aa",
    storageBucket: "discount-website-311aa.firebasestorage.app",
    messagingSenderId: "429264401831",
    appId: "1:429264401831:web:963173303e72a4ed033282",
    measurementId: "G-SQX0HWEE7Q"
  };
=======
  apiKey: "AIzaSyAbiO0OC0GxaiqjyPCAO56zloy7i1pBK9k",
  authDomain: "discount-565e9.firebaseapp.com",
  projectId: "discount-565e9",
  storageBucket: "discount-565e9.firebasestorage.app",
  messagingSenderId: "399809235210",
  appId: "1:399809235210:web:46a312691d7749188a12f3",
};

>>>>>>> 578b5de (update: UI admin)
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

<<<<<<< HEAD
export { auth, provider, signInWithPopup, signOut };
=======
export { auth, provider, signInWithPopup, signOut };
>>>>>>> 578b5de (update: UI admin)
