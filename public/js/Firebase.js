import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
    authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
    projectId: "highflyersukcouriers-a9c17",
    storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
    messagingSenderId: "970355130070",
    appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
    measurementId: "G-93M1E0Q9FJ",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);