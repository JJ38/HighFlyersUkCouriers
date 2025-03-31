import { db, getDocuments } from "/js/Firebase.js";
import { query, collection } from "firebase/firestore";


const enRouteDriverList = document.getElementById("enRouteDriverList");
const completedDriverList = document.getElementById("completedDriverList");
const offlineDriverList = document.getElementById("offlineDriverList");


let map;


let currentSelectDriver = null;
let enRouteDriverStructList = [];
let completedDriverStructList = [];
let offlineDriverStructList = [];


//initMap();
fetchDriverInfo();


function addDriverCardEventListener(driverInfoCard){

  driverInfoCard.addEventListener('click', () => {
        
    if(currentSelectDriver != null){
      currentSelectDriver.classList.remove('selectedDriverInfoCard');
    }

    driverInfoCard.classList.add('selectedDriverInfoCard');
    currentSelectDriver = driverInfoCard;
    
    //fetchDriverRuns();
     
  });

}

async function initMap() {

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

}

async function fetchDriverInfo(){

  const driverData = await getDocuments(query(collection(db, "Drivers")));

  for(let i = 0; i < driverData.docs.length; i++){
    //Parse/convert driver info
    parseDriverInfo(driverData.docs[i].data());

  }

  orderDriverList();
  buildDriverListUI();

  //loop through driver info

  //create ui for each driver and append to list


}

const sortAlphabetically = 

  (a, b) => {

    if (a.runName < b.runName) {
      return -1;
    }
    if (a.runName > b.runName) {
      return 1;
    }

    return 0;
  }


function buildDriverListUI(){

  //build En Route drivers
  enRouteDriverStructList.forEach((x) => { enRouteDriverList.appendChild(createDriverInfoCard(x)) });

  //build Completed drivers
  completedDriverStructList.forEach((x) => { completedDriverList.appendChild(createDriverInfoCard(x)) });

  //build Offline drivers
  offlineDriverStructList.forEach((x) => { offlineDriverList.appendChild(createDriverInfoCard(x)) });

}

function orderDriverList(sublist){
  
  //check which sublist to rebuild
  if(sublist == null){

    enRouteDriverStructList.sort(sortAlphabetically);
    completedDriverStructList.sort(sortAlphabetically);
    offlineDriverStructList.sort(sortAlphabetically);

  }

  switch(sublist){

    case 'En Route':
      //add driver card to list
      enRouteDriverStructList.sort(sortAlphabetically);
      break;

    case 'Completed':

      completedDriverStructList.sort(sortAlphabetically);
      break;
    
    case 'Offline':

      offlineDriverStructList.sort(sortAlphabetically);
      break;
  }

} 


function parseDriverInfo(driverData){

  switch(driverData['driverStatus']){

    case 'En Route':

      driverData['statusColour'] = "#3CBD00";
      break;
  
    case 'Offline':

      driverData['statusColour'] = "#D70700";
      break;
    
    case 'Completed':  

      driverData['statusColour'] = "#2881FF";
      driverData['stopsTitle'] = "Total Stops";
      driverData['nextStopTitle'] = "Time Completed";
      break;
    
    default:

      driverData['statusColour'] = "";
      break;

  }

  const driverStruct = {

    driverName: driverData['driverName'],
    driverStatus: driverData['driverStatus'],
    nextStop: driverData['nextStop'],
    runName: driverData['runName'],
    statusColour: driverData['statusColour'],
    stopsRemaining: 11

  }

  //append to sub list dependant on status;
  switch(driverStruct.driverStatus){

    case 'En Route':
      //add driver card to list
      enRouteDriverStructList.push(driverStruct);
      break;

    case 'Completed':

      completedDriverStructList.push(driverStruct);
      break;
  
    case 'Offline':

      offlineDriverStructList.push(driverStruct);
      break;

  }

  return driverStruct;

}

async function fetchDriverRuns(){

  


  return 0;

}


function createDriverInfoCard(driverStruct){

  const driverInfoCard = document.createElement('div');
  driverInfoCard.classList = "driverInfoCard";

  const topRow = document.createElement('div');
  topRow.classList = "row";

  const statusWrapper = document.createElement('div');
  statusWrapper.classList = "row flexOne noGap alignItemsCenter";

  const circleIcon = document.createElement('span');
  circleIcon.classList = "material-symbols-outlined";
  circleIcon.textContent = "circle";
  circleIcon.style.color = driverStruct['statusColour'];

  const driverStatus = document.createElement('p');
  driverStatus.classList = "driverStatus";
  driverStatus.textContent = driverStruct['driverStatus'];

  statusWrapper.appendChild(circleIcon);
  statusWrapper.appendChild(driverStatus);

  const driverName = document.createElement('p');
  driverName.classList = "driverName flexTwo";
  driverName.textContent = driverStruct['driverName'];

  topRow.appendChild(statusWrapper);
  topRow.appendChild(driverName);



  const runName = document.createElement('p');
  runName.classList = "runName";
  runName.textContent = driverStruct['runName'];



  const bottomRow = document.createElement('div');
  bottomRow.classList = "row";

  const columnLeft = document.createElement('div');
  columnLeft.classList = "column flexOne";

  const stopsRemaining = document.createElement('p');
  stopsRemaining.classList = "runInfoTitle";
  stopsRemaining.textContent = driverStruct['stopsTitle'] == null ? "Stops Remaining" : driverStruct['stopsTitle'];

  const noOfStopsRemaining = document.createElement('p');
  noOfStopsRemaining.classList = "runInfo";
  noOfStopsRemaining.textContent = driverStruct['stopsRemaining'];

  columnLeft.appendChild(stopsRemaining);
  columnLeft.appendChild(noOfStopsRemaining);


  const columnRight = document.createElement('div');
  columnRight.classList = "column flexTwo";

  const nextStopTitle = document.createElement('p');
  nextStopTitle.classList = "runInfoTitle";
  nextStopTitle.textContent = driverStruct['nextStopTitle'] == null ? "Next Stop" : driverStruct['nextStopTitle'];

  const nextStopData = document.createElement('p');
  nextStopData.classList = "runInfo";
  nextStopData.textContent = driverStruct['nextStop'];
  
  columnRight.appendChild(nextStopTitle);
  columnRight.appendChild(nextStopData);


  bottomRow.appendChild(columnLeft);
  bottomRow.appendChild(columnRight);


  driverInfoCard.appendChild(topRow);
  driverInfoCard.appendChild(runName);
  driverInfoCard.appendChild(bottomRow);

  addDriverCardEventListener(driverInfoCard);

  return driverInfoCard;

}



