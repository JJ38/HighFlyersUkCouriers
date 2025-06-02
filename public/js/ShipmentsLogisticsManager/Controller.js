import { db, getDocuments, getDocument, updateDocument, bulkReadTransaction, filterSearch } from "/js/Firebase.js";
import { query, collection, where, limit, orderBy, doc, writeBatch } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"
import { createOption, createAddStopButton, createStopCard, createUnassignedOrdersTableCard, createUnassignedOrdersButton, createTableOrderCard, createRunCard } from "/js/ShipmentsLogisticsManager/Components.js"
import { createOpenLockIcon, createLockIcon, createDragDetectionZone, createStopNumber, createStopLockButton, createStopMetaData } from "./Components";


const unassignedOrdersContainer = document.getElementById('unassigned_orders_details');
const unassignedOrdersCardWrapper = document.getElementById('unassigned_orders_card_wrapper');
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

const assignStopsWidget = document.getElementById('assign_stops_widget');
const selectAssignStopsRun = document.getElementById('select_assign_stops_run');
const cancelAssignStopsWidgetButton = document.getElementById('cancel_assign_stops_button');
const assignStopsWidgetButton = document.getElementById('assign_stops_widget_button');

const addStopsWidget = document.getElementById('add_stops_widget');
const selectAddStopsRun = document.getElementById('select_add_stops_run');
const cancelAddStopsWidgetButton = document.getElementById('cancel_add_stops_button');
const addStopsWidgetButton = document.getElementById('add_stops_widget_button');

const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('select_shipment');


const selectedRunView = document.getElementById('selected_run_view');
const runStopsContainer = document.getElementById('run_stops_container');
const addRunDetailsContainer = document.getElementById('add_run_details');
const runInfoWrapper = document.getElementById('run_info_wrapper');

const searchButton = document.getElementById('search_button');
const addOrderTable = document.getElementById('table_body');
const addOrderSearchInput = document.getElementById('add_order_search_input');
const addOrderSearchFilter = document.getElementById('add_order_search_filter');
const assignStopButton = document.getElementById('assign_stop_button');
const addStopButton = document.getElementById('add_stop_button');

const stopCardLongClickTime = 1000;

let currentShipmentUnassignedOrders;
let currentSelectedRunCard = null;
let currentSelectedRun = null;

let currentlyStopMetaData = null;
let currentlyStopLockButton = null;

let lastMouseDown = 0;
let lastMouseUp = 0;
let mouseDown = false;

let isCardBeingDragged = false;
let cardBeingDragged;
let mouseMoveCallback;

let mimicCard;
let dragZones = [];

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


function parseRunData(runData){

  const runStruct = parseRunInfo(runData);

  if(runStruct.runName != null){
    
    const runCard = createRunCard(runStruct);

    runStruct.runCard = runCard;
    
    runCard.addEventListener('click', async () => {

      //fetch run to make sure client is showing the correct state and order of stops.
      const runDocument = await fetchRun(runStruct.documentId);
      const runObject = parseRunInfo(runDocument);

      console.log(runObject);

      const orders = await getRunStopsOrderData(runObject.stops);
      mergeStopsWithOrderData(runObject.stops, orders);
      updateStopList(runObject);
      showRuns();

      selectCard(runCard);

    });

  }else{

    const unassignedOrdersButton = createUnassignedOrdersButton(runStruct);

    unassignedOrdersButton.addEventListener('click', async () => {

        selectCard(unassignedOrdersButton);
        const orders = await getRunStopsOrderData(runStruct.stops);
        mergeStopsWithOrderData(runStruct.stops, orders);

        unassignedOrderTableBody.innerHTML = "";

        for(let i = 0; i < runStruct.stops.length; i++){

            unassignedOrderTableBody.appendChild(createUnassignedOrdersTableCard(runStruct.stops[i]));

        }
        // mergeStopsWithOrderData(runStruct.stops, orders);
        showUnassignedOrdersTable();

    });

    runStruct.runCard = unassignedOrdersButton;

    //set unassigned stops doc id for current shipment
    currentShipmentUnassignedOrders = runStruct.documentId;
  }

  runStructList.push(runStruct);

}

function init(){

  updateSelectShipment();
  getOrders(query(collection(db, 'Orders'), orderBy('ID', 'desc'), limit(20)));

}


