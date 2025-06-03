import { query, collection, where, limit, orderBy, doc, writeBatch } from "firebase/firestore";
import { db, getDocuments, getDocument, updateDocument, bulkReadTransaction, filterSearch } from "/js/Firebase.js";



export const sortAlphabetically = (a, b) => {

  if(a.runName < b.runName){
    return -1;
  }

  else if(a.runName > b.runName){
    return 1;
  }

  return 0;

}


export async function deleteShipmentDocument(id){

  //fetch shipment document
  let shipmentDocument;
  let shipmentRef;

  try{

    shipmentRef = doc(db, 'Shipments', id);
    shipmentDocument = await getDocument(shipmentRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const batch = writeBatch(db);
  const shipmentRunsDocumentIDs = shipmentDocument.data()['runs'];

  //add runs in shipment document to batch
  for(let i = 0; i < shipmentRunsDocumentIDs.length; i++){

    const runRef = doc(db, "Runs", shipmentRunsDocumentIDs[i]);
    batch.delete(runRef);

  }

  //add shipment document to batch
  batch.delete(shipmentRef);

  try{

    await batch.commit();
    return true;

  }catch(e){

    return false;

  }

}


export async function generateShipment(shipmentName, shipmentType, shipmentDeliveryWeekInput){

  try{

    const deliveryWeek = parseInt(shipmentDeliveryWeekInput);

    //fetch postcode run definitions
    const docRef = doc(db, 'Settings', 'runDefinitions');
    const runDefinitions = await getDocument(docRef);

    //get runs by delivery week
    const q = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("deliveryWeek", "==", deliveryWeek));
    const orderData = await getDocuments(q);

    //organise orders into defined runs based on runtype and postcode
    const runStructList = generateRuns(runDefinitions.data(), orderData.docs, shipmentType, deliveryWeek);

    console.log(runStructList);

    const storeShipmentResult = await storeShipment(runStructList, shipmentName);
    return storeShipmentResult;

  }catch(e){

    console.log(e);
    return false;

  }

}

async function storeShipment(runStructList, shipmentName){

  const batch = writeBatch(db);

  let runDocRefs = [];

  for(let i = 0; i < runStructList.length; i++){

    const runRef = doc(collection(db, 'Runs'));
    runDocRefs.push(runRef.id);
    batch.set(runRef, runStructList[i]);

  }

  const shipmentRef = doc(collection(db, "Shipments"));
  batch.set(shipmentRef,  {

    runs: runDocRefs,
    shipmentName: shipmentName

  });

  // Commit the batch

  try{

    console.log("attempt to commit batch");
    await batch.commit();
    return true;

  }catch(e){

    console.log(e);

  }

  return false;

}

export function generateRuns(runDefinitions, orderData, shipmentTypeInput, deliveryWeek){

  const runStructList = [];

  const runType = shipmentTypeInput == 'collection' ? 'collectionPostcode' : 'deliveryPostcode';

  for(let i = 0; i < orderData.length; i++){
   
    //find corrosponding key in rundefinitions and get value
    const orderPostcode = orderData[i].data()[runType];

    if(orderPostcode != null){

      let runName = null;

      if(runDefinitions[orderPostcode.substring(0,4)] != null){

        runName = runDefinitions[orderPostcode.substring(0,4)];

      }else if(runDefinitions[orderPostcode.substring(0,3)] != null){

        runName = runDefinitions[orderPostcode.substring(0,3)];

      }else if(runDefinitions[orderPostcode.substring(0,2)] != null){

        runName = runDefinitions[orderPostcode.substring(0,2)];

      }

      generateStopForRun(runName, orderData[i], shipmentTypeInput, deliveryWeek, runStructList);

    }

  }

  return runStructList;

}

function generateStopForRun(runName, orderData, stopType, deliveryWeek, runStructList){

  //does run exist in run list
  let run = runStructList.find((run) => {
    return run.runName === runName;
  })

  if(run == null){

    run = {

      assignedDriver: "",
      fuelCost: "",
      runName: runName,
      runWeek: deliveryWeek,
      stops: [],     

    }

    run.stops.push(
    {
      orderID: orderData.id,
      stopType: stopType, //collection or delivery
      isLocked: false,
      stopNumber: 1
    });
      
    runStructList.push(run);

    return;
  }

  run.stops.push(
  {
    orderID: orderData.id,
    stopType: stopType, //collection or delivery
    isLocked: false,
    stopNumber: run.stops.length + 1
  });

  return runStructList;

}

export async function fetchShipment(shipmentName){

  const shipmentData = await getDocuments(query(collection(db, 'Shipments'), where("shipmentName", "==", shipmentName), limit(1)));

  if(shipmentData.empty){
    console.log("shipment doesnt exist");
    return;
  }

  return shipmentData;

}

export async function fetchRun(runID){

  try{

    const runData = await getDocument(query(doc(db, 'Runs', runID)));
    return runData;

  }catch(e){

    return false;
  }

}

export async function fetchRunsInShipment(runIDs){

  const numberOfRuns = runIDs.length;

  let promises = [];

  for(let i = 0; i < numberOfRuns; i++){

    promises.push(fetchRun(runIDs[i]));

  } 
  
  return await Promise.all(promises);

}

//assigns stops to the unassighed run within the currently selected shipment
export async function assignStopsToShipment(orderIDs, stopType, selectedShipment){

  let runData;

  try{

    const shipmentData = await fetchShipment(selectedShipment);
    runData = await fetchRunsInShipment(shipmentData.docs[0].data()['runs']);

  }catch(e){

    console.log(e);
    return false;

  }

  const unassignedRun = runData.find((runDocument) => {

    return runDocument.data().runName == null;

  });

  if(unassignedRun == null){

    return false;

  }

  if(orderIDs.length == 0){

    return false;

  }

  const stopsToAdd = [];

  for(let i = 0; i < orderIDs.length; i++){

    stopsToAdd.push(
      {
        orderID: orderIDs[i],
        stopType: stopType 
      }
    );

  }

  //check if stop is already in shipment 

  //returns false or a string
  const result = isStopInShipment(runData, stopsToAdd);
  
  if(result !== false){

    return result;

  }

  try{

    const batch = writeBatch(db);

    const runRef = doc(db, 'Runs', unassignedRun.id);

    const newStops = stopsToAdd.concat(unassignedRun.data()['stops']);
    batch.update(runRef, {"stops": newStops})

    batch.commit();

  }catch(e){

    console.log(e);
    return false;

  }

  return true;

}


export async function assignStopsToRun(runID, stops, currentShipmentUnassignedOrders){

  const batch = writeBatch(db);
  //remove stops from unassigned run document

  const unassignedStopsRef = doc(db, 'Runs', currentShipmentUnassignedOrders); 
  let unassignedOrdersDocument;

  try{

    unassignedOrdersDocument = await getDocument(unassignedStopsRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const unassignedStops = unassignedOrdersDocument.data()['stops'];

  const removedStops = unassignedStops.filter((unassignedStop) => {

    return !stops.includes(unassignedStop.orderID);

  });

  batch.update(unassignedStopsRef, {"stops": removedStops})

  //add runs to run document

  const stopsToAdd = unassignedStops.filter((unassignedStop) => {

    return stops.includes(unassignedStop.orderID);

  });

  const runRef = doc(db, 'Runs', runID); 
  let runDocument;
  
  try{

    runDocument = await getDocument(runRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const currentNumberOfStops = runDocument.data()['stops'].length 

  for(let i = 0; i < stopsToAdd.length; i++){

    stopsToAdd[i].stopNumber = currentNumberOfStops + i + 1;

  }


  const newStops = runDocument.data()['stops'].concat(stopsToAdd);
  batch.update(runRef, {"stops": newStops})

  try{

    await batch.commit()

  }catch(e){

    console.log(e);
    return false;
  }

  return true;

} 

export async function getRunStopsOrderData(stops){

  const orderIDs = [];

  for(let i = 0; i < stops.length; i++){

    orderIDs.push(stops[i]['orderID']);

  }

  const orders = await bulkReadTransaction(orderIDs, 'Orders');

  if(orders === false){

    alert("error fetching stops for that run")
    return;
  }

  return orders;

}




export function updateStopNumberInRun (orderID, stopType, runStops, stopNumber){

  for(let j = 0; j < runStops.length; j++){

    if(runStops[j].stopData.ID === orderID){

      if(runStops[j].stopType === stopType){

        const stopCopy = Object.assign({}, runStops[j]);
        stopCopy.stopNumber = stopNumber;

        return stopCopy;
      
      }

    }

  }

}


export function removeStopDataFromStop(updatedStops){

  const updateDatabaseStops = [];

  for(let i = 0; i < updatedStops.length; i++){

    const stopCopy = Object.assign({}, updatedStops[i]);
    delete stopCopy.stopData;

    updateDatabaseStops.push(stopCopy);

  }

  return updateDatabaseStops;

}


export function parseRunInfo(doc){

  const runData = doc.data();

  const runStruct = {
    documentId: doc.id,
    assignedDriver: runData['assignedDriver'],
    fuelCost: runData['fuelCost'],
    stops: runData['stops'],
    runName: runData['runName'],
    runWeek: runData['runWeek'],
 
  }
  
  return runStruct;

}

export async function updateRun(documentId, fieldsToUpdate){

  const runRef = doc(db, 'Runs', documentId);

  try{

    await updateDocument(runRef, fieldsToUpdate);
    
  }catch(e){

    console.log(e);
    return false;

  }

  return true;
}

export function isStopInShipment(runDocuments, stopsToAdd){

  for(let i = 0; i < runDocuments.length; i++){

    const runStops = runDocuments[i].data()['stops'];

    for(let j = 0; j < runStops.length; j++){
    
      if(isStopInArray(stopsToAdd, runStops[j])){
        
        let runName = runDocuments[i].data().runName; 
        if(runDocuments[i].data().runName == null){
          runName = "Unassigned";
        }

        return "Stop already in " + runName + " run";
      }

    }

  }

  return false;

}

function isStopInArray(arr, stop) {

  for(let i = 0; i < arr.length; i++){

    if(arr[i].orderID === stop.orderID){
      
      if(arr[i].stopType === stop.stopType){
        return true;
      }

    }

  }

  return false;

};

export function indexOfElementInArray(arr, element){

  for(let i = 0; i < arr.length; i++){

    if(arr[i] === element){
      return i;
    }
  }

  return -1

}

export function compareStops(a, b){

  if(a.orderID === b.orderID){

    if(a.stopType === b.stopType){

      return true
    }

  }

  return false;

}

export function getPositionOfElement(element){

  const elementBounds = element.getBoundingClientRect();

  const width = elementBounds.width;
  const height = elementBounds.height;

  const top = elementBounds.y;
  const left = elementBounds.x;

  const xPos = left - (width/2);
  const yPos = top - (height/2);

  return [xPos, yPos];

}

export function mergeStopsWithOrderData(stops, orders){

  for(let i = 0; i < stops.length; i++){

    for(let j = 0; j < orders.length; j++){

      if(stops[i].orderID == orders[j].id){

        //to include in every stop type
        const stopData = {};
        const orderData = orders[j].data();

        stopData['message'] = orderData['message'];
        stopData['email'] = orderData['email'];
        stopData['animalType'] = orderData['animalType'];
        stopData['ID'] = orderData['ID'];
        stopData['quantity'] = orderData['quantity'];
        stopData['payment'] = orderData['payment'];
        stopData['code'] = orderData['code'];


        if(stops[i].stopType == "collection"){
          //add collection data to stop
          stopData['address1'] = orderData['collectionAddress1'];
          stopData['address2'] = orderData['collectionAddress2'];
          stopData['address3'] = orderData['collectionAddress3'];
          stopData['name'] = orderData['collectionName'];
          stopData['postcode'] = orderData['collectionPostcode'];
          stopData['phoneNumber'] = orderData['collectionPhoneNumber'];

        }else if(stops[i].stopType == "delivery"){
          //add delivery data to stop
          stopData['address1'] = orderData['deliveryAddress1'];
          stopData['address2'] = orderData['deliveryAddress2'];
          stopData['address3'] = orderData['deliveryAddress3'];
          stopData['name'] = orderData['deliveryName'];
          stopData['postcode'] = orderData['deliveryPostcode'];
          stopData['phoneNumber'] = orderData['deliveryPhoneNumber'];

        }

        stops[i]['stopData'] = stopData;
    
      }

    }

  }

}
