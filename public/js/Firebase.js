import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, getDoc, updateDoc, doc, query, orderBy, where, collection, runTransaction, or, documentId } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig, databaseName } from "/js/FirebaseSettings.js";


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app, databaseName);
export const dbdev = getFirestore(app, 'development');


export async function getDocuments(q){

    try{

        return await getDocs(q); 

    }catch(e){

        console.log(e);
        return false
    }
}

export async function getDocument(q){

    try{

        return await getDoc(q); 

    }catch(e){

        console.log(e);
        return false
    }
}

export async function updateDocument(docRef, fieldsToUpdate){

    try{

        return await updateDoc(docRef, fieldsToUpdate); 

    }catch(e){

        console.log(e);
        return false
    }

}

export async function bulkReadTransaction(docIDs, collectionPath){

    try {

        const result = await runTransaction(db, async (transaction) => {

            const docs = [];

            for (let i = 0; i < docIDs.length; i++) {

                const docRef = doc(db, collectionPath, docIDs[i]);

                const document = transaction.get(docRef); 

                docs.push(document);
                
            }

            const resolvedDocs = await Promise.all(docs);

            return resolvedDocs;
        });

        return result;

    } catch (e) {
        console.error("Transaction failed: ", e);
    }

    return false;

}



export async function filterSearch(searchOption, searchValue){

    let q;
    console.log(searchOption);
    console.log(searchValue);

    switch(searchOption){

        case "ID":
        case "price":
        case "quantity":
        
            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption, "==", parseInt(searchValue)));
         
            break;

        case "deliveryWeek":

            console.log(q);
            q = query(collection(db, "Orders"), orderBy('ID', 'asc'), or(where(searchOption, "==", searchValue), where(searchOption, "==", parseInt(searchValue))));
           
            break

        case "printed":

            let translatedSearchValue = "";

            if(searchValue.toLowerCase() == "printed"){

                translatedSearchValue = 1;

            }else if(searchValue.value.toLowerCase() == "not printed"){

                translatedSearchValue = 0;
                
            }   

            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption, "==", translatedSearchValue));

            break;

        case "account":
            
            const searchValueSet = new Set();
            searchValueSet.add(searchValue);
            //fetch user document
            const accountID = await getCustomerAccountID(searchValue);

            if(accountID != null){
                searchValueSet.add(accountID)
            }

            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption, "in", Array.from(searchValueSet)));

            break;

        default:
            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption, "==", searchValue));
            break;
    }

    return q;

}

//account value may be id of user doc or string literal of account name
async function getCustomerAccountID(accountValue){

    //fetch doc assuming its id of user doc
    const userDoc = await getDocuments(query(collection(db, "Users"), where("username", "==", accountValue + "@placeholder.com")));
    console.log(userDoc);

    if(userDoc == false || userDoc.docs.length == 0){
        return null;
    }

    console.log(userDoc.docs[0].id);
    return userDoc.docs[0].id;

}