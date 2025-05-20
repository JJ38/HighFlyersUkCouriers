import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, getDoc, updateDoc, doc, onSnapshot, runTransaction } from "firebase/firestore";
import { getAuth } from "firebase/auth";
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

export async function bulkReadTransaction(docIDs, collectionPath){

    try {

        const result = await runTransaction(db, async (transaction) => {

            const docs = [];

            for (let i = 0; i < docIDs.length; i++) {

                const docRef = doc(db, collectionPath, docIDs[i]);

                const document = transaction.get(docRef); // transaction.get ensures strong consistency
                docs.push(document);
                
            }

            const resolvedDocs = await Promise.all(docs);

            return resolvedDocs; // return value from transaction
        });

        return result;

    } catch (e) {
        console.error("Transaction failed: ", e);
    }

    return false;

}
