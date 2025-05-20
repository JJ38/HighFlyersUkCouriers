import { db, getDocuments, getDocument } from "/js/Firebase.js";
import { query, collection, where, limit, orderBy, doc, addDoc, writeBatch } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"

const liveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const shipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");
const unassignedOrdersButton = document.getElementById("unassignedOrdersCard");
const numberOfUnassignedOrders = document.getElementById('number_of_unassigned_orders');

const createShipmentWidget = document.getElementById("create_shipment_widget");
const shipmentDeliveryWeekInput = document.getElementById('shipment_delivery_week');
const shipmentTypeInput = document.getElementById('shipment_run_type');
const shipmentNameInput = document.getElementById('shipment_name');
const cancelCreateShipmentButton = document.getElementById("cancel_create_shipment");
const saveCreateShipmentButton = document.getElementById("save_create_shipment");

const deleteShipmentWidget = document.getElementById("delete_shipment_widget");
const cancelDeleteShipmentButton = document.getElementById("cancel_delete_shipment");
const confirmDeleteShipmentButton = document.getElementById("confirm_delete_shipment");
const selectDeleteShipment = document.getElementById('select_delete_shipment');

const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('select_shipment');


let currentSelectedRun = null;
let map;

let runStructList = [];


// initMap();
addEventListeners();
addEventListener(unassignedOrdersButton);
init();


const sortAlphabetically = (a, b) => {

  if(a.runName < b.runName){
    return -1;
  }

  else if(a.runName > b.runName){
    return 1;
  }

  return 0;

}

const fetchRun = async (documentID) => {

  const runData = await getDocument(query(doc(db, 'Runs', documentID)));
  const runStruct = parseRunInfo(runData.data());

  if(runStruct.runName != null){
    createRunCard(runStruct);
    addEventListener(runStruct.runCard);
  }

  runStructList.push(runStruct);

}

function init(){

  updateSelectShipment();

}


function addEventListeners(){

  if(selectedShipment != null){

    selectedShipment.addEventListener('input', () => {
  
      if(selectedShipment.value == "CREATE_SHIPMENT"){

        showUI(createShipmentWidget);
        return;
      }

      if(selectedShipment.value == "DELETE_SHIPMENT"){

        generateDeleteWidget();
        showUI(deleteShipmentWidget);
        return;
      }

      updateRunsList(selectedShipment.value);

    });

  }

  if(cancelCreateShipmentButton != null){

    cancelCreateShipmentButton.addEventListener('click', () => {

        hideSelectUI(createShipmentWidget);

    });

  }

  if(saveCreateShipmentButton != null){

    saveCreateShipmentButton.addEventListener('click', async () => {

      if(shipmentNameInput.value == "default"){
        alert('"default" is an invalid name for a shipment. Please choose a different name')
        return;
      }

      const generateShipmentResult = await generateShipment();

      if(!generateShipmentResult){

        showNotification("Error!", "Error creating shipment");
        
      }

      updateSelectShipment(shipmentNameInput.value);
      updateRunsList(shipmentNameInput.value);
      showNotification("Success!", "Successfully created shipment");
      hideSelectUI(createShipmentWidget);

    });

  }

  if(cancelDeleteShipmentButton != null){

    cancelDeleteShipmentButton.addEventListener('click', () => {

      hideSelectUI(deleteShipmentWidget);

    });

  }

  
  if(confirmDeleteShipmentButton != null){

    confirmDeleteShipmentButton.addEventListener('click', async () => {

      if(selectDeleteShipment.value != "default"){

        const deleteShipmentDocumentResult = deleteShipmentDocument(selectDeleteShipment.value);
        
        if(!deleteShipmentDocumentResult){
          alert("error deleting shipment");
        }
        
        updateSelectShipment();
        updateRunsList();
        showNotification("Success!", "Successfully deleted shipment");
        hideSelectUI(deleteShipmentWidget);

      }else{
        alert("Please select a shipment to delete");
      }

    });

  }

}


function showUI(element){

  element.classList.remove('hidden');

}


function hideSelectUI(element){

  selectedShipment.value = "";
  element.classList.add('hidden');

}


