import { db, getDocuments, filterSearch } from "/js/Firebase.js";
import { query, collection, limit, orderBy, doc } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"
import { createOption, createAddStopButton, createStopCard, createUnassignedOrdersTableCard, createUnassignedOrdersButton, createTableOrderCard, createRunCard } from "/js/ShipmentsLogisticsManager/Components.js"
import { createAddRunButton, createButtonWrapper, createDeleteStopButton, createShipmentOptions, createOpenLockIcon, createLockIcon, createDragDetectionZone, createStopNumber, createStopLockButton, createStopMetaData } from "./Components";
import { addRunToShipment, removeStopsFromShipment, selectRun, fetchRunsInShipment, toggleStopLock, updateStopNumberInRun, removeStopDataFromStop, mergeStopsWithOrderData, getRunStopsOrderData, generateShipment, parseRunInfo, updateRun, assignStopsToRun, sortAlphabetically, deleteShipmentDocument, fetchShipment, compareStops, removeRunFromShipment, assignStopsToShipment } from "./Model";

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

const removeStopsWidget = document.getElementById('remove_stops_widget');
const cancelRemoveStopsWidgetButton = document.getElementById('cancel_remove_stops_button');
const removeStopsWidgetButton = document.getElementById('remove_stops_widget_button');

const addRunWidget = document.getElementById('add_run_widget');
const cancelAddRunWidgetButton = document.getElementById('cancel_add_run_button');
const addRunWidgetButton = document.getElementById('add_run_widget_button');
const addRunNameInput = document.getElementById('add_run_name_input');

const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('select_shipment');

const selectedRunView = document.getElementById('selected_run_view');
const runStopsContainer = document.getElementById('run_stops_container');
const runOptionsContainer = document.getElementById('run_options_container');
const addRunDetailsContainer = document.getElementById('add_run_details');
const runInfoWrapper = document.getElementById('run_info_wrapper');

const manageTabButton = document.getElementById('manage_tab_button');
const optionTabButton = document.getElementById('option_tab_button');

const removeRunButton = document.getElementById('remove_run_button');
const removeRunWidget = document.getElementById('remove_run_widget');

const searchButton = document.getElementById('search_button');
const addOrderTable = document.getElementById('table_body');
const addOrderSearchInput = document.getElementById('add_order_search_input');
const addOrderSearchFilter = document.getElementById('add_order_search_filter');
const assignStopButton = document.getElementById('assign_stop_button');
const removeStopButton = document.getElementById('remove_stop_button');
const addStopButton = document.getElementById('add_stop_button');

const stopCardLongClickTime = 1000;

let currentShipmentUnassignedOrders;
let currentSelectedRunCard = null;
let currentSelectedRun = null;

let currentlyStopMetaData = null;
let currentStopButtonWrapper = null;

let lastMouseDown = 0;
let lastMouseUp = 0;
let mouseDown = false;

let isCardBeingDragged = false;
let cardBeingDragged;
let mouseMoveCallback;

let mimicCard;
let dragZones = [];

let map;


// initMap();
addEventListeners();

