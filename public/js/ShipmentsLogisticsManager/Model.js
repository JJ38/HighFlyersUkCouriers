import { query, collection, where, limit, orderBy, doc, writeBatch, arrayUnion, deleteDoc } from "firebase/firestore";
import { db, getDocuments, getDocument, updateDocument, bulkReadTransaction, filterSearch } from "/js/Firebase.js";
import { GeocodingAPIKey, calculateRouteEndpoint } from '/js/Settings.js';
import { DateTime } from "luxon";
import { logAssignedStops, logRemoveStopsFromShipment, logAddStopsToShipment, logInfo, logErrorAssigningStops } from "/js/Sentry.js";

let GoogleAutocomplete;
let customerAccounts;
let calculationError;

export function getCalculationError(){
  return calculationError;
}

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
  let staffDocuments;
  let driverDocuments;

  try{

    shipmentRef = doc(db, 'Shipments', id);
    shipmentDocument = await getDocument(shipmentRef);

    const staffQuery = query(collection(db, 'Staff'));
    staffDocuments = await getDocuments(staffQuery);

    const driverQuery = query(collection(db, 'Drivers'));
    driverDocuments = await getDocuments(driverQuery);

  
    let runIDs = [];
    let shipmentNames = new Set();

    const batch = writeBatch(db);
    const shipmentRunsDocumentIDs = shipmentDocument.data()['runs'];

    //add runs in shipment document to batch
    for(let i = 0; i < shipmentRunsDocumentIDs.length; i++){

      const runRef = doc(db, "Runs", shipmentRunsDocumentIDs[i]);
      runIDs.push(shipmentRunsDocumentIDs[i]);
      batch.delete(runRef);

    }



    //add shipment document to batch
    batch.delete(shipmentRef);



    //add unassign staff members to run to batch
    for(let i = 0; i < staffDocuments.docs.length; i++){

      const staffData = staffDocuments.docs[i].data();
      const assignedRuns = staffData['assignedRuns'];

      const newAssignedRuns = [];
    
      for(let j = 0; j < assignedRuns.length; j++){

        if(!runIDs.includes(assignedRuns[j]['runID'])){

          newAssignedRuns.push(assignedRuns[j]);

        }

      }

      const staffDocRef = doc(db, "Staff", staffDocuments.docs[i].id);
      batch.update(staffDocRef, {"assignedRuns": newAssignedRuns});
      
    }


    for(let i = 0; i < driverDocuments.docs.length; i++){

      const driverData = driverDocuments.docs[i].data();
      const assignedRuns = driverData['assignedRuns'];
      let progressedRuns = driverData['progressedRuns'];

      if(progressedRuns == undefined){
        progressedRuns = [];
      }

      const newAssignedRuns = [];
      const newProgressedRuns = [];

      for(let j = 0; j < assignedRuns.length; j++){

        if(!runIDs.includes(assignedRuns[j]['runID'])){

          newAssignedRuns.push(assignedRuns[j]);

        }

      }

      for(let j = 0; j < progressedRuns.length; j++){

        if(!runIDs.includes(progressedRuns[j]['runID'])){

          newProgressedRuns.push(progressedRuns[j]);

        }

      }

      const driverDocRef = doc(db, "Drivers", driverDocuments.docs[i].id);
      batch.update(
        driverDocRef, 
        {
          "assignedRuns": newAssignedRuns,
          "progressedRuns": newProgressedRuns
        }
      );
      
    }

    await batch.commit();
    return true;

  }catch(e){

    console.log(e);
    return false;

  }

}

export async function removeRunFromShipment(runIDToRemove, shipmentName){

  let shipmentDocument;

  try{

    shipmentDocument = await fetchShipment(shipmentName);

    if(shipmentDocument == false){
      return false;
    }

  }catch(e){

    console.log(e);
    return false;

  }

  const newRuns = shipmentDocument.data()['runs'].filter((runID) => {

    return runID != runIDToRemove;

  })

  console.log(newRuns);

  try{

    const batch = writeBatch(db)

    const shipmentRef = doc(db, "Shipments", shipmentDocument.id);
    batch.update(shipmentRef, {"runs": newRuns});

    batch.delete(doc(db, "Runs", runIDToRemove));

    batch.commit();

    return true;

  }catch(e){

    console.log(e);
    return false;

  }


}

export async function isShipmentNameAvailable(shipmentNameToCheck){

  try{
    
    const q = query(collection(db, "Shipments"), where("shipmentName", "==", shipmentNameToCheck));
    const shipmentDocs = await getDocuments(q);

    if(shipmentDocs.docs.length > 0){
      return false;
    }

  }catch(e){

    console.log(e);
    return false;
  }

  return true;

}


export async function generateShipment(shipmentName, shipmentType, shipmentDeliveryWeekInput){

  try{

    const deliveryWeek = parseInt(shipmentDeliveryWeekInput);

    //fetch postcode run definitions
    const docRef = doc(db, 'Settings', 'runDefinitions');
    const runDefinitions = await getDocument(docRef); //postcodes for runs

    //fetch postcode run defaults
    const runDefaultsDocRef = doc(db, 'Settings', 'runDefaults');
    const runDefaults = await getDocument(runDefaultsDocRef); //postcodes for runs
  
    //get orders by delivery week
    const q = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("deliveryWeek", "==", deliveryWeek));
    const orderDataQuery = await getDocuments(q);

    //create run documents
    const runDocuments = generateRunDocs(runDefinitions.data(), runDefaults.data(), deliveryWeek, shipmentType, shipmentName);

    //create a list of stops from orders
    await generateStopsFromOrders(orderDataQuery.docs, shipmentType, runDocuments, runDefinitions.data());

    addStopNumbersToStops(runDocuments);

    const storeShipmentResult = await storeShipment(runDocuments, shipmentName, deliveryWeek);
    
    return storeShipmentResult;

  }catch(e){

    console.log(e);
    return false;

  }

}


function addStopNumbersToStops(runDocuments){

  for(let i = 0; i < runDocuments.length; i++){

    for(let j = 0; j < runDocuments[i].stops.length; j++){

      // console.log(runDocuments[i].stops);
      runDocuments[i].stops[j]['stopNumber'] = j + 1;

    }

  }

}


function generateRunDocs(runDefinitions, runDefaultSettings, shipmentDeliveryWeekInput, shipmentType, shipmentName){
  
  const runSet = new Set();

  //for unassigned stops document
  runSet.add(null);

  for (const property in runDefinitions) {
    runSet.add(runDefinitions[property]);
  }

  const runDocumentList = [];

  runSet.forEach((runName) => {

    let runProperties = null;

    if(runDefaultSettings[runName] != null){

      if(shipmentType == "collection"){

        runProperties = runDefaultSettings[runName]['collection'];

      }else if(shipmentType == "delivery"){

        runProperties = runDefaultSettings[runName]['delivery'];

      }


    }

    runDocumentList.push(generateRunDoc(runName, runProperties, shipmentDeliveryWeekInput, shipmentName));

  });
  
  return runDocumentList;

}


async function generateStopsFromOrders(orderDataDocuments, shipmentType, runDocuments, runDefinitions){

  const promises = [];

  for(let i = 0; i < orderDataDocuments.length; i++){

    promises.push(generateAndAssignStop(orderDataDocuments[i], shipmentType, runDocuments, runDefinitions));

  }

  return await Promise.all(promises);

}

async function generateAndAssignStop(orderDocument, shipmentType, runDocuments, runDefinitions){

  const stop = await generateStop(orderDocument, shipmentType);

  let stopPostcode;

  if(shipmentType == "collection"){

    stopPostcode = orderDocument.data()['collectionPostcode'];

  }else{

    stopPostcode = orderDocument.data()['deliveryPostcode'];

  }

  assignStop(stop, stopPostcode, runDocuments, runDefinitions);

}

function assignStop(stop, stopPostcode, runDocuments, runDefinitions){

  let runName = null;

  stopPostcode = stopPostcode.replaceAll(" ", "");

  if(stopPostcode != null){

    //Ireland postcodes
    if(stopPostcode.substring(0,2) == "BT"){
      runName = "Ireland";
    }

    //outward code is 4 characters e.g DE56 1TP
    if(stopPostcode.length == 7){

      if(runDefinitions[stopPostcode.substring(0,4)] != null){

        runName = runDefinitions[stopPostcode.substring(0,4)];

      }

    }

    //outward code is 3 characters e.g DE5 3GY
    if(stopPostcode.length == 6){

      if(runDefinitions[stopPostcode.substring(0,3)] != null){

        runName = runDefinitions[stopPostcode.substring(0,3)];

      }

    }

    //outward code is 2 characters e.g E2 0AA
    if(stopPostcode.length == 5){

      if(runDefinitions[stopPostcode.substring(0,2)] != null){

        runName = runDefinitions[stopPostcode.substring(0,2)];

      }

    }

    if(stopPostcode.length <= 4 && stopPostcode.length >= 2){

      if(runDefinitions[stopPostcode] != null){
        
        runName = runDefinitions[stopPostcode];
      
      }

    }


  }

 
  //if coordinates are null but postcode was correct also assign to unassigned runs to be flagged for address validation
  if(stop.coordinates == null){
    runName = null;
  }

  //if the postcode is invalid set the coordinates to null so it can be flagged later for the address to be validated
  if(runName == null){
    stop.coordinates = null;
  }


  const run = runDocuments.find((run) => {
    return run.runName === runName;
  })

  console.log(run);

  run.stops.push(stop);

}


