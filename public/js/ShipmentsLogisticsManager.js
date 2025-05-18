
import { db, getDocuments, getDocument } from "/js/Firebase.js";
import { query, collection, where, limit, doc } from "firebase/firestore";

const liveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const shipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");
const unassignedOrdersButton = document.getElementById("unassignedOrdersCard");

const createShipmentWidget = document.getElementById("create_shipment_widget");
const cancelCreateShipmentButton = document.getElementById("cancel_create_shipment");
const saveCreateShipmentButton = document.getElementById("save_create_shipment");


// const runCards = document.querySelectorAll('.runCard');
const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('shipmentGroups');


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

  if(selectedShipment == null){
    console.log("selected shipment == null");
    return;
  }

  const shipmentName = selectedShipment.value;
  updateRunsList(shipmentName);

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

      updateRunsList(selectedShipment.value);

    });

  }

  if(cancelCreateShipmentButton != null){

    cancelCreateShipmentButton.addEventListener('click', () => {

        hideCreateShipmentUI();

    });

  }

  
  if(saveCreateShipmentButton != null){

    saveCreateShipmentButton.addEventListener('click', () => {

      
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


async function updateRunsList(shipmentName){

  runStructList = [];

  await fetchShipment(shipmentName);

  runStructList.sort(sortAlphabetically);

  runCardList.innerHTML = "";

  if(runStructList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runStructList.length; i++){

    runCardList.appendChild(runStructList[i].runCard);

  }

}


async function fetchShipment(selectedShipment){

  const shipmentData = await getDocuments(query(collection(db, 'Shipments'), where("shipmentName", "==", selectedShipment), limit(1)));

  console.log(shipmentData.empty);
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
    totalStops: runData['totalStops'],
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
  totalStops.innerText = runStruct.totalStops;

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