init();



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

      const generateShipmentResult = await generateShipment(shipmentNameInput.value, shipmentTypeInput.value, shipmentDeliveryWeekInput.value);

      console.log(generateShipmentResult);

      if(!generateShipmentResult){

        showNotification("Error!", "Error creating shipment");
        return;

      }

      updateSelectShipment(shipmentNameInput.value);
      updateRunsList(shipmentNameInput.value);
      clearAndHideRunStopsUI();

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

        const deleteShipmentDocumentResult = await deleteShipmentDocument(selectDeleteShipment.value);
        
        console.log(deleteShipmentDocumentResult);

        if(!deleteShipmentDocumentResult){

          showNotification("Error!", "Error deleting shipment");

          return;
        }
        
        clearShipmentUI();
        clearAndHideRunStopsUI();
        updateSelectShipment();

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
      const runData = await fetchRunsInShipment(shipmentData.data()['runs']);

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
      
      const result = await assignStopsToRun(selectAssignStopsRun.value, orderIDs, currentShipmentUnassignedOrders);

      updateUnassignedOrdersTable(currentShipmentUnassignedOrders);
      
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
      const result = await assignStopsToShipment(orderIDs, stopType, selectedShipment.value);

      if(result !== true){

        showNotification("Error!", result);
        return;

      }else{
        
        showNotification("Success!", "Successfully added stop(s) to " + selectedShipment.value);

      }

      hideUI(addStopsWidget);
      await updateRunsList(selectedShipment.value);
      showUI(addRunDetailsContainer);
      deselectCheckboxes(selectedCheckBoxes);

    });

  }

  if(cancelAddStopsWidgetButton != null){

    cancelAddStopsWidgetButton.addEventListener('click', () => {

      hideUI(addStopsWidget);
      
    });

  }

  if(removeStopButton != null){

    removeStopButton.addEventListener('click', () => {

      showUI(removeStopsWidget);

    });

  }

  if(cancelRemoveStopsWidgetButton != null){

    cancelRemoveStopsWidgetButton.addEventListener('click', () => {

      hideUI(removeStopsWidget);

    });

  }

  if(removeStopsWidgetButton != null){

    removeStopsWidgetButton.addEventListener('click', async () => {

      //get stops that have been selected
    
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=assignStopCheckbox]');

      const stopIDs = [];

      selectedCheckBoxes.forEach((x) => {

        stopIDs.push(x.value);

      });

      const result = await removeStopsFromShipment(stopIDs, currentShipmentUnassignedOrders);
      
      hideUI(removeStopsWidget);
      
      updateUnassignedOrdersTable(currentShipmentUnassignedOrders);

      if(result){
        showNotification("Success!", "Successfully removed stops from shipment");
        return;
      }
      
      showNotification("Error!", "Error removing stops from shipment");

    });

  }

  if(addRunWidgetButton != null){

    addRunWidgetButton.addEventListener('click', async () => {

      if(addRunNameInput.value != null){

        const result = await addRunToShipment(addRunNameInput.value, selectedShipment.value);

        if(result === false){

          showNotification("Error!", "Error adding run to shipment");
          return;

        }

        updateRunsList(selectedShipment.value);
        showNotification("Success!", "Successfully added run to shipment");
        hideUI(addRunWidget);
        return;

      } 

      showNotification("Error!", "Please enter a name for the run you want to add");

    });
  }

  if(cancelAddRunWidgetButton != null){

    cancelAddRunWidgetButton.addEventListener('click', () => {

      hideUI(addRunWidget);

    });

  }

  if(manageTabButton != null){

    manageTabButton.addEventListener('click', () => {

      selectTab("Manage");

    });

  }

  if(optionTabButton != null){

    optionTabButton.addEventListener('click', () => {
      
      selectTab("Option");

    });

  }

  if(removeRunButton != null){

    removeRunButton.addEventListener('click', async () => {
      //get primary keys of stops to remove
      const stopPrimaryKeys = currentSelectedRun.stops.map((stop) => {

        return stop.orderID + "_" + stop.stopType;

      });

      let assignStopsResult = true;

      if(stopPrimaryKeys.length != 0){
        //remove all stops from run
        assignStopsResult = await assignStopsToRun(currentShipmentUnassignedOrders, stopPrimaryKeys, currentSelectedRun.documentId);
      }

      //remove run document
      if(assignStopsResult){

        if(currentShipmentUnassignedOrders == currentSelectedRun.documentId){
          showNotification("Error!", "Cannot remove unassigned stops document from shipment");
          return; 
        }

        const removeRunFromShipmentResult = await removeRunFromShipment(currentSelectedRun.documentId, selectedShipment.value);
        if(removeRunFromShipmentResult){

          showNotification("Success!", "Removed run from shipment. All stops in run have been marked as unassigned");

        }else{

          showNotification("Error!", "Error removing run from shipment. All stops in run have been market as unassigned");

        }

        await updateRunsList(selectedShipment.value);
        hideUI(selectedRunView);
   
      }else{
        showNotification("Error!", "Error removing run from shipment");
      }


    });

  }


}

function deselectCheckboxes(checkBoxes){

  for(let i = 0; i < checkBoxes.length; i++){

    checkBoxes[i].checked = false;

  }

}


