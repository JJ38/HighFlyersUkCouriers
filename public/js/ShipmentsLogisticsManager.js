import { db, getDocuments, getDocument, bulkReadTransaction, filterSearch } from "/js/Firebase.js";
import { query, collection, where, limit, orderBy, doc, addDoc, writeBatch } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"

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

const selectedRunView = document.getElementById('selected_run_view');
const runStopsContainer = document.getElementById('run_stops_container');
const addRunDetailsContainer = document.getElementById('add_run_details');


const manageTabButton = document.getElementById('run_details_manage_button');
const addTabButton = document.getElementById('run_details_add_button');

const searchButton = document.getElementById('search_button');
const addOrderTable = document.getElementById('table_body');
const addOrderSearchInput = document.getElementById('add_order_search_input');
const addOrderSearchFilter = document.getElementById('add_order_search_filter');


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

  if(addTabButton != null){

    addTabButton.addEventListener('click', () => {

      showAddOrderTable();

    });

  }

  if(manageTabButton != null){

    manageTabButton.addEventListener('click', () => {

      showRuns();
   
    });

  }


}


function showRuns(){

  showUI(runStopsContainer);
  showUI(selectedRunView);
  hideUI(addRunDetailsContainer);

  manageTabButton.classList.add('selectedRunDetailsButton');
  addTabButton.classList.remove('selectedRunDetailsButton');

  selectedRunView.classList.add('fit-content');

}

function showAddOrderTable(){

  showUI(addRunDetailsContainer);
  showUI(selectedRunView);
  hideUI(runStopsContainer);

  addTabButton.classList.add('selectedRunDetailsButton');
  manageTabButton.classList.remove('selectedRunDetailsButton');

  selectedRunView.classList.remove('fit-content');

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

        console.log(stops[i].stopType);
        console.log(orderData);

        stopData['message'] = orderData['message'];
        stopData['email'] = orderData['email'];
        stopData['animalType'] = orderData['animalType'];
        stopData['ID'] = orderData['ID'];
        stopData['quantity'] = orderData['quantity'];
        
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

  if(orderData.empty){
    console.log("no orders to show");
    return;
  }

  console.log(orderData);

  //clear table 
  addOrderTable.innerHTML = "";

  for(let i = 0; i < orderData.docs.length; i++){

    addOrderTable.appendChild(createTableOrderCard(orderData.docs[i].data()));

  }

  //create table order card

}


function createTableOrderCard(orderData){

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";

  tableRow.appendChild(tableData(""));

  tableRow.appendChild(tableData(orderData['ID']));
  tableRow.appendChild(tableData(orderData['animalType']));
  tableRow.appendChild(tableData(orderData['quantity']));
  tableRow.appendChild(tableData(orderData['account']));
  tableRow.appendChild(tableData(orderData['deliveryWeek']));
  tableRow.appendChild(tableData(orderData['collectionName']));

  tableRow.appendChild(
    createTableAddress(
      orderData['collectionAddress1'],
      orderData['collectionAddress2'],
      orderData['collectionAddress3'],
      orderData['collectionPostcode'],
    )
  );
  
  tableRow.appendChild(tableData(orderData['collectionPhoneNumber']));
  tableRow.appendChild(tableData(orderData['deliveryName']));

  
  tableRow.appendChild(
    createTableAddress(
      orderData['deliveryAddress1'],
      orderData['deliveryAddress2'],
      orderData['deliveryAddress3'],
      orderData['deliveryPostcode'],
    )
  );

  tableRow.appendChild(tableData(orderData['deliveryPhoneNumber']));
  tableRow.appendChild(tableData(orderData['payment']));

 
  const td = document.createElement('td');
  const div = document.createElement('div');
  div.innerText = orderData['message'];
  td.appendChild(div);
  tableRow.appendChild(td);

  tableRow.appendChild(tableData(orderData['code']));

  const rowBackground = tableData("");
  rowBackground.classList = "tableRowBackground";
  tableRow.appendChild(rowBackground);

  return tableRow;

}


function createTableAddress(addressLine1, addressLine2, addressLine3, addressPostcode){

  const tableData = document.createElement('td');

  const wrapper = document.createElement('div');
  wrapper.classList = "tableAddressWrapper";

  const address1 = document.createElement('p');
  address1.innerHTML = addressLine1
  address1.classList = "tableAddressLineMain";

  const secondaryAddressWrapper = document.createElement('div');
  secondaryAddressWrapper.classList = "tableAddressLineSecondary";
  
  const address2 = document.createElement('p');
  address2.innerHTML = addressLine2 + ",&nbsp;";

  const address3 = document.createElement('p');
  address3.innerHTML = addressLine3 + ",&nbsp;";

  const postcode = document.createElement('p');
  postcode.innerText = addressPostcode;

  secondaryAddressWrapper.appendChild(address2);
  secondaryAddressWrapper.appendChild(address3);
  secondaryAddressWrapper.appendChild(postcode);
  
  wrapper.appendChild(address1);
  wrapper.appendChild(secondaryAddressWrapper);

  tableData.appendChild(wrapper);

  return tableData;

}


function tableData(value){

  const tableData = document.createElement('td');
  tableData.innerHTML = value;

  return tableData;

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


  runCard.addEventListener(('click'), async () => {

    const orders = await getRunStops(runStruct.stops);
    mergeStopsWithOrderData(runStruct.stops, orders);
    updateStopList(runStruct.stops);
    showRuns();

  });

  
  runStruct.runCard = runCard;

}

function createStopCard(stopData, stopNumberValue){

    console.log(stopData);
    console.log(stopNumberValue);


    const stopContainer = document.createElement('div');
    stopContainer.classList = "stopContainer";


    const stopNumber = document.createElement('p');
    stopNumber.classList = "stopNumber";
    stopNumber.innerText = stopNumberValue;

    const stopCard = document.createElement('div');
    stopCard.classList = "stopCard";


    const stopCustomerName = document.createElement('p');
    stopCustomerName.classList = "stopCustomerName";
    stopCustomerName.innerText = stopData['name'];

    const stopAddressLine1 = document.createElement('p');
    stopAddressLine1.classList = "stopAddressLine1";
    stopAddressLine1.innerText = stopData['address1'];


    const stopAddressWrapper = document.createElement('div');
    stopAddressWrapper.classList = "stopAddressWrapper";

    const stopAddressLine2 = document.createElement('p');
    stopAddressLine2.classList = "stopAddressLine2";
    stopAddressLine2.innerHTML = stopData['address2'] + ",&nbsp;";

    const stopAddressLine3 = document.createElement('p');
    stopAddressLine3.classList = "stopAddressLine3";
    stopAddressLine3.innerHTML = stopData['address3'] + ",&nbsp;";

    const stopPostcode = document.createElement('p');
    stopPostcode.classList = "stopPostcode";
    stopPostcode.innerText = stopData['postcode'];

    
    stopAddressWrapper.appendChild(stopAddressLine2);
    stopAddressWrapper.appendChild(stopAddressLine3);
    stopAddressWrapper.appendChild(stopPostcode);


    stopCard.appendChild(stopCustomerName);
    stopCard.appendChild(stopAddressLine1);
    stopCard.appendChild(stopAddressWrapper);


    stopContainer.appendChild(stopNumber);
    stopContainer.appendChild(stopCard);

    return stopContainer;

}

