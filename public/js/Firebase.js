import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, getDoc, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

export const auth = getAuth(app); 
export const db = getFirestore(app);
export async function getDocuments(q){

   return await getDocs(q); 
}

export async function getDocument(q){

    return await getDoc(q); 
}


export async function updateDocument(docRef, fieldsToUpdate){

    return await updateDoc(docRef, fieldsToUpdate); 
}

