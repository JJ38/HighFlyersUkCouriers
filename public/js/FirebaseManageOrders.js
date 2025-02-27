
import { db } from "/js/Firebase.js";
import { collection, getFirestore, getDocs, startAfter, where, query, limit, orderBy, onSnapshot} from "firebase/firestore";
import { addPrintListener } from "/js/ManageOrders.js";


const orderTable = document.getElementById('tableBody');
const orderDataWrapper = document.getElementById('orderDataWrapper');
const searchButton = document.getElementById('searchButton');
const searchValue = document.getElementById('searchValue');
const searchOption = document.getElementById('searchOption');

let orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
let lastVisibleID = null;
let fetchingOrders = false;
let initialQuery = true;
let orderListenerSubscription;
let latestOrderID;
let snapshotQuery;
let orderData = [];

getOrderData(query(collection(db, "Orders"), orderBy('ID', 'desc'), limit(20)));

orderDataWrapper.addEventListener('scroll', (event) => {
  
    const scrollHeight = event.target.scrollHeight;
    const scrollTop = event.target.scrollTop; 

    if(fetchingOrders){
        return;
    }

    //if search filter is on return
    if(searchOption.value != ""){
        return;
    }

    if(scrollHeight - scrollTop - orderDataWrapperHeight < 100){
        fetchingOrders = true;
        getOrderData(query(collection(db, "Orders"), orderBy('ID', 'desc'), startAfter(lastVisibleID), limit(20)));
        console.log("Fetching Orders");
    }

});

searchButton.addEventListener('click', () => {

    var q;

    switch(searchOption.value){

        case "ID":
        case "deliveryWeek":
        case "quantity":
            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption.value, "==", parseInt(searchValue.value)));
            break;
        default:
            q = query(collection(db, "Orders"), orderBy('ID', 'desc'), where(searchOption.value, "==", searchValue.value));
            break;
    }

    //clear table of current orders
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "";
    getOrderData(q);

});

window.onresize = (event) => {
    orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
  
}


function addOrdersToTable(orderArray, prepend){

    for(let i = 0; i < orderArray.length; i++){

        const orderFields = orderArray[i].data();
        const tableRow = document.createElement('tr');

        const sortedOrderData = sortOrderData(orderFields);

        for(var field in sortedOrderData){

            const tableData = document.createElement('td');
            tableData.innerHTML = sortedOrderData[field];
            tableData.classList.add(field);
            tableRow.append(tableData);
        
        }

        

        //add order checkbox
        const tableData = document.createElement('td');
        const orderCheckBox = document.createElement('input');
        orderCheckBox.type = "checkbox";
        orderCheckBox.id = orderFields['ID'];
        orderCheckBox.name = "ID";
        orderCheckBox.value = orderFields['ID'];
        orderCheckBox.setAttribute('onclick', 'highlightorder(this)');

        tableData.appendChild(orderCheckBox);

        tableRow.prepend(tableData);
        if(prepend){
            orderTable.prepend(tableRow);
        }else{
            orderTable.appendChild(tableRow);
        }
        
        //add order buttons
        const orderDataMap = new Map();
        orderDataMap.set("ID", orderFields['ID']);
        orderDataMap.set("printed", orderFields['printed'])
        
        const orderButtons = getOrderButtons(orderFields);
        tableRow.appendChild(orderButtons);

        //add print button to orderFields so listener can be added to it
        orderFields['printButton'] = orderButtons.children[0].firstChild;
        addPrintListener(orderFields);
    }

    fetchingOrders = false;



}

function getOrderButtons(orderData){

    const buttonWrapper = document.createElement('td');

    const printLink = document.createElement('a');
    printLink.classList = "print";
    const printButton = document.createElement('button');
    printButton.innerText = "Print";
    printButton.type= "button";
    printLink.appendChild(printButton);
    //add print button to array

    const viewLink = document.createElement('a');
    viewLink.href="/view-order?id=" + orderData["ID"];
    const viewButton = document.createElement('button');
    viewButton.innerText = "View";
    viewButton.type= "button";
    viewLink.appendChild(viewButton);

    const editLink = document.createElement('a');
    editLink.href = "/edit-order?id=" + orderData["ID"];
    const editButton = document.createElement('button');
    editButton.innerText = "Edit";
    editButton.type= "button";
    editLink.appendChild(editButton);

    const deleteLink = document.createElement('a');
    deleteLink.href = "/delete-order?id=" + orderData["ID"];
    const deleteButton = document.createElement('button');
    deleteButton.innerText = "Delete";
    deleteButton.type= "button";
    deleteLink.appendChild(deleteButton);


    buttonWrapper.appendChild(printLink);
    buttonWrapper.appendChild(viewLink);
    buttonWrapper.appendChild(editLink);
    buttonWrapper.appendChild(deleteLink);
    buttonWrapper.classList = "orderbuttons";

    return buttonWrapper;
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
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

async function getOrderData(q){

    
    
    // if(initialQuery){
    //     //initial query
    //     q = query(collection(db, "Orders"), orderBy('ID', 'desc'), limit(20));

    // }else{
    //     //pagination query
    //     q = query(collection(db, "Orders"), orderBy('ID', 'desc'), startAfter(lastVisibleID), limit(20));
    // }
   
    const documentSnapshots = await getDocs(q);

    if(documentSnapshots.empty){
        console.log("no results");
        return;
    }
    
    lastVisibleID = documentSnapshots.docs[documentSnapshots.docs.length-1].data()['ID'];
    
    if(initialQuery){
        
        latestOrderID = documentSnapshots.docs[0].data()['ID'];
        snapshotQuery = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("ID", ">", latestOrderID));
        //set up listener to get documents with IDs higher than the current highest ID value
        orderListenerSubscription = onSnapshot(snapshotQuery,  (querySnapshot) => {

            addOrdersToTable(querySnapshot.docs, true);
            //Update latestOrderID
            if(querySnapshot.docs.length > 0){
                latestOrderID = querySnapshot.docs[querySnapshot.docs.length-1].data()['ID'];   
                updateSnapshotQuery();     
            }
        
        });

        initialQuery = false;
    }

    addOrdersToTable(documentSnapshots.docs, false);
}

function updateSnapshotQuery(){
    snapshotQuery = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("ID", ">", latestOrderID));
    orderListenerSubscription();//unsubscribe from listener

    orderListenerSubscription = onSnapshot(snapshotQuery,  (querySnapshot) => {

        addOrdersToTable(querySnapshot.docs, true);
        
        //Update latestOrderID
        console.log(querySnapshot.docs[querySnapshot.docs.length-1]);
        if(querySnapshot.docs.length > 0){
            latestOrderID = querySnapshot.docs[querySnapshot.docs.length-1].data()['ID'];   
            updateSnapshotQuery();     
        }
    
    });

}