function addEventListeners(){

  window.addEventListener('mousedown', () => {

    mouseDown = true;
    lastMouseDown = Date.now();

  });

  window.addEventListener('mouseup', () => {

    mouseDown = false;
    lastMouseUp = Date.now();

    if(isCardBeingDragged){

      dropStopCard();

    }

  });


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
  
  if(assignStopButton != null){

    assignStopButton.addEventListener('click', async () => {

      const shipmentData = await fetchShipment(selectedShipment.value);
      const runData = await fetchRunsInShipment(shipmentData.docs[0].data()['runs']);

      updateSelectRunAssignStops(runData);

      showUI(assignStopsWidget);

    });

  }


  if(addStopButton != null){

    addStopButton.addEventListener('click', () => {

      showUI(addStopsWidget);

    });

  }

  if(assignStopsWidgetButton != null){

    assignStopsWidgetButton.addEventListener('click', async () => {

       //check for selected order
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=assignStopCheckbox]');

      const orderIDs = [];

      selectedCheckBoxes.forEach((x) => {

        orderIDs.push(x.value);

      });

      const result = await assignStopsToRun(selectAssignStopsRun.value, orderIDs);

      //rebuild ui
      updateRunsList(selectedShipment.value);
      
      if(result){

        showNotification("Success!", "Stop(s) successfully assigned to run");

      }else{

        showNotification("Error!", "Error assigning stop(s) to run");

      }

      hideUI(assignStopsWidget);

    });

  }

  if(cancelAssignStopsWidgetButton != null){

    cancelAssignStopsWidgetButton.addEventListener('click', () => {

      hideUI(assignStopsWidget);
      
    });

  }

  if(addStopsWidgetButton != null){

    addStopsWidgetButton.addEventListener('click', async () => {

      //check for selected order
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=addStopCheckbox]');

      const orderIDs = [];

      selectedCheckBoxes.forEach((x) => {

        orderIDs.push(x.value);

      });

      const stopType = selectAddStopsRun.value

      //returns true or a string
      const result = await assignStopsToShipment(orderIDs, stopType);

      if(result !== true){

        showNotification("Error!", result);
        return;

      }else{
        
        showNotification("Success!", "Successfully added stop(s) to " + selectedShipment.value);

      }

      hideUI(addStopsWidget);
      updateRunsList(selectedShipment.value);

    });

  }

  if(cancelAddStopsWidgetButton != null){

    cancelAddStopsWidgetButton.addEventListener('click', () => {

      hideUI(addStopsWidget);
      
    });

  }

}


function showRuns(){

  showUI(runStopsContainer);
  showUI(selectedRunView);
  showUI(runInfoWrapper);
  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

}

function showAddOrderTable(){

  showUI(addRunDetailsContainer);
  showUI(selectedRunView);
  hideUI(runStopsContainer);
  hideUI(unassignedOrdersContainer);
  hideUI(runInfoWrapper);

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


  //deselect card without selecting a new one
  if(!runCard){

    currentSelectedRunCard.classList.remove('selectedRunCard');
    currentSelectedRunCard = null;
    return;

  }

  if(currentSelectedRunCard != null){
    currentSelectedRunCard.classList.remove('selectedRunCard');
  }

  runCard.classList.add('selectedRunCard');

  currentSelectedRunCard = runCard;

}

//updates select options in assign run widget
function updateSelectRunAssignStops(runData){

  const runs = [];

  for(let i = 0; i < runData.length; i++){

    runs.push(parseRunInfo(runData[i]));

  }

  runs.sort(sortAlphabetically);

  selectAssignStopsRun.innerHTML = "";

  for(let i = 0; i < runs.length; i++){

    if(runs[i].runName != null){
      selectAssignStopsRun.appendChild(createOption(runs[i].runName, runs[i].documentId));
    
    }

  }

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

      generateStopForRun(runName, orderData[i], shipmentTypeInput.value);

    }

  }

}


