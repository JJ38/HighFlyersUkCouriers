import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, getDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig, databaseName } from "/js/FirebaseSettings.js";


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app, databaseName);
export async function getDocuments(q){

   return await getDocs(q); 
}

export async function getDocument(q){

    return await getDoc(q); 
}


export async function updateDocument(docRef, fieldsToUpdate){

    return await updateDoc(docRef, fieldsToUpdate); 
}

