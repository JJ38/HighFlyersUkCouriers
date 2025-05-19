import { db, getDocuments, getDocument } from "/js/Firebase.js";
import { query, collection, where, limit, orderBy, doc, addDoc, writeBatch } from "firebase/firestore";

const liveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const shipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");
const unassignedOrdersButton = document.getElementById("unassignedOrdersCard");

const createShipmentWidget = document.getElementById("create_shipment_widget");
const shipmentDeliveryWeekInput = document.getElementById('shipment_delivery_week');
const shipmentTypeInput = document.getElementById('shipment_run_type');
const shipmentNameInput = document.getElementById('shipment_name');

const cancelCreateShipmentButton = document.getElementById("cancel_create_shipment");
const saveCreateShipmentButton = document.getElementById("save_create_shipment");


// const runCards = document.querySelectorAll('.runCard');
const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('select_shipment');


// let selectableCards = Array.from(runCards);
// selectableCards = selectableCards.concat(unassignedOrdersButton);

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
  console.log(runData.data());
  const runStruct = parseRunInfo(runData.data());
  createRunCard(runStruct);
  addEventListener(runStruct.runCard);
  runStructList.push(runStruct);

}

async function init(){

  //fetch shipments 
  const shipments = await getDocuments(query(collection(db, 'Shipments')));

  for(let i = 0; i < shipments.docs.length; i++){

    console.log(shipments.docs[i].data());
    //add option to select element
    const shipmentOption = document.createElement('option');
    shipmentOption.value = shipments.docs[i].data()['shipmentName'];
    shipmentOption.innerText = shipments.docs[i].data()['shipmentName'];

    selectedShipment.appendChild(shipmentOption);
  }

}


function addEventListeners(){

  if(selectedShipment != null){

    selectedShipment.addEventListener('input', () => {
      //change
      console.log("select");
      if(selectedShipment.value == "CREATE_SHIPMENT"){

        createShipment();
        return;
      }

      console.log(selectedShipment.value);
      updateRunsList(selectedShipment.value);

    });

  }

  if(cancelCreateShipmentButton != null){

    cancelCreateShipmentButton.addEventListener('click', () => {

        hideCreateShipmentUI();

    });

  }

  
  if(saveCreateShipmentButton != null){

    saveCreateShipmentButton.addEventListener('click', async () => {

      await generateShipment();

    });

  }

}


function createShipment(){

  //show ui for creating shipment
  showCreateShipmentUI();

}


function showCreateShipmentUI(){

  createShipmentWidget.classList.remove('hidden');

}


function hideCreateShipmentUI(){

  selectedShipment.value = "";
  createShipmentWidget.classList.add('hidden');

}


async function generateShipment(){

  //fetch postcode run definitions
  const docRef = doc(db, 'Settings', 'runDefinitions');
  const runDefinitions = await getDocument(docRef);
  console.log(runDefinitions.data());

  //get runs by delivery week
  const q = query(collection(db, "Orders"), orderBy('ID', 'asc'), where("deliveryWeek", "==", parseInt(shipmentDeliveryWeekInput.value)));
  const orderData = await getDocuments(q);
  console.log(orderData.docs);

  //organise orders into defined runs based on runtype and postcode
  generateRuns(runDefinitions.data(), orderData.docs);

  const storeShipmentResult = await storeShipment();
  console.log(storeShipmentResult);

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

        console.log(runDefinitions[orderPostcode.substring(0,4)] + " - " +  orderPostcode.substring(0,4));
        runName = runDefinitions[orderPostcode.substring(0,4)];

      }else if(runDefinitions[orderPostcode.substring(0,3)] != null){

        console.log(runDefinitions[orderPostcode.substring(0,3)] + " - " +  orderPostcode.substring(0,3));
        runName = runDefinitions[orderPostcode.substring(0,3)];

      }else if(runDefinitions[orderPostcode.substring(0,2)] != null){

        console.log(runDefinitions[orderPostcode.substring(0,2)] + " - " +  orderPostcode.substring(0,3));
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
      totalStops: "",
      runName: runName,
      runWeek: parseInt(shipmentDeliveryWeekInput.value),
      stops: []

    }

    run.stops.push(orderData.id);
    runStructList.push(run);

    return;
  }

  run.stops.push(orderData.id);

}


async function updateRunsList(shipmentName){

  runStructList = [];

  await fetchShipment(shipmentName);

  console.log(runStructList);

  runStructList.sort(sortAlphabetically);

  runCardList.innerHTML = "";

  if(runStructList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runStructList.length; i++){

    runCardList.appendChild(runStructList[i].runCard);

  }

}


async function storeShipment(){

  const batch = writeBatch(db);

  let runDocRefs = [];

  for(let i = 0; i < runStructList.length; i++){

    console.log(runStructList[i]);
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

  // Promise.all()

  let promises = [];

  for(let i = 0; i < numberOfRuns; i++){

    promises.push(fetchRun(shipmentRunsDocumentIDs[i]));

  } 
  
  await Promise.all(promises);
  console.log("promise.all  completed");
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