function generateStopForRun(runName, orderData, stopType){

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

  await selectShipment(shipmentName);

  runStructList.sort(sortAlphabetically);

  if(runStructList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runStructList.length; i++){

    if(runStructList[i].runName != null){

      runCardList.appendChild(runStructList[i].runCard);

    }else{
      //manage unassigned runs
      
      unassignedOrdersCardWrapper.appendChild(runStructList[i].runCard);
    }

  }

  //append add stop button
  const addStopButton = createAddStopButton();

  addStopButton.addEventListener('click', () => {

    selectCard(false);
    showAddOrderTable();

  });

  addStopButtonWrapper.appendChild(addStopButton);

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

async function updateRun(documentId, fieldsToUpdate){

  const runRef = doc(db, 'Runs', documentId);

  try{

    await updateDocument(runRef, fieldsToUpdate);
    
  }catch(e){

    console.log(e);
    return false;

  }

  return true;
}


async function selectShipment(selectedShipment){

  const shipmentData = await fetchShipment(selectedShipment);

  const runIDs = shipmentData.docs[0].data()['runs'];

  const runData = await fetchRunsInShipment(runIDs);

  for(let i = 0; i < runData.length; i++){

    parseRunData(runData[i]);

  }

}


function parseRunInfo(doc){

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

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}


async function getRunStopsOrderData(stops){

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


function updateStopList(runStruct){

  currentSelectedRun = runStruct;

  const stops = runStruct.stops
  runStopsContainer.innerHTML = "";

  console.log(runStruct);

  for(let i = 0; i < stops.length; i++){

    // console.log(i);
    for(let j = 0; j < stops.length; j++){

      // console.log(stops[j]);
      if(stops[j].stopNumber == i + 1){

        const stopNumber = createStopNumber(stops[j].stopNumber);
        const stopCard = getStopCard(stops[j], runStruct);

        runStopsContainer.appendChild(stopNumber);
        runStopsContainer.appendChild(stopCard);

      }

    }

  }

}

function getDragDetectionZone(detectionZoneType){

  const dragDetectionZone = createDragDetectionZone(detectionZoneType);
  
  dragDetectionZone.addEventListener('mouseover', () => {

    if(isCardBeingDragged){

      if(dragDetectionZone.parentNode == cardBeingDragged){
        return;
      }

      //remove mimic card
      if(mimicCard != null){
        mimicCard.remove();
      }

      //Creates direct copy of node including ID's
      mimicCard = getMimicCard(); 

      //the card thats being hovered over
      const stopCardWrapper = dragDetectionZone.parentNode;

      removeNumbersFromStopsList();

      if(detectionZoneType == "top"){

        stopCardWrapper.before(mimicCard);

      }else{

        stopCardWrapper.after(mimicCard);

      }

      addNumbersToStopsList();

    }

  });

  return dragDetectionZone;

}


function addNumbersToStopsList(){

  const stopCards = runStopsContainer.querySelectorAll('.stopCardWrapper');
  const filteredStopCards = Array.from(stopCards).filter((stopCard) => {

    return stopCard != cardBeingDragged;
  });

  for(let i = 0; i < filteredStopCards.length; i++){

    filteredStopCards[i].before(createStopNumber(i + 1));

  }
  

}


function removeNumbersFromStopsList(){

  const stopNumbers = runStopsContainer.querySelectorAll('.stopNumberWrapper');

  for(let i = 0; i < stopNumbers.length; i++){

    stopNumbers[i].remove();

  }

}


function getMimicCard(){

  const mimicCard = cardBeingDragged.cloneNode(true);
  mimicCard.classList.remove('absolute');
  mimicCard.style.top = "";
  mimicCard.classList.add('invisible');
  mimicCard.classList.add('z-index-1');

  return mimicCard;

}


function getStopCard(stop, runStruct){
  
  const stopMetaData = createStopMetaData(stop);

  const lockIcon = createLockIcon();
  const lockOpenIcon = createOpenLockIcon();

  const stopLockButton = createStopLockButton(stop['isLocked'], lockIcon, lockOpenIcon);
 
  const stopCard = createStopCard(stop, stopMetaData, stopLockButton);

  const dragZoneTop = getDragDetectionZone("top");
  const dragZoneBottom= getDragDetectionZone("bottom");

  dragZones.push(dragZoneTop);
  dragZones.push(dragZoneBottom);

  stopCard.appendChild(dragZoneTop);
  stopCard.appendChild(dragZoneBottom);

  stopLockButton.addEventListener('click', async () => {

    //loading symbol for lock
    if(stopLockButton.classList.contains("nonClickable")){
      console.log("click blocked");
      return;
    }

    stopLockButton.classList.add('nonClickable');

    await toggleLockStop(stop, runStruct);
    updateLockIcon(stop['isLocked'], lockIcon, lockOpenIcon);

    stopLockButton.classList.remove('nonClickable');

  });

  stopLockButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  stopLockButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });

  stopCard.addEventListener('mousedown', (e) => {

    const mousedownTime = Date.now();

    setTimeout(() => {

      //has there been a mouseup within the timeout time
      if(mousedownTime - lastMouseUp > 0){

        const stopListYOffset = runStopsContainer.getBoundingClientRect().y;
        const stopCardYOffset = stopCard.getBoundingClientRect().y;
        
        const grabPositionOffset = e.clientY - stopCardYOffset;
        const top = e.clientY - stopListYOffset - grabPositionOffset;

        setTop(top ,stopCard)
        stopCardDragAndMove(stopCard, grabPositionOffset);

      }

    }, stopCardLongClickTime);

  });

  stopCard.addEventListener('mouseup', () => {

    const mouseupTime = Date.now();

    if(mouseupTime - lastMouseDown < stopCardLongClickTime){

      selectStop(stopMetaData, stopLockButton);

    }

  });

 

  return stopCard;

}