async function updateSelectShipment(shipmentName){

  selectedShipment.innerHTML = "";

  const selectShipmentOption = document.createElement('option');
  selectShipmentOption.value = "";
  selectShipmentOption.innerText = "-- select a shipment --";
  selectedShipment.appendChild(selectShipmentOption);

  const shipments = await getDocuments(query(collection(db, 'Shipments')));

  for(let i = 0; i < shipments.docs.length; i++){

    //add option to select element
    const shipmentOption = document.createElement('option');
    shipmentOption.value = shipments.docs[i].data()['shipmentName'];
    shipmentOption.innerText = shipments.docs[i].data()['shipmentName'];
    if(shipmentName == shipments.docs[i].data()['shipmentName']){
      shipmentOption.selected = true;
    }

    selectedShipment.appendChild(shipmentOption);

  }

  const createShipmentOption = document.createElement('option');
  createShipmentOption.value = "CREATE_SHIPMENT";
  createShipmentOption.innerText = "-- create a shipment --";
  selectedShipment.appendChild(createShipmentOption);

  const deleteShipmentOption = document.createElement('option');
  deleteShipmentOption.value = "DELETE_SHIPMENT";
  deleteShipmentOption.innerText = "-- delete a shipment --";
  selectedShipment.appendChild(deleteShipmentOption);

}


async function generateDeleteWidget(){

  const docRef = query(collection(db, "Shipments"));
  const shipments = await getDocuments(docRef);

  selectDeleteShipment.innerHTML = "";

  for(let i = 0; i < shipments.docs.length; i++){

    const shipmentName = shipments.docs[i].data()['shipmentName'];
    const option = document.createElement('option');
    option.value = shipments.docs[i].id;
    option.text = shipmentName;

    selectDeleteShipment.appendChild(option);

  }

}


async function deleteShipmentDocument(id){

  //fetch shipment document
  const shipmentRef = doc(db, 'Shipments', id);
  let shipmentDocument;

  try{

    shipmentDocument = await getDocument(shipmentRef);
    
  }catch(e){

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


async function generateShipment(){

  //fetch postcode run definitions
  const docRef = doc(db, 'Settings', 'runDefinitions');
  const runDefinitions = await getDocument(docRef);

  //get runs by delivery week
  const q = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("deliveryWeek", "==", parseInt(shipmentDeliveryWeekInput.value)));
  const orderData = await getDocuments(q);
  console.log(orderData.docs);

  //organise orders into defined runs based on runtype and postcode
  generateRuns(runDefinitions.data(), orderData.docs);

  const storeShipmentResult = await storeShipment();
  return storeShipmentResult;

}


function generateRuns(runDefinitions, orderData){

  runStructList = [];

  const runType = shipmentTypeInput.value == 'collection' ? 'collectionPostcode' : 'deliveryPostcode';

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

      addOrderToRun(runName, orderData[i]);

    }

  }

  console.log(runStructList);

}


function addOrderToRun(runName, orderData){

  //does run exist in run list
  let run = runStructList.find((run) => {
    return run.runName === runName;
  })

  if(run == null){

    run = {

      assignedDriver: "",
      fuelCost: "",
      runName: runName,
      runWeek: parseInt(shipmentDeliveryWeekInput.value),
      stops: [],
      orderedStops: [],
      lockedStops: [],

    }

    run.stops.push(orderData.id);
    runStructList.push(run);

    return;
  }

  run.stops.push(orderData.id);

}


async function updateRunsList(shipmentName){

  runCardList.innerHTML = "";
  if(shipmentName == null){

    unassignedOrdersButton.classList.add('hidden');
    return;

  }


  runStructList = [];

  await fetchShipment(shipmentName);

  runStructList.sort(sortAlphabetically);

  if(runStructList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runStructList.length; i++){

    if(runStructList[i].runName != null){

      runCardList.appendChild(runStructList[i].runCard);

    }else{
      //manage unassigned runs
      updateUnnassignedOrders(runStructList[i]);

    }

  }

}


function updateUnnassignedOrders(unassignedOrders){

  if(unassignedOrders.stops.length == 0){

    unassignedOrdersButton.classList.add('hidden');
    return;

  }

  //show unassigned runs card
  unassignedOrdersButton.classList.remove('hidden');
  //update unassigned runs number
  numberOfUnassignedOrders.innerText = "#" + unassignedOrders.stops.length;
 

  for(let i = 0; i < unassignedOrders.stops.length; i++){

    // console.log(unassignedOrders.stops[i]);

  }

}


