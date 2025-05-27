import { db, getDocuments, getDocument, bulkReadTransaction, filterSearch } from "/js/Firebase.js";
import { query, collection, where, limit, orderBy, doc, addDoc, writeBatch } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"
import { createAddStopButton, createStopCard, createUnassignedOrdersTableCard, createUnassignedOrdersButton, createTableOrderCard, createRunCard } from "/js/ShipmentsLogisticsManager/Components.js"

const numberOfUnassignedOrders = document.getElementById('number_of_unassigned_orders');
const unassignedOrdersContainer = document.getElementById('unassigned_orders_details');
const unassignedOrdersCardWrapper = document.getElementById('unassigned_orders_card_wrapper');
const unassignedOrderTable = document.getElementById('unassigned_order_table');
const unassignedOrderTableBody = document.getElementById('unassigned_orders_table_body');

const addStopButtonWrapper = document.getElementById('add_stop_button_wrapper');

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


const selectedRunView = document.getElementById('selected_run_view');
const runStopsContainer = document.getElementById('run_stops_container');
const addRunDetailsContainer = document.getElementById('add_run_details');

const searchButton = document.getElementById('search_button');
const addOrderTable = document.getElementById('table_body');
const addOrderSearchInput = document.getElementById('add_order_search_input');
const addOrderSearchFilter = document.getElementById('add_order_search_filter');


let currentSelectedRun = null;
let map;

let runStructList = [];


// initMap();
addEventListeners();
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
    
    const runCard = createRunCard(runStruct);

    runStruct.runCard = runCard;
    
    runCard.addEventListener('click', async () => {

      const orders = await getRunStops(runStruct.stops);
      mergeStopsWithOrderData(runStruct.stops, orders);
      updateStopList(runStruct.stops);
      showRuns();

      selectCard(runCard);

    });

  }else{

    const unassignedOrdersButton = createUnassignedOrdersButton(runStruct);

    unassignedOrdersButton.addEventListener('click', async () => {

        selectCard(unassignedOrdersButton);
        const orders = await getRunStops(runStruct.stops);

        console.log(orders);
        mergeStopsWithOrderData(runStruct.stops, orders);
        console.log(runStruct.stops);
        for(let i = 0; i < runStruct.stops.length; i++){

            unassignedOrderTable.appendChild(createUnassignedOrdersTableCard(runStruct.stops[i]));

        }
        // mergeStopsWithOrderData(runStruct.stops, orders);
        showUnassignedOrdersTable();

    });

    runStruct.runCard = unassignedOrdersButton;

  }

  runStructList.push(runStruct);

}

function init(){

  updateSelectShipment();
  getOrders(query(collection(db, 'Orders'), orderBy('ID', 'desc'), limit(20)));

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

      selectedRunView.classList.add('hidden');
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

  if(searchButton != null){

    searchButton.addEventListener('click', () => {
    
      if(addOrderSearchInput.value == ""){

        alert("enter a search value to fitler orders by");

      }

      if(addOrderSearchFilter.value == ""){

        alert("enter a field to filter orders by");

      }

      getOrders(filterSearch(addOrderSearchFilter.value, addOrderSearchInput.value));

    });

  } 

}


function showRuns(){

  showUI(runStopsContainer);
  showUI(selectedRunView);
  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

}

function showAddOrderTable(){

  showUI(addRunDetailsContainer);
  showUI(selectedRunView);
  hideUI(runStopsContainer);
  hideUI(unassignedOrdersContainer);

  selectedRunView.classList.remove('fit-content');

}


function showUnassignedOrdersTable(){

  hideUI(addRunDetailsContainer);
  hideUI(selectedRunView);
  hideUI(runStopsContainer);
  showUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

}

function showUI(element){

  element.classList.remove('hidden');

}

function hideUI(element){

  element.classList.add('hidden');

} 


function hideSelectUI(element){

  selectedShipment.value = "SELECT_SHIPMENT";
  hideUI(element);

}

function selectCard(runCard){

  if(currentSelectedRun != null){
    currentSelectedRun.classList.remove('selectedRunCard');
  }

  runCard.classList.add('selectedRunCard');

  currentSelectedRun = runCard;

}


async function updateSelectShipment(shipmentName){

  selectedShipment.innerHTML = "";

  const selectShipmentOption = document.createElement('option');
  selectShipmentOption.value = "SELECT_SHIPMENT";
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

      addOrderToRun(runName, orderData[i], shipmentTypeInput.value);

    }

  }

  console.log(runStructList);

}


function addOrderToRun(runName, orderData, stopType){

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

    run.stops.push(
    {
      orderID: orderData.id,
      stopType: stopType //collection or delivery
    });
      
    runStructList.push(run);

    return;
  }

  run.stops.push(
  {
    orderID: orderData.id,
    stopType: stopType //collection or delivery
  });

}


function clearShipmentUI(){

  runCardList.innerHTML = "";
  unassignedOrderTableBody.innerHTML = "";
  unassignedOrdersCardWrapper.innerHTML = "";
  addStopButtonWrapper.innerHTML = "";

  hideUI(runStopsContainer);
  hideUI(selectedRunView);
  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

}

async function updateRunsList(shipmentName){

  clearShipmentUI();

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
      // updateUnnassignedOrders(runStructList[i]);
      unassignedOrdersCardWrapper.appendChild(runStructList[i].runCard);
    }

  }

  //add add stop button
  const addStopButton = createAddStopButton();

  addStopButton.addEventListener('click', () => {

    console.log(shipmentName);
    showAddOrderTable();

  });

  addStopButtonWrapper.appendChild(addStopButton);

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


async function getRunStops(stops){

  console.log(stops);
  //fetch order data

  const orderIDs = [];

  for(let i = 0; i < stops.length; i++){

    orderIDs.push(stops[i]['orderID']);

  }

  const orders = await bulkReadTransaction(orderIDs, 'Orders');
  console.log(orders);

  if(orders === false){

    alert("error fetching stops for that run")
    return;
  }

  return orders;

}


function updateStopList(stops){

  console.log(stops);

  runStopsContainer.innerHTML = "";

  for(let i = 0; i < stops.length; i++){

    runStopsContainer.appendChild(createStopCard(stops[i]['stopData'], i + 1));

  }

}


function mergeStopsWithOrderData(stops, orders){

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


async function getOrders(query){

  //fetch orders
  const orderData = await getDocuments(query);
  addOrderTable.innerHTML = "";

  if(orderData.empty){
    console.log("no orders to show");

    return;
  }

  console.log(orderData);

  //clear table 


  for(let i = 0; i < orderData.docs.length; i++){

    addOrderTable.appendChild(createTableOrderCard(orderData.docs[i].data()));

  }

  //create table order card

}









