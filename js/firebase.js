// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
// Obtenim de Firebase el mòdul getAuth, que necessitem per autenticar usuaris:
import { getAuth } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZpTi0j-TBTfDw5F7ZEs0UBF2ujB4fiDc",
    authDomain: "ride-sweetly-auth.firebaseapp.com",
    projectId: "ride-sweetly-auth",
    storageBucket: "ride-sweetly-auth.appspot.com",
    messagingSenderId: "858727290148",
    appId: "1:858727290148:web:8d150eab2cbbb525838fb1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);