async function toggleLockStop(stopBeingToggleLocked, runStruct){

  const updatedStops = runStruct.stops.filter((stop) => {
    
    if(compareStops(stop, stopBeingToggleLocked)){
      stop['isLocked'] = !stop['isLocked'];
    }

    return true;
  })

  runStruct.stops = updatedStops;

  //remove stopData field from stops before storing as this data is fetched using foreign key
  for(let i = 0; i < updatedStops.length; i++){

    delete updatedStops[i].stopData;

  }

  const result = await updateRun(runStruct.documentId, {stops: updatedStops});
  console.log(result);

}

function updateLockIcon(isLocked, lockIcon, lockOpenIcon){

  //the new state to set
  if(isLocked){

    hideUI(lockOpenIcon);
    showUI(lockIcon);

  }else{

    showUI(lockOpenIcon);
    hideUI(lockIcon);

  }

}

function stopCardDragAndMove(stopCard, grabPositionOffset){
 
  isCardBeingDragged = true;
  cardBeingDragged = stopCard;

  enableDragZones();

  mimicCard = getMimicCard();

  stopCard.before(mimicCard);
 
  stopCard.classList.add('absolute');
  stopCard.classList.add('ontop');

  mouseMoveCallback = (e) => { moveStopCard(e.clientY, stopCard, grabPositionOffset)} ;

  window.addEventListener('mousemove', mouseMoveCallback);

  //add initial mimic card


}


async function dropStopCard(){

  //get position of each stopm in list 

  const stopCardList =  Array.from(cardBeingDragged.parentNode.children).filter((element) => {

    if(element.classList.contains('stopNumberWrapper')){
      return false;
    }

    if(element === cardBeingDragged){
      return false;
    }

    return true;

  });

  const updatedStops = []

  for(let i = 0; i < stopCardList.length; i++){

    const orderID = parseInt(stopCardList[i].querySelector('.orderID').innerText.replace('#', ''));
    const stopType = stopCardList[i].querySelector('.stopType').innerText.toLowerCase();

    for(let j = 0; j < currentSelectedRun.stops.length; j++){

      if(currentSelectedRun.stops[j].stopData.ID === orderID){

        if(currentSelectedRun.stops[j].stopType === stopType){

          const stopCopy = Object.assign({}, currentSelectedRun.stops[j]);
          stopCopy.stopNumber = i + 1;

          updatedStops.push(stopCopy);
        
        }

      }

    }

  }


  // console.log(updatedStops);
  // console.log(currentSelectedRun.stops);

  const updateDatabaseStops = [];
  // // console.log(updateDatabaseStops === currentSelectedRun.stops);

  for(let i = 0; i < updatedStops.length; i++){

    const stopCopy = Object.assign({}, updatedStops[i]);
    delete stopCopy.stopData;

    updateDatabaseStops.push(stopCopy);

  }

  // console.log(updateDatabaseStops);
  
  //update the database
  const result = await updateRun(currentSelectedRun.documentId, {stops: updateDatabaseStops});
 
  if(!result){

    showNotification("Error!", "Error updating stops orders");

    return false;
  }

  //update client side order as database has updated successfully

  currentSelectedRun.stops = updatedStops;


  if(cardBeingDragged != null){

      cardBeingDragged.classList.remove('absolute');
      cardBeingDragged.classList.remove('ontop');
      cardBeingDragged.style.top = "";

  }

  if(mimicCard != null){

    mimicCard.replaceWith(cardBeingDragged);
    // mimicCard.remove();

  }

  disableDragZones();

  window.removeEventListener('mousemove', mouseMoveCallback);

  isCardBeingDragged = false;

}


