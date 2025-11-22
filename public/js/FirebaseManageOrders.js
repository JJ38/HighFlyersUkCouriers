
import { db } from "/js/Firebase.js";
import { collection, getDocs, startAfter, where, query, limit, orderBy, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { addOrdersToTable } from "/js/ManageOrders.js";

let lastVisibleID = null;
let fetchingOrders = false;
let initialQuery = true;
let orderListenerSubscription;
let latestOrderID;
let snapshotQuery;
let orderData = [];

export async function getInitialData(){

    const orderData = getOrderData(query(collection(db, "Orders"), orderBy('ID', 'desc'), limit(20)));
    return orderData;
}

export async function loadAdditionalOrders(){
    
    //if search filter is on return
    if(searchOption.value != ""){
        return;
    }

    const orderData = getOrderData(query(collection(db, "Orders"), orderBy('ID', 'desc'), startAfter(lastVisibleID), limit(20)));
    return orderData;
}

export async function getFilterOrders(q){

    const orderData = getOrderData(q);
    return orderData;
}


window.onresize = (event) => {
    orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
  
}

export function sortOrderData(orderFields){

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
        price: orderFields['price'],
        message: orderFields['message'],
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

async function getOrderData(q){

    console.log("getOrderData");

    const documentSnapshots = await getDocs(q);

    console.log("fesfesf");


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
            
            return querySnapshot.docs;
        
        });

        initialQuery = false;
    }

    return documentSnapshots.docs;

}

function updateSnapshotQuery(){
    snapshotQuery = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("ID", ">", latestOrderID));
    orderListenerSubscription();//unsubscribe from listener

    orderListenerSubscription = onSnapshot(snapshotQuery,  (querySnapshot) => {
        

        addOrdersToTable(querySnapshot.docs, true);
        
        //Update latestOrderID
        if(querySnapshot.docs.length > 0){
            latestOrderID = querySnapshot.docs[querySnapshot.docs.length-1].data()['ID'];   
            updateSnapshotQuery();     
        }
    
    });

}

export async function markOrdersAsPrinted(notPrintedOrders){

    console.log(notPrintedOrders);

    const batch = writeBatch(db);
  
    for(let i = 0; i < notPrintedOrders.length; i++){
      const docRef = doc(db, "Orders", notPrintedOrders[i]);
      batch.update(docRef, {"printed": 1});
    }
    
    try{

        await batch.commit();
        //if successful
        window.location.replace(window.location.origin + "/manage-orders?printerror=false");

    }catch(e){
        //if unsuccessful
        window.location.replace(window.location.origin + "/manage-orders?printerror=true");

    }

  }