function selectTab(tabName){

  if(tabName == "Manage"){

    showUI(runStopsContainer);
    hideUI(runOptionsContainer);
    manageTabButton.classList.add('selectedTabButton');
    optionTabButton.classList.remove('selectedTabButton');

  }else if(tabName == "Option"){

    hideUI(runStopsContainer);
    showUI(runOptionsContainer);
    optionTabButton.classList.add('selectedTabButton');
    manageTabButton.classList.remove('selectedTabButton');

  }

}


function showRuns(){

  showUI(selectedRunView);
  showUI(runInfoWrapper);
  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

  selectTab("Manage");

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

  if(currentSelectedRunCard != null){
    currentSelectedRunCard.classList.remove('selectedRunCard');
  }

  //deselect card without selecting a new one
  if(!runCard){

    currentSelectedRunCard = null;
    return;

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


function parseRunData(runData){

  const runStruct = parseRunInfo(runData);

  if(runStruct.runName != null){
    
    const runCard = createRunCard(runStruct);

    runStruct.runCard = runCard;
    
    runCard.addEventListener('click', async () => {

      //fetch run to make sure client is showing the correct state and order of stops.
      const runObject = await selectRun(runStruct.documentId);
      updateStopList(runObject);
      showRuns();
      selectCard(runCard);

    });

  }else{

    const unassignedOrdersButton = createUnassignedOrdersButton(runStruct);

    unassignedOrdersButton.addEventListener('click', async () => {

      const runObject = await selectRun(runStruct.documentId);
      await updateUnassignedOrdersTable(runObject);

    });

    runStruct.runCard = unassignedOrdersButton;

    //set unassigned stops doc id for current shipment
    currentShipmentUnassignedOrders = runStruct.documentId;
  }

  return runStruct;

}


async function updateUnassignedOrdersTable(runObject){

  currentSelectedRun = runObject;

  //rebuild ui
  await updateRunsList(selectedShipment.value);

  unassignedOrderTableBody.innerHTML = "";

  for(let i = 0; i < runObject.stops.length; i++){

      unassignedOrderTableBody.appendChild(createUnassignedOrdersTableCard(runObject.stops[i]));

  }

  showUnassignedOrdersTable();

}


async function updateSelectShipment(shipmentName){

  let shipments;

  try{

    shipments = await getDocuments(query(collection(db, 'Shipments')));
 
  }catch(e){

    showNotification("Error!", "Error updating shipment options");
    return;
  }
  
  selectedShipment.innerHTML = "";

  const shipmentOptions = createShipmentOptions(shipmentName, shipments);

  for(let i = 0; i < shipmentOptions.length; i++){

    selectedShipment.appendChild(shipmentOptions[i]);

  }

}


async function generateDeleteWidget(){

  const docRef = query(collection(db, "Shipments"));
  const shipments = await getDocuments(docRef);

  selectDeleteShipment.innerHTML = "";

  for(let i = 0; i < shipments.docs.length; i++){

    const shipmentName = shipments.docs[i].data()['shipmentName'];
    selectDeleteShipment.appendChild(createOption(shipmentName, shipments.docs[i].id));

  }

}


function clearShipmentUI(){

  runCardList.innerHTML = "";
  unassignedOrderTableBody.innerHTML = "";
  unassignedOrdersCardWrapper.innerHTML = "";
  addStopButtonWrapper.innerHTML = "";

  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

}


function clearAndHideRunStopsUI(){

  runStopsContainer.innerHTML = "";
  hideUI(runStopsContainer);
  hideUI(selectedRunView);

}

//unassigned orders button ui bug is in here
async function updateRunsList(shipmentName){

  if(shipmentName === "SELECT_SHIPMENT"){
    return;
  }

  const runsList = await selectShipment(shipmentName);

  if(runsList === false){
    showNotification("Error!", "Error fetching shipment");
    return;
  }

  runsList.sort(sortAlphabetically);


  clearShipmentUI();
  showUI(runStopsContainer);


  if(runsList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runsList.length; i++){

    if(runsList[i].runName != null){

      runCardList.appendChild(runsList[i].runCard);

    }else{

      //manage unassigned runs
      unassignedOrdersCardWrapper.appendChild(runsList[i].runCard);

    }

    if(currentSelectedRun != null){

      //find and reselect run that was selected before run card were rebuilt.
      if(currentSelectedRun.documentId == runsList[i].runCard.id){

        selectCard(runsList[i].runCard);

      }
    }

  }

  //append add stop button
  const addStopButton = createAddStopButton();

  addStopButton.addEventListener('click', () => {

    selectCard(false);
    showAddOrderTable();

  });

  addStopButtonWrapper.appendChild(addStopButton);


  //append add run button
  const addRunButton = createAddRunButton();

  addRunButton.addEventListener('click', () => {

    showUI(addRunWidget);

  });

  runCardList.appendChild(addRunButton);

}


async function selectShipment(selectedShipment){

  const shipmentData = await fetchShipment(selectedShipment);

  if(shipmentData === false){

    return false;

  }

  const runIDs = shipmentData.data()['runs'];

  const runData = await fetchRunsInShipment(runIDs);

  const runsList = [];

  for(let i = 0; i < runData.length; i++){

    runsList.push(parseRunData(runData[i]));

  }

  return runsList;

}


async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}


function updateStopList(runStruct){

  currentSelectedRun = runStruct;

  const stops = runStruct.stops
  runStopsContainer.innerHTML = "";

  for(let i = 0; i < stops.length; i++){

    for(let j = 0; j < stops.length; j++){

      if(stops[j].stopNumber == i + 1){

        const stopNumber = createStopNumber(stops[j].stopNumber, stops[j].isLocked);
        const stopCard = getStopCard(stops[j], runStruct, stopNumber.firstChild);

        runStopsContainer.appendChild(stopNumber);
        runStopsContainer.appendChild(stopCard);

      }

    }

  }

  if(stops.length == 0){

    runStopsContainer.innerText = "No Stops in run";

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

  //console.log(filteredStopCards);

  for(let i = 0; i < filteredStopCards.length; i++){

    const stopNumber = createStopNumber(i + 1);
    const stopCard = filteredStopCards[i].querySelector('.stopCard');
    //console.log(stopCard);

    const isLocked = stopCard.classList.contains('lockedCard');
    //console.log(isLocked);

    filteredStopCards[i].before(stopNumber);

    setStopNumberLock(isLocked, stopNumber.firstChild);

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


function getStopCard(stop, runStruct, stopNumber){
  
  const stopMetaData = createStopMetaData(stop);

  const lockIcon = createLockIcon();
  const lockOpenIcon = createOpenLockIcon();

  const stopLockButton = createStopLockButton(stop['isLocked'], lockIcon, lockOpenIcon);
  const deleteButton = createDeleteStopButton();

  const buttonWrapper = createButtonWrapper(stopLockButton, deleteButton);
 
  const stopCardWrapper = createStopCard(stop, stopMetaData, buttonWrapper);

  const dragZoneTop = getDragDetectionZone("top");
  const dragZoneBottom= getDragDetectionZone("bottom");

  dragZones.push(dragZoneTop);
  dragZones.push(dragZoneBottom);

  stopCardWrapper.appendChild(dragZoneTop);
  stopCardWrapper.appendChild(dragZoneBottom);

  //set initial lock state
  setStopLock(stop['isLocked'], lockIcon, lockOpenIcon, stopNumber, stopCardWrapper.firstChild);

  stopLockButton.addEventListener('click', async () => {

    //loading symbol for lock
    if(stopLockButton.classList.contains("nonClickable")){
      console.log("click blocked");
      return;
    }

    stopLockButton.classList.add('nonClickable');

    const result = await toggleStopLock(stop, currentSelectedRun);

    stopLockButton.classList.remove('nonClickable');

    if(!result){

      showNotification("Error!", "Error updating lock on stop");
      updateStopList(currentSelectedRun);

      return;

    }

    const stopNumber = stopCardWrapper.previousElementSibling.firstChild;

    setStopLock(stop['isLocked'], lockIcon, lockOpenIcon, stopNumber, stopCardWrapper.firstChild);

  });


  deleteButton.addEventListener('click', async () => {

    const result = await assignStopsToRun(currentShipmentUnassignedOrders, [stop.orderID + "_" + stop.stopType], runStruct.documentId);

    if(result){

      showNotification("Success!", "Removed stop from run");
      const runObject = await selectRun(runStruct.documentId);
      updateStopList(runObject);

      await updateRunsList(selectedShipment.value);

      return;
    } 

    showNotification("Error!", "Error removing stop from run");

  })


  stopCardWrapper.addEventListener('mousedown', (e) => {

    const mousedownTime = Date.now();

    setTimeout(() => {

      //has there been a mouseup within the timeout time
      if(mousedownTime - lastMouseUp > 0){

        const stopListYOffset = runStopsContainer.getBoundingClientRect().y;
        const stopCardYOffset = stopCardWrapper.getBoundingClientRect().y;
        
        const grabPositionOffset = e.clientY - stopCardYOffset;
        const top = e.clientY - stopListYOffset - grabPositionOffset;


        setTop(top ,stopCardWrapper)
        stopCardDragAndMove(stopCardWrapper, grabPositionOffset);

      }

    }, stopCardLongClickTime);

  });

  stopCardWrapper.addEventListener('mouseup', () => {

    const mouseupTime = Date.now();

    if(mouseupTime - lastMouseDown < stopCardLongClickTime){

      selectStop(stopMetaData, buttonWrapper);

    }

  });

  stopLockButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  stopLockButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });

  deleteButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  deleteButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });

  return stopCardWrapper;

}