function getGrabPosition(){

  const stopCardList =  Array.from(mimicCard.parentNode.children).filter((element) => {

    if(element.classList.contains('stopNumberWrapper')){
      return false;
    }

    if(element === mimicCard){
      return false;
    }

    return true;

  });

  return indexOfElementInArray(stopCardList, cardBeingDragged) + 1;

}


function getPositionDropped(){

  const stopList = Array.from(mimicCard.parentNode.children).filter((element) => {

    if(element.classList.contains('stopNumberWrapper')){
      return false;
    }

    if(element === cardBeingDragged){
      return false;
    }
  
    return true;
  
  }); 

  
  return indexOfElementInArray(stopList, mimicCard) + 1;


}


function enableDragZones(){

  for(let i = 0; i < dragZones.length; i++){

    dragZones[i].classList.remove('hidden');

  }

}

function disableDragZones(){

  for(let i = 0; i < dragZones.length; i++){

    dragZones[i].classList.add('hidden');

  }

}


function moveStopCard(mouseY, stopCard, grabPositionOffset){

  const stopListYOffset = runStopsContainer.getBoundingClientRect().y;
  const top = mouseY - stopListYOffset - grabPositionOffset;

  //get center of card pos
  const position = getPositionOfElement(stopCard);

  setTop(top, stopCard);

}

function getPositionOfElement(element){

  const elementBounds = element.getBoundingClientRect();

  const width = elementBounds.width;
  const height = elementBounds.height;

  const top = elementBounds.y;
  const left = elementBounds.x;

  const xPos = left - (width/2);
  const yPos = top - (height/2);

  return [xPos, yPos];

}

function setTop(top, element){

  element.style.top = top + "px";

}

function selectStop(stopMetaData, stopLockButton){

  if(currentlyStopMetaData == stopMetaData && currentlyStopLockButton == stopLockButton){
    //deselect 
    currentlyStopMetaData = null; 
    currentlyStopLockButton = null;

    hideUI(stopMetaData);
    hideUI(stopLockButton);

    return;

  }

  if(currentlyStopMetaData != null){
    hideUI(currentlyStopMetaData);
  }

  if(currentlyStopLockButton != null){
    hideUI(currentlyStopLockButton);
  }

  showUI(stopMetaData);
  showUI(stopLockButton);

  currentlyStopMetaData = stopMetaData;
  currentlyStopLockButton = stopLockButton;

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

  for(let i = 0; i < orderData.docs.length; i++){

    addOrderTable.appendChild(createTableOrderCard(orderData.docs[i]));

  }

}

async function fetchShipment(shipmentName){

  const shipmentData = await getDocuments(query(collection(db, 'Shipments'), where("shipmentName", "==", shipmentName), limit(1)));

  if(shipmentData.empty){
    console.log("shipment doesnt exist");
    return;
  }

  return shipmentData;

}

async function fetchRunsInShipment(runIDs){

  const numberOfRuns = runIDs.length;

  let promises = [];

  for(let i = 0; i < numberOfRuns; i++){

    promises.push(fetchRun(runIDs[i]));

  } 
  
  return await Promise.all(promises);

}

async function fetchRun(runID){

  try{

    const runData = await getDocument(query(doc(db, 'Runs', runID)));
    return runData;

  }catch(e){

    return false;
  }

}

async function assignStopsToRun(runID, stops){

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


//assigns stops to the unassighed run within the currently selected shipment
async function assignStopsToShipment(orderIDs, stopType){

  let runData;

  try{

    const shipmentData = await fetchShipment(selectedShipment.value);
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


function isStopInShipment(runDocuments, stopsToAdd){

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

function indexOfElementInArray(arr, element){

  for(let i = 0; i < arr.length; i++){

    if(arr[i] === element){
      return i;
    }
  }

  return -1

}


function compareStops(a, b){

  if(a.orderID === b.orderID){

    if(a.stopType === b.stopType){

      return true
    }

  }

  return false;

}


