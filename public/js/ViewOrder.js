import { db, getDocuments } from "/js/Firebase.js";
import { where, query, collection } from "firebase/firestore";

const ID = parseInt(new URLSearchParams(document.location.search).get("id"));

console.log(ID);
const q = query(collection(db, "Orders"), where("ID", "==", ID));


const fieldsMap = {
    ID: "ID:",
    animalType: "Animal Type:",
    email: "Email:",
    quantity: "Quantity:",
    username: "Username:",
    deliveryWeek: "Delivery Week:",
    
    collectionName: "Collection Name:",
    collectionAddress1: "Collection Address 1:",  
    collectionAddress2: "Collection Address 2:",
    collectionAddress3: "Collection Address 3:",
    collectionPostcode: "Collection Postcode:",
    collectionPhoneNumber: "Collection Phonenumber:",
    
    deliveryName: "Delivery Name:",
    deliveryAddress1: "Delivery Address 1:",
    deliveryAddress2: "Delivery Address 2:",
    deliveryAddress3: "Delivery Address 3:",
    deliveryPostcode: "Delivery Postcode:",
    deliveryPhoneNumber: "Delivery Phonenumber:",

    payment: "Payment:",
    price: "Price:",
    message: "Message:",
    code: "Code:",
    addedBy: "Added By:",
    printed: "Printed:",
    timestamp: "Timestamp:",
}

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
        field.innerText = fieldsMap[fields];

        const data = document.createElement('td');
        data.innerText = sortedOrderData[fields];

        tableRow.appendChild(field);
        tableRow.appendChild(data);    
        
        table.appendChild(tableRow);
    }

});


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
        price: orderFields['price'],
        message: orderFields['message'],
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