function setStopLock(isLocked, lockIcon, lockOpenIcon, stopNumber, stopCard){

  // console.log(stopCard);
  setLockIcon(isLocked, lockIcon, lockOpenIcon);
  setStopNumberLock(isLocked, stopNumber);
  setStopCardLock(isLocked, stopCard);

}

function setStopCardLock(isLocked, stopCard){

  if(isLocked){

    stopCard.classList.add('lockedCard');

  }else{

    stopCard.classList.remove('lockedCard');

  }

}

function setStopNumberLock(isLocked, stopNumber){

  if(isLocked){

    stopNumber.classList.add('lockedNumber');

  }else{

    stopNumber.classList.remove('lockedNumber');

  }

}


function setLockIcon(isLocked, lockIcon, lockOpenIcon){

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

}


async function dropStopCard(){

  //get position of each stopm in list 

  const stopCardList = Array.from(cardBeingDragged.parentNode.children).filter((element) => {

    if(element.classList.contains('stopNumberWrapper')){
      return false;
    }

    if(element === cardBeingDragged){
      return false;
    }

    return true;

  });

  const updatedStops = [];

  for(let i = 0; i < stopCardList.length; i++){

    const orderID = parseInt(stopCardList[i].querySelector('.orderID').innerText.replace('#', ''));
    const stopType = stopCardList[i].querySelector('.stopType').innerText.toLowerCase();

    updatedStops.push(updateStopNumberInRun(orderID, stopType, currentSelectedRun.stops, i + 1));

  }

  const updateDatabaseStops = removeStopDataFromStop(updatedStops);
  
  //update the database
  const result = await updateRun(currentSelectedRun.documentId, {stops: updateDatabaseStops});
 
  if(!result){

    showNotification("Error!", "Error updating stops orders");
    updateStopList(currentSelectedRun);

    return false;
  }

  console.log(updateDatabaseStops);

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
  setTop(top, stopCard);

}


function setTop(top, element){

  element.style.top = top + "px";

}


function selectStop(stopMetaData, buttonWrapper){

  if(currentlyStopMetaData == stopMetaData && currentStopButtonWrapper == buttonWrapper){
    //deselect 
    currentlyStopMetaData = null; 
    currentStopButtonWrapper= null;

    hideUI(stopMetaData);
    hideUI(buttonWrapper);

    return;

  }

  if(currentlyStopMetaData != null){
    hideUI(currentlyStopMetaData);
  }

  if(currentStopButtonWrapper != null){
    hideUI(currentStopButtonWrapper);
  }

  showUI(stopMetaData);
  showUI(buttonWrapper);

  currentlyStopMetaData = stopMetaData;
  currentStopButtonWrapper = buttonWrapper;

}


async function getOrders(query){

  //fetch orders
  const orderData = await getDocuments(query);
  addOrderTable.innerHTML = "";

  console.log(orderData);

  if(orderData.empty){
    console.log("no orders to show");

    return;
  }

  for(let i = 0; i < orderData.docs.length; i++){

    addOrderTable.appendChild(createTableOrderCard(orderData.docs[i]));

  }

}