async function generateStop(orderDocument, shipmentType){

  const stopPostcode = getStopPostcode(orderDocument.data(), shipmentType);
  const addressString = getStopAddressString(orderDocument.data(), shipmentType);

  let coordinates = null;

  console.log(stopPostcode);

  const json = await fetchStopCoordinates(addressString);
  
  coordinates = getCoordinates(json);

  //check that the coordinates given have the same postcode as the postcode given by the customer
  const validCoordinates = validateCoordinatesForShipmentGeneration(json, stopPostcode, addressString);

  if(!validCoordinates){
    coordinates = null;
    console.log("!validCoordinates " + addressString + " status: " + json['status']);
  }

  

  const stop = {

    coordinates: coordinates,
    orderID: orderDocument.id,
    isLocked: false,
    stopType: shipmentType

  }

  return stop;

}


function validateCoordinatesForShipmentGeneration(json, stopPostcode, addressString){

  const outwardPostcode = getOutwardPostcode(stopPostcode);

  if(json['status'] != "OK"){
    // console.log("!validCoordinates " + addressString + " status: " + json['status']);
    return false;
  }

  if(json['results'].length > 1){
    return false
  }

  if(json['results'].length == 0){
    // console.log("!validCoordinates " + addressString + " status: " + json['status'] + " - No result");
    return false;
  }

  const addressComponents = json['results'][0]['address_components']

  for(let i = 0; i < addressComponents.length; i++){

    if(addressComponents[i]['types'].includes('postal_code')){

      if(addressComponents[i]['long_name'].trim().replaceAll(" ", "").startsWith(outwardPostcode)){
        return true;
      }else{
        // console.log("!validCoordinates " + addressString + " status: " + json['status'] + " - " + addressComponents[i]['long_name'].trim().replaceAll(" ", "") + outwardPostcode + " !.startWith ");
        return false;
      }

    }
  
  }

  return false;

}


async function getCoordinatesForStopsInShipment(runStructList){

  let promises = [];

  //loop through every run
  for(let i = 0; i < runStructList.length; i++){

    console.log(runStructList[i]['stops'].length);

    for(let j = 0; j < runStructList[i]['stops'].length; j++){

      promises.push(addCoordinatesToStop(runStructList[i]['stops'][j]));

    }

  }

  await Promise.all(promises);

}

