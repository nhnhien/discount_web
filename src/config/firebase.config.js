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

  apiKey: "AIzaSyAbiO0OC0GxaiqjyPCAO56zloy7i1pBK9k",
  authDomain: "discount-565e9.firebaseapp.com",
  projectId: "discount-565e9",
  storageBucket: "discount-565e9.firebasestorage.app",
  messagingSenderId: "399809235210",
  appId: "1:399809235210:web:46a312691d7749188a12f3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export { auth, provider, signInWithPopup, signOut };
