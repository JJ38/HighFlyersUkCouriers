import { db, getDocuments, getDocument} from "/js/Firebase.js";
import { where, query, collection, getDocs, doc } from "firebase/firestore";

var orders = document.querySelectorAll('tr');
const confirmDeleteButton = document.getElementById('confirmdelete');
const confirmDeleteForm = document.getElementById('formconfirmdelete');
const orderTable = document.getElementById('orderdata');

console.log(new URLSearchParams(document.location.search).getAll("ID"));
const orderIDs = new URLSearchParams(document.location.search).getAll("ID");
console.log(orderIDs);
for(let i = 0; i < orderIDs.length; i++){

    //getOrderData(query(collection(db, "Orders"), where("ID", "==", parseInt(orderIDs[i]))));
    getOrderData(doc(db, "Orders", orderIDs[i]));
}

confirmDeleteButton.addEventListener('click', () => {

    confirmDelete();

});

async function getOrderData(q){

    getDocument(q).then((documentSnapshots) => {

        if(documentSnapshots.empty){
            alert("error getting orders to delete");
            return;
        }

        console.log(documentSnapshots);
        // if(documentSnapshots.docs < 1){
        //     addOrdersToTable(documentSnapshots);
        // }

        addOrderToTable(documentSnapshots);

    });
    
}


function addOrderToTable(orderArray){

    // for(let i = 0; i < orderArray.length; i++){

    const orderFields = orderArray.data();
    const tableRow = document.createElement('tr');

    const sortedOrderData = sortOrderData(orderFields);

    for(var field in sortedOrderData){

        const tableData = document.createElement('td');
        tableData.innerHTML = sortedOrderData[field];
        tableData.classList.add(field);
        tableRow.append(tableData);
    
    }

    orderTable.appendChild(tableRow);

    const docRef = document.createElement('input');
    docRef.type = "hidden";
    docRef.value = orderArray.id;
    docRef.name = orderArray.id;
    confirmDeleteForm.appendChild(docRef);
    // }
    
}


function sortOrderData(orderFields){

    const sortedOrderData = {

        ID: orderFields['ID'],
        animalType: orderFields['animalType'],
        quantity: orderFields['quantity'],
        email: orderFields['email'],
        account: orderFields['account'],
        deliveryWeek: orderFields['deliveryWeek'],
        
        collectionName: orderFields['collectionName'],
        collectionAddress1: orderFields['collectionAddress1'],
        collectionAddress2: orderFields['collectionAddress2'],
        collectionAddress3: orderFields['collectionAddress3'],
        collectionPostcode: orderFields['collectionPostcode'],
        collectionPhoneNumber: orderFields['collectionPhoneNumber'],
        
        deliveryName: orderFields['deliveryName'],
        deliveryAddress1: orderFields['deliveryAddress1'],
        deliveryAddress2: orderFields['deliveryAddress2'],
        deliveryAddress3: orderFields['deliveryAddress3'],
        deliveryPostcode: orderFields['deliveryPostcode'],
        deliveryPhoneNumber: orderFields['deliveryPhoneNumber'],

        payment: orderFields['payment'],
        message: orderFields['message'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}



function confirmDelete(){

    confirmDeleteForm.submit();
}