async function storeShipment(runDocuments, shipmentName, deliveryWeek){

  const batch = writeBatch(db);

  let runDocRefs = [];

  for(let i = 0; i < runDocuments.length; i++){

    const runRef = doc(collection(db, 'Runs'));
    runDocRefs.push(runRef.id);
    batch.set(runRef, runDocuments[i]);

  }

  const shipmentRef = doc(collection(db, "Shipments"));
  batch.set(shipmentRef,  {

    runs: runDocRefs,
    shipmentName: shipmentName,
    shipmentWeek: deliveryWeek,

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

function generateRunDoc(runName, runDefaultProperties, deliveryWeek, shipmentName){

  if(deliveryWeek == null){
    deliveryWeek = -1;
  }

  const run = {

    settings: runDefaultProperties,
    shipmentName: shipmentName,
    assignedDriver: "",
    runName: runName,
    runWeek: deliveryWeek,
    isOptimised: false,
    stops: [],     

  }

  return run;

}

export async function fetchShipment(shipmentName){
  
  const shipmentData = await getDocuments(query(collection(db, 'Shipments'), where("shipmentName", "==", shipmentName), limit(1)));

  if(shipmentData.empty){
    console.log("shipment doesnt exist");
    
    return false;
  }

  return shipmentData.docs[0];

}

export async function selectRun(documentID){

  const runDocument = await fetchRun(documentID);
  const fuelSettings = await fetchFuelSettings();

  let runObject = parseRunInfo(runDocument, fuelSettings);

  const orders = await getRunStopsOrderData(runObject);

  if(orders === false){
    return false;
  }

  mergeStopsWithOrderData(runObject.stops, orders);
  return runObject;

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

//assigns stops to the unassigned run within the currently selected shipment
export async function assignStopsToShipment(orderIDs, stopType, selectedShipment){

  let runData;

  try{

    const shipmentData = await fetchShipment(selectedShipment);
    runData = await fetchRunsInShipment(shipmentData.data()['runs']);

  }catch(e){

    console.log(e);
    return false;

  }

  const unassignedRun = runData.find((runDocument) => {

    return runDocument.data().runName == null;

  });

  if(unassignedRun == null){

    console.log("unassignedRun == null");

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

    await batch.commit();

    logAddStopsToShipment(stopsToAdd, selectedShipment);

  }catch(e){

    console.log(e);
    return false;

  }

  return true;

}

async function addCoordinatesToStop(stop){

  const docRef = doc(db, 'Orders', stop['orderID']);
  const document = await getDocument(docRef);
  const orderData = document.data();

  const addressString = getStopAddressString(orderData, stop['stopType']);

  if(addressString === false){
    console.log("addressString === false");

    return false;

  }

  const json = await fetchStopCoordinates(addressString);

  stop['coordinates'] = getCoordinates(json);

}

function getCoordinates(json){

  console.log(json)

  //https://developers.google.com/maps/documentation/geocoding/requests-geocoding#StatusCodes
  if(json['status'] != "OK"){
    
    return null;

  }

  const geometry = json['results'][0]['geometry'];

  const coordinates = {

    lat: geometry['location']['lat'],
    lng: geometry['location']['lng'],
    accuracy: geometry['location_type'],

  }

  return coordinates;

}

function getStopPostcode(orderData, stopType){

  if(stopType == "collection"){
    return orderData['collectionPostcode'];
  }else if(stopType = "delivery"){
    return orderData['deliveryPostcode'];
  }

}

function getStopAddressString(orderData, stopType){

  let addressString = "";

  if(stopType == "collection"){
    //add collection data to stop
    addressString += orderData['collectionAddress1'];
    addressString += ",";
    addressString += orderData['collectionAddress2'];
    addressString += ",";
    addressString += orderData['collectionAddress3'];
    addressString += ",";
    addressString += orderData['collectionPostcode'];

  }else if(stopType == "delivery"){
    //add delivery data to stop
    addressString += orderData['deliveryAddress1'];
    addressString += ",";
    addressString += orderData['deliveryAddress2'];
    addressString += ",";
    addressString += orderData['deliveryAddress3'];
    addressString += ",";
    addressString += orderData['deliveryPostcode'];

  }else{

    return false;

  }

  return addressString;

}

export async function fetchStopCoordinates(addressString){

  const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + addressString + '&components=country:UK&key=' + GeocodingAPIKey;

  try {

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    return json;

  } catch (error) {
    console.error(error.message);

    return false;
  }

}

export async function fetchSuggestionPlace(address){

  const json = await fetchStopCoordinates(address);
  const coordinates = getCoordinates(json);
  const parsedAddress = parseAddress(json.results[0]['address_components']);

  return {
    address: parsedAddress,
    coordinates: coordinates
  }

}


export function parseAddress(addressComponents){

  let streetAddress = "";
  let city;
  let county;
  let postcode;

  for (let i = 0; i < addressComponents.length; i++){

      const addressComponent = addressComponents[i];

      for(let j = 0; j < addressComponents[i].types.length; j++){
          
          const addressComponentType = addressComponents[i].types[j]

  
          switch(addressComponentType){

              case "street_number":
                  streetAddress = addressComponent['long_name'] + " " + streetAddress;
                  break; 
              
              case "route":
                  streetAddress = streetAddress + " " + addressComponent['long_name'];
                  break; 

              case "premise":
                  streetAddress = streetAddress + addressComponent['long_name'];
                  break;

              case "postal_town":
                  city = addressComponent['long_name'];
                  break; 

              case "administrative_area_level_2":
                  county = addressComponent['long_name'];
                  break; 

              case "postal_code":
                  postcode = addressComponent['long_name'];
                  break; 

              default:
                  break;
          }

      }
  }

  const address = {

    streetAddress: streetAddress,
    city: city,
    county: county,
    postcode: postcode

  }

  return address;

}

export async function fetchCoordinatesForUpdatedRunSettings(runSettings){

  const startAddressString = runSettings.start.address.address1 + "," + runSettings.start.address.address2 + "," + runSettings.start.address.address3 + "," + runSettings.start.address.postcode
  const endAddressString = runSettings.end.address.address1 + "," + runSettings.end.address.address2 + "," + runSettings.end.address.address3 + "," + runSettings.end.address.postcode

  try{

    const startAddressJson = await fetchStopCoordinates(startAddressString);
    const endAddressJson = await fetchStopCoordinates(endAddressString);

    const originCoordinates = getCoordinates(startAddressJson);
    const destinationCoordinates = getCoordinates(endAddressJson);

    return {
      originCoordinates: originCoordinates,
      destinationCoordinates: destinationCoordinates
    }

  }catch(e){

    console.log(e);
    return false;
  }

}

export async function removeStopsFromShipment(stops, unassignedStopsDocumentID){

  const runRef = doc(db, 'Runs', unassignedStopsDocumentID);

  let unassignedStopsDocument;

  try{

    unassignedStopsDocument = await getDocument(runRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const currentUnassignedStops = unassignedStopsDocument.data()['stops'];

  const unassignedStopsWithStopsRemoved = currentUnassignedStops.filter((stop) => {

    const primaryKey = stop.orderID + "_" + stop.stopType;
    return !stops.includes(primaryKey);

  });

  try{

    await updateDocument(runRef, {"stops": unassignedStopsWithStopsRemoved});

    logRemoveStopsFromShipment(stops, unassignedStopsDocument.data()['shipmentName']);


  }catch(e){

    console.log(e);
    return false;

  }

  return true;

}

export function doesStopHaveCoordinates(stopsInRun, stopPrimaryKey){

  const indexOfSeparator = stopPrimaryKey.indexOf('_');
  const stopID = stopPrimaryKey.substring(0, indexOfSeparator);
  const stopType = stopPrimaryKey.slice(indexOfSeparator + 1, stopPrimaryKey.length);

  console.log(stopID);
  console.log(stopType);

  for(let i = 0; i < stopsInRun.length; i++){

    if(stopsInRun[i].orderID == stopID){

      if(stopsInRun[i].stopType == stopType){

        if(stopsInRun[i].coordinates == null){

          return stopsInRun[i];

        }

      }

    }

  }

  return false;

}

export async function assignStopsToRun(runToAddStopID, stops, runToRemoveStopID){

  const batch = writeBatch(db);
  //remove stops from unassigned run document

  const runRemovingStopRef = doc(db, 'Runs', runToRemoveStopID); 
  let runRemovingStopsDocument;

  try{

    runRemovingStopsDocument = await getDocument(runRemovingStopRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const stopsOfRunRemovingStops = runRemovingStopsDocument.data()['stops'];

  const stopsWithStopsRemoved = stopsOfRunRemovingStops.filter((stop) => {

    const primaryKey = stop.orderID + "_" + stop.stopType;
    return !stops.includes(primaryKey);

  });

  //reorder stopNumbers

  for(let i = 0; i < stopsWithStopsRemoved.length; i++){

    stopsWithStopsRemoved[i].stopNumber = i + 1;

    //**hotfix for locked stops being moved when a stop is deleted from a run */
    stopsWithStopsRemoved[i].isLocked = false;
  }


  batch.update(runRemovingStopRef, {"stops": stopsWithStopsRemoved, isOptimised: false})

  //add runs to run document
  const stopsToAdd = stopsOfRunRemovingStops.filter((stop) => {

    const primaryKey = stop.orderID + "_" + stop.stopType;
    return stops.includes(primaryKey);

  });


  const runRef = doc(db, 'Runs', runToAddStopID); 
  let runDocument;
  
  try{

    runDocument = await getDocument(runRef);

  }catch(e){

    console.log(e);
    return false;

  }

  const stopsOfRunAddingStops = runDocument.data()['stops'];

  for(let i = 0; i < stopsToAdd.length; i++){

    stopsToAdd[i].isLocked = false;
    delete stopsToAdd[i].stopTime;
    delete stopsToAdd[i].lockedStopTime;

  }

  let runAddingStopsNew;

  if(runDocument.data().runName != null){

    const startOfStops = stopsOfRunAddingStops.slice(0, 1);
    const endOfStops = stopsOfRunAddingStops.slice(1, stopsOfRunAddingStops.length);

    runAddingStopsNew = startOfStops.concat(stopsToAdd).concat(endOfStops);
    console.log(runAddingStopsNew);

    for(let i = 0; i < runAddingStopsNew.length; i++){

      runAddingStopsNew[i].stopNumber = i + 1;

    }

  }else{
    runAddingStopsNew = stopsOfRunAddingStops.concat(stopsToAdd);
  }

  batch.update(runRef, {"stops": runAddingStopsNew, isOptimised: false});





  //check if any stops are missing.

  const numberOfStopsAfter = stopsWithStopsRemoved.length + runAddingStopsNew.length;
  const numberOfStopsBefore = stopsOfRunRemovingStops.length + stopsOfRunAddingStops.length;

  if(numberOfStopsAfter != numberOfStopsBefore){
    console.log("numberOfStopsAfter != numberOfStopsBefore");
    logErrorAssigningStops(stopsWithStopsRemoved, runAddingStopsNew, stops);
    return false;
  }


  if(stopsWithStopsRemoved.length + stops.length != stopsOfRunRemovingStops.length){
    console.log("stopsWithStopsRemoved.length + stops.length != stopsOfRunRemovingStops.length");
    logErrorAssigningStops(stopsWithStopsRemoved, runAddingStopsNew, stops);
    return false;
  }


  if(runAddingStopsNew.length - stops.length != stopsOfRunAddingStops.length){
    console.log("runAddingStopsNew.length - stops.length != stopsOfRunAddingStops.length");
    logErrorAssigningStops(stopsWithStopsRemoved, runAddingStopsNew, stops);
    return false;
  }



  try{

    await batch.commit();

    const runRemovingStopsName = runRemovingStopsDocument.data()['runName'];
    const runAddingStopsName = runDocument.data()['runName'];

    logAssignedStops(runRemovingStopsName, runAddingStopsName, stopsToAdd, runAddingStopsNew, stopsOfRunAddingStops, stopsWithStopsRemoved, stopsOfRunRemovingStops);

  }catch(e){

    console.log(e);
    return false;
  }

  return true;

} 

//returns the id of the run document added to shipment or false
export async function addRunToShipment(runName, runDefaultProperties, shipmentName){

  //get shipment doc ref
  const shipmentDoc = await fetchShipment(shipmentName); 

  if(shipmentDoc === false){
    return false;
  }

  const deliveryWeek = shipmentDoc.data()['shipmentWeek'];

  console.log(shipmentDoc.id);

  try{

    const batch = writeBatch(db);

    //create run document
    const runRef = doc(collection(db, 'Runs'));
    const shipmentRef = doc(db, 'Shipments', shipmentDoc.id);

    console.log(runRef.id);

    const runDoc = generateRunDoc(runName, runDefaultProperties, deliveryWeek, shipmentName);

    batch.set(runRef, runDoc);

    batch.update(shipmentRef, {
      runs: arrayUnion(runRef.id)
    });

    await batch.commit();

    return true;

  }catch(e){
    
    console.log(e);
    return false

  }

}

export async function splitRun(runToBeSplit, ratioToBeSplitTo, shipmentName){

  const shipmentDoc = await fetchShipment(shipmentName); 

  if(shipmentDoc === false){
    return false;
  }

  let shipmentRunIDs = shipmentDoc.data().runs;

  const runDocs = getSplitRunDocuments(runToBeSplit, ratioToBeSplitTo, shipmentName);

  const batch = writeBatch(db);
  const runIDs = [];

  for(let i = 0; i < runDocs.length; i++){

    const runRef = doc(collection(db, 'Runs'));
    runIDs.push(runRef.id);
    batch.set(runRef, runDocs[i]);

  }

  //remove runToBeSplitID
  shipmentRunIDs.splice(shipmentRunIDs.indexOf(runToBeSplit.documentId), 1);

  //add the IDs of the new run documents
  shipmentRunIDs = shipmentRunIDs.concat(runIDs);

  const shipmentDocRef = doc(db, 'Shipments', shipmentDoc.id);

  batch.update(shipmentDocRef, {"runs": shipmentRunIDs});

  try{

    await batch.commit();
    return true;

  }catch(e){

    console.log(e);
    return false;

  }

}

function getSplitRunDocuments(runToBeSplit, ratioToBeSplitTo, shipmentName){

  const runs = [];

  for(let i = 0; i < ratioToBeSplitTo; i++){

    let runName = runToBeSplit.runName;

    if(i != 0){
      runName += " (" + i + ")";
    }

    runs.push(generateRunDoc(runName, runToBeSplit.settings, runToBeSplit.runWeek, shipmentName));

  }

  const stops = Object.assign([], runToBeSplit.stops);

  const chunk = stops.length / ratioToBeSplitTo

  for(let i = 0; i < ratioToBeSplitTo; i++){

    const newStops = stops.slice(i * chunk, chunk * (i + 1));

    for(let j = 0; j < newStops.length; j++){

      newStops[j].stopNumber = j + 1;
      newStops[j].isLocked = false;  
      delete newStops[j].stopData;

    }

    runs[i].stops = newStops;

  }

  return runs;

}


async function getRunStopsOrderData(runObject){

  const stops = runObject.stops;
  const orderIDs = [];

  for(let i = 0; i < stops.length; i++){
    orderIDs.push(stops[i]['orderID']);
  }

  const orders = await bulkReadTransaction(orderIDs, 'Orders');

  if(orders === false){  
    alert("error fetching stops for that run")
    return;
  }

  const ordersToCleanUp = [];

  //check if any of the document data is null. If its null the order was deleted and should be cleaned up
  for(let i = 0; i < orders.length; i++){

    if(orders[i].data() == null){
      console.log('Deleted order to cleanup');
      ordersToCleanUp.push(orders[i].id);
      orders.splice(i, 1);
    }

  } 

  if(ordersToCleanUp.length > 0){

    //TODO: If a stop i remove from the run after the shipment is loaded it will then show the incorrect number of stops in the run on the run card.

    const removedStopsFromRunSuccessfully = await removeStopsFromRun(ordersToCleanUp, runObject);

    if(!removedStopsFromRunSuccessfully){
      alert("error fetching stops for that run - error removing stop from run that has had an order deleted");
      return false;
    }
  
  }

  return orders;

}


async function removeStopsFromRun(stopsToRemove, runObject){

  try{

    const currentStops = structuredClone(runObject['stops']);
    const newStops = []

    let numberOfStopsRemoved = 0;

    for(let i = 0; i < currentStops.length; i++){

      if(!stopsToRemove.includes(currentStops[i]['orderID'])){

        currentStops[i]['stopNumber'] -= numberOfStopsRemoved;
        newStops.push(currentStops[i]);

      }else{
        numberOfStopsRemoved += 1;
      }

    }

    const updatedRunSuccessfully = await updateRun(runObject.documentId, {stops: newStops, isOptimised: false});

    if(!updatedRunSuccessfully){
      return false;
    }

    //update client
    runObject.stops = newStops;

    return true;

  }catch(e){

    console.log(e);
    return false;

  }

}


export function updateStopNumberInRun(orderID, stopType, runStops, stopNumber){

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

export async function moveStopToTop(stopToMove, currentSelectedRun){

  const stops = deepCopy(currentSelectedRun.stops);

  let indexOfStopToMove;

  for(let i = 0; i < stops.length; i++){

    if(compareStops(stops[i], stopToMove)){

      indexOfStopToMove = i;

    }

    if(stops[i].stopNumber == 1){

      stops[i].isLocked = false;

    }

    if(stops[i].stopNumber < stopToMove.stopNumber){

      stops[i].stopNumber += 1;

    }

  }

  stops[indexOfStopToMove].stopNumber = 1;

  const result = await updateStopsOrder(stops, currentSelectedRun.documentId);

  if(result === false){

    return false;
    
  }

  currentSelectedRun.stops = stops;
  currentSelectedRun.isOptimised = false;

  return true;

}

async function updateStopsOrder(stops, documentID){

  const databaseStops = removeStopDataFromStop(stops);
  
  try{

    const runRef = doc(db, 'Runs', documentID);

    const result = await updateDocument(runRef, {isOptimised: false, stops: databaseStops});

    if(result === false){
      return false;
    }

    return true;

  }catch(e){

    console.log(e);
    return false;

  }

} 

export async function moveStopToBottom(stopToMove, currentSelectedRun){

  const stops = deepCopy(currentSelectedRun.stops);

  let indexOfStopToMove;

  for(let i = 0; i < stops.length; i++){

    if(compareStops(stops[i], stopToMove)){

      indexOfStopToMove = i;

    }

    if(stops[i].stopNumber == stops.length){

      stops[i].isLocked = false;

    }

    if(stops[i].stopNumber > stopToMove.stopNumber){

      stops[i].stopNumber -= 1;

    }

  }

  stops[indexOfStopToMove].stopNumber = stops.length;

  const result = await updateStopsOrder(stops, currentSelectedRun.documentId);

  if(result === false){

    return false;
    
  }

  currentSelectedRun.stops = stops;
  currentSelectedRun.isOptimised = false;

  return true;

}

function deepCopy(object){

  const copy = JSON.parse(JSON.stringify(object));

  return copy;

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

export async function toggleStopLock(stopBeingToggleLocked, runStruct){

  //returns a copy of what the stops will look like if stored correctly. This is where isLocked value gets changed.
  const updatedStops = toggleStopLockInRun(stopBeingToggleLocked, runStruct.stops)

  const databaseStops = updatedStops.map((stop) => {

    return Object.assign({}, stop);

  });

  let databaseStopBeingToggled;
  //remove stopData field from stops before storing as this data is fetched using foreign key
  for(let i = 0; i < databaseStops.length; i++){

    delete databaseStops[i].stopData;

    //get the new value for is locked if the store is successful
    if(compareStops(databaseStops[i], stopBeingToggleLocked)){
      databaseStopBeingToggled = databaseStops[i];

    }

  }

  const result = await updateRun(runStruct.documentId, {stops: databaseStops, isOptimised: false});

  if(result){

    runStruct.stops = updatedStops;
    stopBeingToggleLocked['isLocked'] = databaseStopBeingToggled['isLocked'];

  }

  return result;

}

function toggleStopLockInRun(stopBeingToggleLocked, runStops){

  const updatedStops = [];

  for(let i = 0; i < runStops.length; i++){

    const stopCopy = Object.assign({}, runStops[i]);

    if(compareStops(stopCopy, stopBeingToggleLocked)){

      stopCopy['isLocked'] = !stopBeingToggleLocked['isLocked'];
   
    }

    updatedStops.push(stopCopy);

  }

  return updatedStops;

}


export function parseRunInfo(doc, fuelSettings){

  const runData = doc.data();

  let isTimeLocked = runData['isTimeLocked'];

  if(isTimeLocked == undefined){
    isTimeLocked = false;
  }

  const runStruct = {

    documentId: doc.id,
    assignedDriver: runData['assignedDriver'],
    stops: runData['stops'],
    runName: runData['runName'],
    runWeek: runData['runWeek'],
    runTime: runData['runTime'],
    isOptimised: runData['isOptimised'],
    isTimeLocked: isTimeLocked,
    optimisedRoute: runData['optimisedRoute'],
    settings: runData['settings'],
    shipmentName: runData['shipmentName'],
  
  }

  if(runStruct.isOptimised && fuelSettings !== false){

    runStruct.fuelCost = calculateFuelCost(runData['optimisedRoute']['metrics']['aggregatedRouteMetrics']['travelDistanceMeters'], fuelSettings);
     
  }
  
  return runStruct;

}


export async function toggleTimeLockRun(currentSelectedRun, newStops){

  const newIsTimeLocked = !currentSelectedRun.isTimeLocked;
  const runDocID = currentSelectedRun.documentId;

  if(runDocID == undefined || newIsTimeLocked == undefined){
    return false;
  }

  const fieldsToUpdate = {isTimeLocked: newIsTimeLocked, stops: newStops};

  const updatedSuccessfully = await updateRun(runDocID, fieldsToUpdate);

  if(!updatedSuccessfully){
    return false;
  }

  return true;

}


export function getToggledTimeLockedStops(currentSelectedRun){

  const newIsTimeLocked = !currentSelectedRun.isTimeLocked;

  let newStops;


  if(newIsTimeLocked){
    newStops = getTimeLockedStops(currentSelectedRun.stops);
  }else{
    newStops = getNonTimeLockedStops(currentSelectedRun.stops);
  }

  return newStops;

}


function getTimeLockedStops(stops){

  const newStops = Object.assign(stops, []);

  for(let i = 0; i < newStops.length; i++){
    
    if(newStops[i]['stopTime'] != undefined){
      newStops[i]['lockedStopTime'] = newStops[i]['stopTime'];
    }

  }

  return newStops;

}

function getNonTimeLockedStops(stops){

  const newStops = Object.assign(stops, []);
  
  for(let i = 0; i < newStops.length; i++){

    if(newStops[i]['lockedStopTime'] != undefined){
      delete newStops[i]['lockedStopTime'];
    }

  }

  return newStops;

}

export function calculateFuelCost(travelDistanceMeters, fuelSettings){

  const costPerLiterPence = fuelSettings['fuelCost']; 
  const milesPerGallon = fuelSettings['milesPerGallon'];

  //4.54609 liters in an imperial gallon
  const milesPerLiter = milesPerGallon / 4.54609;

  //1609.34 meters in a mile
  const kilometersPerLiter = milesPerLiter * 1.60934

  const kilometersTraveled = travelDistanceMeters / 1000;
  const numberOfLitersUsed = kilometersTraveled / kilometersPerLiter;

  const costOfRunPence = numberOfLitersUsed * costPerLiterPence;
  const costOfRunPounds = Number.parseFloat(costOfRunPence / 100).toFixed(2);

  return costOfRunPounds;

}

export async function fetchFuelSettings(){

  const docRef = doc(db, 'Settings', 'fuelSettings');
  const fuelSettingsDocument = await getDocument(docRef);

  return fuelSettingsDocument;

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

export async function updateRunSettings(runSettings, runDocumentID){

  const runRef = doc(db, "Runs", runDocumentID);
 
  try{

    await updateDocument(runRef, {"settings": runSettings});

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

  console.log(stops);
  console.log(orders);


  for(let i = 0; i < stops.length; i++){

    for(let j = 0; j < orders.length; j++){

      if(stops[i].orderID == orders[j].id){

        //to include in every stop type
        const stopData = {};
        const orderData = orders[j].data();

        stopData['message'] = orderData['message'] == undefined ? "" : orderData['message'];
        stopData['email'] = orderData['email'] == undefined ? "" : orderData['email'];
        stopData['animalType'] = orderData['animalType'] == undefined ? "" : orderData['animalType'];
        stopData['ID'] = orderData['ID'] == undefined ? "" : orderData['ID'];
        stopData['quantity'] = orderData['quantity'] == undefined ? "" : orderData['quantity'];
        stopData['payment'] = orderData['payment'] == undefined ? "" : orderData['payment'];
        stopData['code'] = orderData['code'] == undefined ? "" : orderData['code'];
        stopData['collectionAddress1'] = orderData['collectionAddress1'] == undefined ? "" : orderData['collectionAddress1'];
        stopData['collectionAddress2'] = orderData['collectionAddress2'] == undefined ? "" : orderData['collectionAddress2'];
        stopData['collectionAddress3'] = orderData['collectionAddress3'] == undefined ? "" : orderData['collectionAddress3'];
        stopData['collectionName'] = orderData['collectionName'] == undefined ? "" : orderData['collectionName'];
        stopData['collectionPostcode'] = orderData['collectionPostcode'] == undefined ? "" : orderData['collectionPostcode'];
        stopData['collectionPhoneNumber'] = orderData['collectionPhoneNumber'] == undefined ? "" : orderData['collectionPhoneNumber'];
        stopData['deliveryAddress1'] = orderData['deliveryAddress1'] == undefined ? "" : orderData['deliveryAddress1'];
        stopData['deliveryAddress2'] = orderData['deliveryAddress2'] == undefined ? "" : orderData['deliveryAddress2'];
        stopData['deliveryAddress3'] = orderData['deliveryAddress3'] == undefined ? "" : orderData['deliveryAddress3'];
        stopData['deliveryName'] = orderData['deliveryName'] == undefined ? "" : orderData['deliveryName'];
        stopData['deliveryPostcode'] = orderData['deliveryPostcode'] == undefined ? "" : orderData['deliveryPostcode'];
        stopData['deliveryPhoneNumber'] = orderData['deliveryPhoneNumber'] == undefined ? "" : orderData['deliveryPhoneNumber'];
        stops[i]['stopData'] = stopData;
        stops[i]['orderData'] = orderData;
    
      }

    }

  }

}


async function checkIfRunIsInSync(clientStops, documentId){

  const runDocument = await getDocument(query(doc(db, 'Runs', documentId)));

  if(runDocument.data() == undefined || runDocument.data() == null){

    calculationError = "Run is undefined or null";
    return false;

  }

  //check if run document stops are in the same state as client side stop;

  const runDocumentStops = runDocument.data()['stops'];

  if(runDocumentStops == undefined){

    calculationError = "Error checking if run is in sync";
    return false;

  }

  if(runDocumentStops.length != clientStops.length){

    calculationError = "Run is out of sync with database (different number of stops). Please reload the run";
    return false;

  }
  

  const clientStopsPrimaryKeys = [];
  const databaseStopsPrimaryKeys = [];


  for(let i = 0; i < clientStops.length; i++){

    const primaryKey = clientStops[i].orderID + "_" + clientStops[i].stopType;
    clientStopsPrimaryKeys.push(primaryKey);

  }

  for(let i = 0; i < runDocumentStops.length; i++){

    const primaryKey = runDocumentStops[i].orderID + "_" + runDocumentStops[i].stopType;
    databaseStopsPrimaryKeys.push(primaryKey);

  }

  for(let i = 0; i < databaseStopsPrimaryKeys.length; i++){

    if(!clientStopsPrimaryKeys.includes(databaseStopsPrimaryKeys[i])){

      calculationError = "Run is out of sync with database (different set of stops). Please refresh the run";
      return false;

    }

  }

  const clientStopsSet = new Set(clientStopsPrimaryKeys);

  if(clientStopsSet.size != clientStopsPrimaryKeys.length){

    calculationError = "The current stop has duplicate orders. Please correct this before calculating a run";
    return false;

  }


  return true;

}

export async function calculateRoute(run, JWT){

  const stops = run.stops;

  logInfo("Attempting to calculate route " + run.runName + " in shipment " + run.shipmentName, {
    stopIds: stops,
  });

  const originCoordinates = run.settings.start.location;
  const destinationCoordinates = run.settings.end.location;

  const runInSync = await checkIfRunIsInSync(run.stops, run.documentId);

  if(!runInSync){

    logInfo("Run " + run.runName + " in shipment " + run.shipmentName + " failed to calculate as client was out of sync with database", {
      stopIds: stops,
    });

    return false;
  }

  const runTimingsDocument = await getDocument(query(doc(db, 'Settings', 'runTimings')));

  if(runTimingsDocument === false){

    logInfo("Run" + run.runName + " in shipment " + run.shipmentName + " failed to calculate due to run timing document being unavailable", {
      stopIds: stops,
    });

    return false;
  }

  const startTime = run.settings.start.time;

  const currentDate = DateTime.now()
    .setZone("Europe/London")
    .set({ millisecond: 0 });

  const globalStartTime = currentDate
    .toUTC().set({ hour: startTime.hour, minute: startTime.minute })

  const globalEndTime = currentDate
    .plus({ hours: 48 })
    .toUTC();


  const runTimingsData = runTimingsDocument.data();
  const ETAMultiplier = parseFloat("1." + runTimingsData.ETAMultiplierPercentage.toString());

  const groupedStops = getDuplicationStopLocations(stops);

  const lockedStops = getLockedStops(stops);

  const stopJSONs = getStopRequestJSON(runTimingsData, groupedStops, lockedStops, run.isTimeLocked, globalStartTime);

  const precedenceRules = getPrecedenceRules(lockedStops, stopJSONs.length);

  const requestBody = getRouteOptimisationRequestBody(originCoordinates, destinationCoordinates, stopJSONs, precedenceRules, globalStartTime, globalEndTime);
  
  const optimisedRouteJSON = await fetchOptimisedRoute(requestBody, JWT);

  const optimisedRouteHasAllExpectedStops = checkIfOptimisedRouteHasExpectedStops(groupedStops, optimisedRouteJSON);

  if(!optimisedRouteHasAllExpectedStops){

    logInfo("Optimised route didnt have expected stops", {
      stopIds: stops,
      shipmentName: run.shipmentName,
      runName: run.runName,
      optimisedRouteJSON: optimisedRouteJSON
    });

    calculationError = "Optmised route is impossible with the given constraints, try loosening the time window or unlocking some stops";
    return false;

  }

  if(optimisedRouteJSON === false){
    calculationError = "Unknown error";
    return false;
  }


  const updatedStops = updateStopOrder(optimisedRouteJSON, groupedStops, ETAMultiplier);

  if(updatedStops === false){
    calculationError = "Unable to update stops";
    return false;
  }

  const databaseStops = removeStopDataFromStop(updatedStops);


  let runTime;

  try{

    runTime = parseInt(optimisedRouteJSON['metrics']['aggregatedRouteMetrics']['totalDuration'].replace("s", ""));

    runTime = runTime * ETAMultiplier

  }catch(e){
    
    runTime = 0;

  }


  try{ 

    const storedResult = await storeOptimisedRoute(run.documentId, optimisedRouteJSON, databaseStops, runTime);

    if(storedResult === false){
      calculationError = "Unable to store route";
      return false;
    }

    run.stops = updatedStops;
    run.isOptimised = true;
    run.runTime = runTime;
    
    logInfo("Calculated route " + run.runName + " in shipment " + run.shipmentName, {
        stopIds: stops,
        shipmentName: run.shipmentName,
        runID: run.documentId,
        optimisedRouteJSON: optimisedRouteJSON,
        requestBody: requestBody
    });

    return optimisedRouteJSON;

  }catch(e){
    console.log(e);
    return false;
  }

}

function checkIfOptimisedRouteHasExpectedStops(groupedStops, optimisedRouteJSON){

  //check if shipments labels match those given
  const nonDuplicateStops = groupedStops.nonDuplicateStops;
  const duplicateStops = groupedStops.duplicateStops;
  let visits;

  try{

    visits = optimisedRouteJSON['routes'][0]['visits'];

    if(visits === undefined){
      return false;
    }

  }catch(e){

    logInfo("Error finding number of visits in optimisedRouteJSON", {
      groupedStops: groupedStops,
      optimisedRouteJSON: optimisedRouteJSON
    });

    return false;

  }

  const shipmentLabels = Array.from(duplicateStops.keys());
  const optimisedRouteShipmentLabels = [];

  for(let i = 0; i < nonDuplicateStops.length; i++){
    
    const primaryKey = nonDuplicateStops[i]['orderID'] + "_" + nonDuplicateStops[i]['stopType'];
    shipmentLabels.push(primaryKey);

  }

  for(let i = 0; i < visits.length; i++){
    
    try{

      optimisedRouteShipmentLabels.push(visits[i]['shipmentLabel']);

    }catch(e){

      logInfo("Optimised stop missing shipmentLabel", {
        optimisedVisit: visits[i],
        optimisedRouteShipmentLabels: optimisedRouteShipmentLabels,
        clientShipmentLabels: shipmentLabels
      });

      return false;
    }

  }

  for(let i = 0; i < shipmentLabels.length; i++){
    
    if(!optimisedRouteShipmentLabels.includes(shipmentLabels[i])){
      logInfo("Stop missing in optimised route (optimisedRouteShipmentLabels -> shipmentLabel)", {
        optimisedRouteShipmentLabels: optimisedRouteShipmentLabels,
        clientShipmentLabels: shipmentLabels
      });

      return false

    }

  }


  for(let i = 0; i < optimisedRouteShipmentLabels.length; i++){
    
    if(!shipmentLabels.includes(optimisedRouteShipmentLabels[i])){
      logInfo("Stop missing in optimised route (shipmentLabel -> optimisedRouteShipmentLabels)", {
        optimisedRouteShipmentLabels: optimisedRouteShipmentLabels,
        clientShipmentLabels: shipmentLabels
      });

      return false

    }

  }

  return true;

}


function updateStopOrder(optimisedRouteJSON, groupedStops, ETAMultiplier){ 

  const nonDuplicateStops = groupedStops.nonDuplicateStops;
  const duplicateStops = groupedStops.duplicateStops;

  const optimisedStops = optimisedRouteJSON['routes'][0]['visits'];
  const optimisedTransitions = optimisedRouteJSON['routes'][0]['transitions'];

  const newStops = [];

  let stopFound = false;

  let startTimeOffset = 0;

  //find shipment label in nonduplicateStops
  for(let i = 0; i < optimisedStops.length; i++){

    stopFound = false;

    const shipmentLabel = optimisedStops[i]['shipmentLabel'];

    for(let j = 0; j < nonDuplicateStops.length; j++){

      const primaryKey = nonDuplicateStops[j].orderID + "_" + nonDuplicateStops[j].stopType;

      if(shipmentLabel == primaryKey){ 

        const additionalDriveTime = getAdditionalDriveTime(optimisedTransitions[i].travelDuration, ETAMultiplier)

        nonDuplicateStops[j].stopNumber = newStops.length + 1;
        nonDuplicateStops[j].stopTime = getStopArrivalTime(optimisedTransitions[i], startTimeOffset, additionalDriveTime);

        startTimeOffset += additionalDriveTime;
        
        newStops.push(nonDuplicateStops[j]);

        stopFound = true;

        break;
      }

    }

    if(!stopFound){

      if(duplicateStops.has(shipmentLabel)){

        const multiStops = duplicateStops.get(shipmentLabel);
        const additionalDriveTime = getAdditionalDriveTime(optimisedTransitions[i].travelDuration, ETAMultiplier);

        for(let j = 0; j < multiStops.length; j++){

          multiStops[j].stopNumber = newStops.length + 1;
          multiStops[j].stopTime = getStopArrivalTime(optimisedTransitions[i], startTimeOffset, additionalDriveTime);

          newStops.push(multiStops[j]);

        }

        startTimeOffset += additionalDriveTime;

      }else{
        
        logInfo("Run failed to calculate due to not being able to process stop after calculation", {
          shipmentLabel: shipmentLabel,
        });
        
        //error key should always be in duplicateStops
        return false;
      }

    }

  }
  
  return newStops;

}

function getAdditionalDriveTime(travelDuration, ETAMultiplier){

  const travelDurationInt = parseInt(travelDuration);

  return (travelDurationInt * ETAMultiplier) - travelDurationInt;


}

function getStopArrivalTime(optimisedStop, startTimeOffset, additionalDriveTime){

  const startTimeDate = optimisedStop.startTime;
  const durationSecondsString = optimisedStop.travelDuration;

  const durationSecondsInt = parseInt(durationSecondsString.replaceAll("s", ""));

  const startTimeString = startTimeDate.substring(startTimeDate.indexOf("T") + 1, startTimeDate.length).replaceAll(["Z"], "");
  
  const startTimeComponentsStrings = startTimeString.split(":");

  const startTimeSecondsInt = (parseInt(startTimeComponentsStrings[0]) * 60 * 60) + (parseInt(startTimeComponentsStrings[1]) * 60) + parseInt(startTimeComponentsStrings[2]) + startTimeOffset;

  //%86400 to handle case where time passes midnight
  const arrivalTimeSeconds = ((startTimeSecondsInt + durationSecondsInt) % 86400) + additionalDriveTime;

  const arrivalTimeHour = Math.floor(arrivalTimeSeconds / 3600);
  const arrivalTimeMinute = Math.floor(arrivalTimeSeconds / 60) % 60;

  const arrivalTimeHourString = arrivalTimeHour < 10 ? "0" + arrivalTimeHour : arrivalTimeHour.toString();
  const arrivalTimeMinuteString = arrivalTimeMinute < 10 ? "0" + arrivalTimeMinute : arrivalTimeMinute.toString();

  return arrivalTimeHourString + ":" + arrivalTimeMinuteString;

}

async function storeOptimisedRoute(runID, optimisedRoute, stops, runTime){

  try{

    const runRef = doc(db, 'Runs', runID);

    const result = await updateDocument(runRef, {optimisedRoute: optimisedRoute, isOptimised: true, stops:stops, runTime: runTime});
    
    if(result === false){

      return false;

    }

  }catch(e){

    console.log(e);
    return false;

  }

  return true;
}

async function fetchOptimisedRoute(requestBody, JWT){

  const url = calculateRouteEndpoint;

  try {

    const body = {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "Authorization": "Bearer " + JWT
      }
    }

    const response = await fetch(url, body);
    const jsonString = await response.json();

    const json = JSON.parse(jsonString);

    if(json['error'] != null){

      console.log(json['error']['message']);
      
      logInfo("Run failed to calculate due to error response from API", {
        APIErrorMessage: json['error']['message'],
      });
      return false;

    }

    return json;

  } catch (error) {
    console.error(error.message);

    logInfo("Run failed to calculate due to try catch error", {
      errorMessage: error.message,
    });

    return false
  }

}


function getLockedStops(stops){

  let start = {isLocked: false};
  let end = {isLocked: false};

  const numberOfStops = stops.length;
  
  for(let i = 0; i < numberOfStops; i++){

    if(stops[i].stopNumber == 1){

      if(stops[i].isLocked){

        const stopPrimaryKey = stops[i].orderID + "_" + stops[i].stopType;

        start = { 

          primaryKey: stopPrimaryKey,
          isLocked: true,
          coordinates: {

            lat: stops[i].coordinates.lat,
            lng: stops[i].coordinates.lng,
          
          } 

        }

      }

    }

    if(stops[i].stopNumber == numberOfStops){

      if(stops[i].isLocked){

        const stopPrimaryKey = stops[i].orderID + "_" + stops[i].stopType;

        end = { 

          primaryKey: stopPrimaryKey, 
          isLocked: true,
           coordinates: {

            lat: stops[i].coordinates.lat,
            lng: stops[i].coordinates.lng,

          } 
        }

      }

    }

  }

  return {start: start, end: end}

}

function getTimeWindows(stopTime, globalStartTime, timeWindow){

  const [hours, minutes] = stopTime.split(":").map(Number);


  let startTimeHour = hours - timeWindow;

  
  if(startTimeHour < 0){
    startTimeHour = 24 - startTimeHour;
  }


  let endTimeHour = hours + timeWindow;
  
  if(endTimeHour > 23){
    endTimeHour = endTimeHour & 24;
  }

  

  let minuteString = minutes.toString();

  if(minuteString.length == 1){
    minuteString = "0" + minuteString;
  }


  let startTime = startTimeHour.toString() + ":" + minuteString;
  let endTime = endTimeHour.toString() + ":" + minuteString;


  if(startTimeHour.toString().length == 1){
    startTime = "0" + startTime;
  }

  if(endTimeHour.toString().length == 1){
    endTime = "0" + endTime;
  }


  let startDateTime = ukTimeToUtcIso(startTime);
  const endDateTime = ukTimeToUtcIso(endTime);

  if(startDateTime < globalStartTime){
    console.log("Start time window is before global start time");
    startDateTime = globalStartTime;
  }

  const timeWindows = {
    "startTime": startDateTime.toISO(),
    "endTime": endDateTime.toISO()
  }


  return timeWindows;

}

//need to convert from utc to gmt or bst.
function ukTimeToUtcIso(time) {

  const currentDate = DateTime.now().setZone("Europe/London").toISODate();

  const dt = DateTime.fromISO(`${currentDate}T${time}`, {
    zone: "Europe/London"
  });

  return dt.toUTC();
}


function getStopRequestJSON(runTimings, groupedStops, lockedStops, isTimeLocked, globalStartTime){

  const nonDuplicateStops = groupedStops.nonDuplicateStops;

  const stopObjects = [];

  for(let i = 0; i < nonDuplicateStops.length; i++){

    const stopObject = 
    {
      "label": nonDuplicateStops[i].orderID + "_" + nonDuplicateStops[i].stopType,
      "deliveries": [
        {
          "arrivalLocation": {
            "latitude": nonDuplicateStops[i].coordinates.lat,
            "longitude": nonDuplicateStops[i].coordinates.lng
          },
          "duration": runTimings.stopDurationSeconds + "s"
        }
      ]
    }

    if(nonDuplicateStops[i].isLocked){

      if(nonDuplicateStops[i].stopNumber == 1){

        lockedStops.start.index = i;

      }else{

        lockedStops.end.index = i;

      }

    }

    if(isTimeLocked && nonDuplicateStops[i].lockedStopTime != undefined){
      
      const timeWindows = getTimeWindows(nonDuplicateStops[i].lockedStopTime, globalStartTime, runTimings.timeWindowHour);
      stopObject['deliveries'][0]['timeWindows'] = [timeWindows];

    }

    stopObjects.push(stopObject);
    
  }


  let duplicateStopIndex = 0;

  const duplicateStops = groupedStops.duplicateStops;

  duplicateStops.forEach((duplicateStops, key) => {

    const deliveries = [];

    //Orders in the request are grouped. It unpredictable as to which stop will be used to affect departure time. Therefore to counter this every stop at a location must have the combined
    //standard stop time and the additional stop time.
    const totalStopDuration = runTimings.stopDurationSeconds + ((duplicateStops.length - 1) * runTimings.additionalStopDurationSeconds);

    for(let j = 0; j < duplicateStops.length; j++){

      const deliveryObject = 
      {
        "arrivalLocation": {
          "latitude": duplicateStops[j].coordinates.lat,
          "longitude": duplicateStops[j].coordinates.lng
        },
        "duration": totalStopDuration + "s"
      }

      
      if(isTimeLocked && duplicateStops[j].lockedStopTime != undefined){

        const timeWindows = getTimeWindows(duplicateStops[j].lockedStopTime, globalStartTime, runTimings.timeWindowHour);
        deliveryObject['timeWindows'] = [timeWindows];

      }

      deliveries.push(deliveryObject);
      
    }

    //find if one of the stops that is a multi stop is locked
    for(let j = 0; j < duplicateStops.length; j++){

      const primaryKey = duplicateStops[j].orderID + "_" + duplicateStops[j].stopType;
         
      //if one of the stops is a multi stop update the index of the stop in the locked stops object to allow for precedence rules to be created later
      if(lockedStops.start.primaryKey == primaryKey){

        console.log("locked start stop");
        lockedStops.start.index = stopObjects.length;
   
      }

      if(lockedStops.end.primaryKey == primaryKey){

        console.log("locked end stop");
        lockedStops.end.index = stopObjects.length;

      }

    }


    const stopObject = 
      {
        "label": key,
        "deliveries": deliveries
      }

    stopObjects.push(stopObject);

    duplicateStopIndex += 1;
    
  });

  return stopObjects;

}

function getDuplicationStopLocations(stops){

  const nonDuplicateStops = [];
  const groupedDuplicatedStops = new Map();

  for(let i = 0; i < stops.length; i++){

    const isDuplicate = isDuplicateCoordinate(stops, stops[i]);

    if(isDuplicate){

      const coordinateKey = stops[i].coordinates.lat + "_" + stops[i].coordinates.lng;

      if(groupedDuplicatedStops.has(coordinateKey)){

        groupedDuplicatedStops.get(coordinateKey).push(stops[i]);

      }else{

        groupedDuplicatedStops.set(coordinateKey, [stops[i]]);

      }

    }else{

      nonDuplicateStops.push(stops[i])

    }

  }

  return {duplicateStops: groupedDuplicatedStops, nonDuplicateStops: nonDuplicateStops};

}

function isDuplicateCoordinate(stops, stop){

  for(let i = 0; i < stops.length; i++){

    if((stops[i].orderID != stop.orderID) && compareCoordinates(stops[i].coordinates, stop.coordinates)){

      return true;

    }
    
  }

  return false;

}

function compareCoordinates(a, b){

  if(a.lat !== b.lat){
    return false;
  }

  if(a.lng !== b.lng){
    return false;
  }

  return true;

}

function getPrecedenceRules(lockedStops, numberOfStops){

  let rules = []; 

  if(lockedStops.start.isLocked){

    for(let i = 0; i < numberOfStops; i++){

      if(i != lockedStops.start.index){

        const rule =  {
          "firstIsDelivery": true,
          "secondIsDelivery": true,
          "firstIndex": lockedStops.start.index,
          "secondIndex": i
        }

        rules.push(rule);

      }

    }

  }

  if(lockedStops.end.isLocked){

    //find index of all stops with same coordinates
    for(let i = 0; i < numberOfStops; i++){

      if(i != lockedStops.end.index){

        const rule =  {
          "firstIsDelivery": true,
          "secondIsDelivery": true,
          "firstIndex": i,
          "secondIndex": lockedStops.end.index
        }

        rules.push(rule);

      }

    }

  }

  return rules;

}

//https://developers.google.com/maps/documentation/route-optimization/construct-request?_gl=1*ftiy74*_up*MQ..*_ga*MTQ5NDczNjIwMi4xNzQ5NjU4OTYy*_ga_NRWSTWS78N*czE3NDk2NTg5NjIkbzEkZzEkdDE3NDk2NTkxNzckajI2JGwwJGgw
function getRouteOptimisationRequestBody(origin, destination, stops, precedenceRules, globalStartTime, globalEndTime){


  const request = 
  {
    "model": {
        "globalStartTime": globalStartTime.toISO(),
        "globalEndTime": globalEndTime.toISO(),
        "shipments": stops,
        "vehicles": [
            {
                "label": "DeliveryVan1",
                "startLocation": {
                  "latitude": origin.lat,
                  "longitude": origin.lng
                },
                "endLocation":{
                  "latitude": destination.lat,
                  "longitude": destination.lng
                },
                "costPerHour": 1000.0,
                "costPerKilometer": 1.0,
            }
        ],
        "precedenceRules": precedenceRules,
    },
    "parent": "projects/highflyersukcouriers/locations/global",
    "searchMode": "RETURN_FAST", // "RETURN_FAST", CONSUME_ALL_AVAILABLE_TIME
    "populateTransitionPolylines": true,
  }

  return request;

}

export async function fetchAutocompleteAddress(incompleteAddress, token, autocomplete){

  const request = getRequest(incompleteAddress, token);

  const { suggestions } = await autocomplete.fetchAutocompleteSuggestions(request);

  console.log(suggestions);

  return suggestions;
}




// Helper function to refresh the session token.
function getRequest(incompleteAddress, token) {

    const request = {

      input: incompleteAddress,
      includedPrimaryTypes: ["street_address", "premise", "establishment"],
      includedRegionCodes: ["uk", "ie"],
      language: "en-UK",
      sessionToken: token,

    }
    
    return request;
}

export async function updateStopAddress(address, run, stopToUpdate){

  //fetch run
  let runDocument;
  let runRef;

  try{

    runRef = doc(db, 'Runs', run.documentId);
    runDocument = await getDocument(runRef);

  }catch(e){

    console.log(e);
    return false;

  }

  //fetch order
  let orderDocument;
  let orderRef;

  try{

    orderRef = doc(db, 'Orders', stopToUpdate.orderID);
    orderDocument = await getDocument(orderRef);

  }catch(e){

    console.log(e);
    return false;
  }

  //add coordinates to stop
  stopToUpdate.coordinates = address.coordinates;
 
  //update stop in run 
  const stopToUpdatePrimaryKey = stopToUpdate.orderID + "_" + stopToUpdate.stopType

  //remove outdated stop
  const newStops = runDocument.data().stops.filter((stop) => {

    const primaryKey = stop.orderID + "_" + stop.stopType;
    return primaryKey != stopToUpdatePrimaryKey;

  });

  newStops.push(stopToUpdate);

  const databaseStops = removeStopDataFromStop(newStops);

  const batch = writeBatch(db);

  batch.update(runRef, {"stops": databaseStops, isOptimised: false});


  //update orderdata
  const newOrderDocument = updateOrderDocumentAddress(stopToUpdate.stopType, address.address, orderDocument.data());

  if(newOrderDocument === false){
    return false;
  }

  batch.set(orderRef, newOrderDocument);

  try{

    batch.commit();

  }catch{

    console.log(e);
    return false;

  }

  return true;

}


function updateOrderDocumentAddress(addressType, address, orderDocument){

  if(addressType == "collection"){

    orderDocument['collectionAddress1'] = address.streetAddress == undefined ? "" : address.streetAddress;
    orderDocument['collectionAddress2'] = address.city == undefined ? "" : address.city;
    orderDocument['collectionAddress3'] = address.county == undefined ? "" : address.county;
    orderDocument['collectionPostcode'] = address.postcode == undefined ? "" : address.postcode;

  }else if(addressType == "delivery"){

    orderDocument['deliveryAddress1'] = address.streetAddress == undefined ? "" : address.streetAddress
    orderDocument['deliveryAddress2'] = address.city == undefined ? "" : address.city
    orderDocument['deliveryAddress3'] = address.county == undefined ? "" : address.county
    orderDocument['deliveryPostcode'] = address.postcode == undefined ? "" : address.postcode;

  }else{

    return false;

  }

  return orderDocument;

}

export function convertStopNumberToLetter(stopNumber){

  const remainder = stopNumber % 26;
  const dividable = Math.floor(stopNumber / 26);

  let stopLetter = "";

  //64 is offset for ascii character A
  if(dividable > 0 && remainder != 0){
    stopLetter += String.fromCharCode(dividable + 64);
  }

  if(remainder == 0){

    if(dividable > 1){

      stopLetter += String.fromCharCode(dividable - 1 + 64);

    }

    stopLetter += "Z";
  }

  if(remainder > 0){
    stopLetter += String.fromCharCode(remainder + 64);
  }

  return stopLetter;

}

export function getPostcodesToPrint(run){

  const postcodes = getPostcodes(run.stops);

  let html;

  let boilerplateTop = '<!DOCTYPE html>'+
    '<html lang="en">'+
      '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
        '<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'+
        // '<link rel="stylesheet" href="css/PostcodesForm.css" type="text/css">'+
        ''+
      '</head>'+
        '<style>'+
        'p{font-size: x-large;}'+
        '</style>'+
        '<body>'+
          '<h1>' + run.runName + '</h1><br>'+
          '<div class="postcodesWrapper">';
         
        

  let boilerplateBottom = '</div></body>'+  
  '</html>';

  
  html = boilerplateTop;

  for(const postcode of postcodes){

    html += '<p>' + postcode + '</p>';

  }

  html = html + boilerplateBottom;

  return html;
  
}  


function getPostcodes(stops){

  //currently doesnt resort stops. Im assuming stops are stored in run order

  const postcodes = [];

  for(let i = 0; i < stops.length; i++){

    const stopType = stops[i].stopType;

    if(stopType == "collection"){

      postcodes.push(getFullPostcode(stops[i].stopData.collectionPostcode));

    }else{

      postcodes.push(getFullPostcode(stops[i].stopData.deliveryPostcode));

    }

  }

  return postcodes;

}

function getFullPostcode(postcode){

  const trimmedPostcode = postcode.replaceAll(" ", "");

  if(trimmedPostcode.length == 5){

    return trimmedPostcode.substring(0,2) + " " + trimmedPostcode.substring(2);

  }
  
  if(trimmedPostcode.length == 6){

    return trimmedPostcode.substring(0,3) + " " + trimmedPostcode.substring(3);

  }
  
  if(trimmedPostcode.length == 7){

    return trimmedPostcode.substring(0,4) + " " + trimmedPostcode.substring(4);

  }

  return trimmedPostcode;

}

function getOutwardPostcode(postcode){
  
  const trimmedPostcode = postcode.replaceAll(" ", "");

  if(trimmedPostcode.length == 5){

    return trimmedPostcode.substring(0,2);

  }

  
  if(trimmedPostcode.length == 6){

    return trimmedPostcode.substring(0,3);

  }

  
  if(trimmedPostcode.length == 7){

    return trimmedPostcode.substring(0,4);

  }

  return postcode;

}

export function convertSecondsToHoursAndMinutes(secondsString){

  if(secondsString == null || secondsString == undefined || isNaN(secondsString)){
    return "0:0";
  }

  let seconds = secondsString;

  if(isNaN(secondsString)){
    seconds = parseInt(secondsString.replace("s", ""));
  }

  const totalMinutes = Math.floor(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);

  let remainingMinutes = totalMinutes % 60;

  if(remainingMinutes < 10){

    remainingMinutes = "0" + remainingMinutes;

  }

  return hours + ":" + remainingMinutes;
}


export async function fetchStaffMembers(){
  
  try{

    const q = query(collection(db, 'Staff'));
    const driverDocuments = await getDocuments(q);

    return driverDocuments;

  }catch(e){

    console.log(e);
    return false;
  }
}


export async function fetchDrivers(){
  
  try{

    const q = query(collection(db, 'Drivers'));
    const driverDocuments = await getDocuments(q);

    return driverDocuments;

  }catch(e){

    console.log(e);
    return false;
  }
}


export function parseStaffDocuments(staffDocuments){

  const docs = staffDocuments.docs;

  if(docs.length == 0){
    return false;
  }

  const staffMembers = [];

 

  for(let i = 0; i < docs.length; i++){

    const doc = docs[i].data();
    const assignedRuns = [];

    for(let j = 0; j < doc.assignedRuns.length; j++){
      
      assignedRuns.push(doc.assignedRuns[j].runID);

    }

    const staff = {
      staffID: docs[i].id,
      staffName: doc.staffName,
      assignedRuns: assignedRuns
    }

    staffMembers.push(staff);

  }

  return staffMembers;

}

export async function unassignStaffMember(staffMemberID, runID){

  try{

    const staffDocRef = doc(db, 'Staff', staffMemberID);
    const staffDocument = await getDocument(staffDocRef);

    const staffData = staffDocument.data();

    if(staffData == null){
      return false;
    }

    const assignedRuns = staffData.assignedRuns;

    for(let i = 0; i < assignedRuns.length; i++){

      if(assignedRuns[i].runID == runID){
        console.log(i);
        assignedRuns.splice(i, 1);
        break;
      }

    }

    console.log(assignedRuns);

    const updatedSuccessfully = await updateDocument(staffDocRef, {"assignedRuns": assignedRuns});

    if(updatedSuccessfully == false){
      return false;
    }

    return true;

  }catch(e){

    console.log(e);
    return false;

  }

  

}

export async function assignStaffMember(staffID, runID, shipmentName){

  try{
    const staffDocRef = doc(db, 'Staff', staffID);
    const runDocRef = doc(db, 'Runs', runID);

    const staffDocument = await getDocument(staffDocRef);
    const runDocument = await getDocument(runDocRef);

    const runData = runDocument.data();

    if(runData == null){
      return false;
    }

    const staffData = staffDocument.data();

    if(staffData == null){
      return false;
    }

    const assignedRuns = staffData.assignedRuns;

    const staffRun = {
      runID: runDocument.id,
      shipmentName: shipmentName
    }

    assignedRuns.push(staffRun);

    const updatedSuccessfully = await updateDocument(staffDocRef, {"assignedRuns": assignedRuns});

    if(updatedSuccessfully == false){
      return false;
    }

    return true;

  }catch(e){

    console.log(e);
    return false;

  }


}

export function getCurrentAssignedStaffMember(staffMembers, runID){

  const currentAssignStaffID = getCurrentAssignedStaffMemberID(staffMembers, runID);

  if(currentAssignStaffID == false){
    return "unassigned";
  }

  for(let i = 0; i < staffMembers.length; i++){

    if(staffMembers[i].staffID == currentAssignStaffID){
      return currentAssignStaffID[i].staffName;
    }

  }

  return "unassigned";
  

}

export function getCurrentAssignedStaffMemberID(staffMembers, runID){

  for(let i = 0; i < staffMembers.length; i++){
    if(staffMembers[i].assignedRuns.includes(runID)){
      return staffMembers[i].staffID;
    }
  }

  return false;

}


export function parseDriverDocuments(driverDocuments){

  const docs = driverDocuments.docs;

  if(docs.length == 0){
    return false;
  }

  const drivers = [];

  for(let i = 0; i < docs.length; i++){

    const assignedRuns = [];
    const doc = docs[i].data()

    for(let j = 0; j < doc.assignedRuns.length; j++){
      
      assignedRuns.push(doc.assignedRuns[j].runID);

    }

    const driver = {
      driverID: docs[i].id,
      driverName: doc.driverName,
      assignedRuns: assignedRuns
    }

    drivers.push(driver);

  }

  return drivers;

}

export async function unassignDriver(driverDocID, runID){

  try{

    const driverDocRef = doc(db, 'Drivers', driverDocID);
    const driverDocument = await getDocument(driverDocRef);

    const driverData = driverDocument.data();

    if(driverData == null){
      return false;
    }

    const assignedRuns = driverData.assignedRuns;

    for(let i = 0; i < assignedRuns.length; i++){

      if(assignedRuns[i].runID == runID){
        console.log(i);
        assignedRuns.splice(i, 1);
        break;
      }

    }

    console.log(assignedRuns);

    const updatedSuccessfully = await updateDocument(driverDocRef, {"assignedRuns": assignedRuns});

    if(updatedSuccessfully == false){
      return false;
    }

    return true;

  }catch(e){

    console.log(e);
    return false;

  }

}


export async function assignDriver(driverDocID, runID, shipmentName){

  try{
    const driverDocRef = doc(db, 'Drivers', driverDocID);
    const runDocRef = doc(db, 'Runs', runID);

    const driverDocument = await getDocument(driverDocRef);
    const runDocument = await getDocument(runDocRef);

    const runData = runDocument.data();

    if(runData == null){
      return false;
    }

    const driverData = driverDocument.data();

    if(driverData == null){
      return false;
    }

    const assignedRuns = driverData.assignedRuns;

    const driverRun = {
      runID: runDocument.id,
      shipmentName: shipmentName
    }

    assignedRuns.push(driverRun);

    const updatedSuccessfully = await updateDocument(driverDocRef, {"assignedRuns": assignedRuns});

    if(updatedSuccessfully == false){
      return false;
    }

    return true;

  }catch(e){

    console.log(e);
    return false;

  }

}

export function getCurrentAssignedDriver(drivers, runID){

  for(let i = 0; i < drivers.length; i++){

    if(drivers[i].assignedRuns.includes(runID)){
      console.log(drivers[i].assignedRuns);
      return drivers[i].driverID;
    }

  }

  return false;

}

export function getCurrentAssignedDriverName(drivers, runID){

  const assignedDriverID = getCurrentAssignedDriver(drivers, runID);
  
  console.log(assignedDriverID);

  for(let i = 0; i < drivers.length; i++){

    if(drivers[i].driverID == assignedDriverID){
      return drivers[i].driverName;
    }

  }

  return "unassigned";

}

export async function getCustomerAccounts(){

  if(customerAccounts != null){
    return customerAccounts;
  }

  const documents = await getDocuments(query(collection(db, 'Users'), where("role", "==", "customer")));

  if(documents == false){

    return false;

  }

  //parse customer account docs in map of ids and names

  const customerAccountMap = new Map();

  for(let i = 0; i < documents.docs.length; i++){

    const username = documents.docs[i].data()['username'];

    if(username != undefined){
      customerAccountMap.set(documents.docs[i].id, documents.docs[i].data()['username'].replaceAll("@placeholder.com", ""));
    }else{
      customerAccountMap.set(documents.docs[i].id, "unknown account");
    }

  }

  customerAccounts = customerAccountMap;

}