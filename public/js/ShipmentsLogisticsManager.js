
import { db, getDocuments } from "/js/Firebase.js";
import { query, collection } from "firebase/firestore";

const liveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const shipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");
const unassignedOrdersButton = document.getElementById("unassignedOrdersCard");
// const runCards = document.querySelectorAll('.runCard');
const runCardList = document.getElementById("runCardList");


// let selectableCards = Array.from(runCards);
// selectableCards = selectableCards.concat(unassignedOrdersButton);

let currentSelectedRun = null;
let map;

let runStructList = [];


// initMap();
// addEventListeners();
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

async function init(){

  await fetchShipmentRuns();
  runStructList.sort(sortAlphabetically);
  
  for(let i = 0; i < runStructList.length; i++){

    runCardList.appendChild(runStructList[i].runCard);

  }

}

async function fetchShipmentRuns(){

  const shipmentData = await getDocuments(query(collection(db, "Runs")));
  const numberOfRuns = shipmentData.docs.length;

  for(let i = 0; i < numberOfRuns; i++){

    const runStruct = parseRunInfo(shipmentData.docs[i].data());
    createRunCard(runStruct);
    addEventListener(runStruct.runCard);
    runStructList.push(runStruct);

  } 

}

function parseRunInfo(runDocument){
  
  const runStruct = {

    assignedDriver: runDocument['assignedDriver'],
    fuelCost: runDocument['fuelCost'],
    totalStops: runDocument['totalStops'],
    runName: runDocument['runName'],
    runWeek: runDocument['runWeek'],
 
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

