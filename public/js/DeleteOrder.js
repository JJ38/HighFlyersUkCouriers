import { db, getDocuments } from "/js/Firebase.js";
import { where, query, collection } from "firebase/firestore";

const ID = parseInt(new URLSearchParams(document.location.search).get("id"));
const form = document.getElementById("form");

console.log(ID);
const q = query(collection(db, "Orders"), where("ID", "==", ID));

getDocuments(q).then((documentSnapshots) => {

    if(documentSnapshots.docs.length == 0){
        alert("Error fetching order");
        exit();
    }

    const table = document.getElementById("orderdata");
    const orderData = documentSnapshots.docs[0].data();

    const sortedOrderData = sortOrderData(orderData);

    console.log(sortedOrderData);

    for(var fields in sortedOrderData){

        console.log(fields);

        const tableRow = document.createElement('tr');

        const field = document.createElement('td');
        field.innerText = fields

        const data = document.createElement('td');
        data.innerHTML = sortedOrderData[fields];

        tableRow.appendChild(field);
        tableRow.appendChild(data);    
        
        table.appendChild(tableRow);
    }

    const docRef = document.createElement('input');
    docRef.type = "hidden";
    docRef.value = documentSnapshots.docs[0].id;
    docRef.name = "docRef";

    form.appendChild(docRef);

});


function sortOrderData(orderFields){

    const sortedOrderData = {

        ID: orderFields['ID'],
        animalType: orderFields['animalType'],
        quantity: orderFields['quantity'],
        email: orderFields['email'],
        boxes: orderFields['boxes'],
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
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

