
import { initializeApp } from "firebase/app";
import { collection, getFirestore, getDocs, startAfter, where, query, limit, orderBy, onSnapshot} from "firebase/firestore";
import { initial } from "lodash";

const orderTable = document.getElementById('tableBody');
const orderDataWrapper = document.getElementById('orderDataWrapper');

let orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
let lastVisibleID = null;
let fetchingOrders = false;
let initialQuery = true;
let orderListenerSubscription;
let latestOrderID;
let snapshotQuery;

const firebaseConfig = {
  apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
  authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
  projectId: "highflyersukcouriers-a9c17",
  storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
  messagingSenderId: "970355130070",
  appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
  measurementId: "G-93M1E0Q9FJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

getOrderData();

orderDataWrapper.addEventListener('scroll', (event) => {
  
    const scrollHeight = event.target.scrollHeight;
    const scrollTop = event.target.scrollTop; 

    if(fetchingOrders){
        return;
    }

    if(scrollHeight - scrollTop - orderDataWrapperHeight < 100){
        fetchingOrders = true;
        getOrderData();
        console.log("Fetching Orders");
    }

   
   
});

window.onresize = (event) => {
    orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
    console.log(orderDataWrapperHeight);
}


function addOrdersToTable(orderArray, prepend){

    for(let i = 0; i < orderArray.length; i++){

        const orderFields = orderArray[i].data();
        const tableRow = document.createElement('tr');

        const sortedOrderData = sortOrderData(orderFields);
         
        for(var field in sortedOrderData){

            const tableData = document.createElement('td');
            tableData.innerHTML = orderFields[field];
            tableRow.appendChild(tableData);
        }

        //add order checkbox
        const tableData = document.createElement('td');
        const orderCheckBox = document.createElement('input');
        orderCheckBox.type = "checkbox";
        orderCheckBox.id = orderFields['ID'];
        orderCheckBox.name = orderFields['ID'];
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
    }

    fetchingOrders = false;

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
        collectionAddress3: orderFields['collectionAddress2'],
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

async function getOrderData(){

    let q;
    
    if(initialQuery){
        //initial query
        q = query(collection(db, "Orders"), orderBy('ID', 'desc'), limit(20));

    }else{
        //pagination query
        q = query(collection(db, "Orders"), orderBy('ID', 'desc'), startAfter(lastVisibleID), limit(20));
    }
   
    const documentSnapshots = await getDocs(q);

    if(documentSnapshots.empty){
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