async function storeShipment(){

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
    shipmentName: shipmentNameInput.value

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


async function fetchShipment(selectedShipment){

  const shipmentData = await getDocuments(query(collection(db, 'Shipments'), where("shipmentName", "==", selectedShipment), limit(1)));

  if(shipmentData.empty){
    console.log("shipment doesnt exist");
    return;
  }

  const shipmentRunsDocumentIDs = shipmentData.docs[0].data()['runs'];
  const numberOfRuns = shipmentRunsDocumentIDs.length;

  let promises = [];

  for(let i = 0; i < numberOfRuns; i++){

    promises.push(fetchRun(shipmentRunsDocumentIDs[i]));

  } 
  
  await Promise.all(promises);

}


function parseRunInfo(runData){
  
  const runStruct = {

    assignedDriver: runData['assignedDriver'],
    fuelCost: runData['fuelCost'],
    stops: runData['stops'],
    runName: runData['runName'],
    runWeek: runData['runWeek'],
 
  }

  return runStruct;

}

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

function addEventListener(runCard){

  if(runCard != null){

    runCard.addEventListener('click', () => {

      console.log("clicked");
      
      if(currentSelectedRun != null){
        currentSelectedRun.classList.remove('selectedRunCard');
      }
    
      runCard.classList.add('selectedRunCard');
    
      currentSelectedRun = runCard;
    
    });
    
  }
}

function createRunCard(runStruct){

  const runCard = document.createElement('div');
  runCard.classList = "runCard";

  const runName = document.createElement('p');
  runName.classList = "runName";
  runName.innerText = runStruct.runName;

  const runIconsWrapper = document.createElement('div');
  runIconsWrapper.classList = "row runInfoWrapper";
  


  const runWeekWrapper = document.createElement('div');
  runWeekWrapper.classList = "row";

  const calendarIcon = document.createElement('span');
  calendarIcon.classList = "material-symbols-rounded runInfoIcon";
  calendarIcon.innerText = "calendar_month";

  const weekNumber = document.createElement('p');
  weekNumber.innerText = runStruct.runWeek;

  runWeekWrapper.appendChild(calendarIcon);
  runWeekWrapper.appendChild(weekNumber);



  const totalStopsWrapper = document.createElement('div');
  totalStopsWrapper.classList = "row";

  const totalStopsIcon = document.createElement('span');
  totalStopsIcon.innerText = "location_on";
  totalStopsIcon.classList = "material-symbols-rounded runInfoIcon";

  const totalStops = document.createElement('p');
  totalStops.innerText = runStruct.stops.length;

  totalStopsWrapper.appendChild(totalStopsIcon);
  totalStopsWrapper.appendChild(totalStops);



  const fuelCostWrapper = document.createElement('div');
  fuelCostWrapper.classList = "row";

  const fuelCostIcon = document.createElement('span');
  fuelCostIcon.classList = "material-symbols-rounded runInfoIcon";
  fuelCostIcon.innerText = "local_gas_station";

  const fuelCost = document.createElement('p');
  fuelCost.innerText = "£" + runStruct.fuelCost;

  fuelCostWrapper.appendChild(fuelCostIcon);
  fuelCostWrapper.appendChild(fuelCost);



  runIconsWrapper.appendChild(runWeekWrapper);
  runIconsWrapper.appendChild(totalStopsWrapper);
  runIconsWrapper.appendChild(fuelCostWrapper);



  const driverInfoWrapper = document.createElement('div');
  driverInfoWrapper.classList = "row runInfoWrapper";

  const assignedDriverTitle = document.createElement('p');
  assignedDriverTitle.classList = "runInfoTitle";
  assignedDriverTitle.innerText = "AssignedDriver: ";

  const assignedDriver = document.createElement('p');
  assignedDriver.classList = "runInfo";
  assignedDriver.innerText = runStruct.assignedDriver;

  driverInfoWrapper.appendChild(assignedDriverTitle);
  driverInfoWrapper.appendChild(assignedDriver);



  runCard.appendChild(runName);
  runCard.appendChild(runIconsWrapper);
  runCard.appendChild(driverInfoWrapper);
  
  runStruct.runCard = runCard;

}

