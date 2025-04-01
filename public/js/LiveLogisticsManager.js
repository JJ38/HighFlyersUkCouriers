import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, doc, onSnapshot} from "firebase/firestore";


const enRouteDriverList = document.getElementById("enRouteDriverList");
const completedDriverList = document.getElementById("completedDriverList");
const offlineDriverList = document.getElementById("offlineDriverList");

let map;

let currentSelectDriver = null;
let enRouteDriverStructList = [];
let completedDriverStructList = [];
let offlineDriverStructList = [];
let driverStructList = [];

let initialQuery = false;

//initMap();
fetchDriverInfo();

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

    //get document id
    const documentID = driverData.docs[i].id
    //setup listener on document
    addListenerToDocument(query(doc(db, 'Drivers', documentID)));

  }

}


function addListenerToDocument(docRef){

  const unsub = onSnapshot(docRef, (doc) => {

    console.log("Current data: ", doc.data());
    //parses driver data and adds it to corrosponding driver list based on status
    const driverStruct = parseDriverInfo(doc.data(), docRef);
    const driverCard = createDriverCard(driverStruct);
    buildDriverListUI(driverStruct);
    
  });

}

function updateDriverCard(oldDriverStruct, newDriverStruct){

  //remove old children
  oldDriverStruct.driverCard.innerHTML = "";

  //needed as children are moved from one card to another not copied
  const noOfChildren = newDriverStruct.driverCard.children.length;

  for(let i = 0; i < noOfChildren ; i++){
    oldDriverStruct.driverCard.appendChild(newDriverStruct.driverCard.children[0]);

  }

}

async function fetchDriverRuns(){


  return 0;

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


function buildDriverListUI(driverStruct){

  const indexOfDriverCard = driverStructList.findIndex((driver) => driver.driverID == driverStruct.driverID)

  if(indexOfDriverCard > - 1){

    //does the card need updating or does the list need rebuilding as its status has changed
    const newDriverStatus = driverStruct.driverStatus;
    const oldDriverStatus = driverStructList[indexOfDriverCard].driverStatus;

    if(newDriverStatus == oldDriverStatus){
      //update card only
      updateDriverCard(driverStructList[indexOfDriverCard], driverStruct);
      return;
    }
    else{
      //update list
      orderDriverList();
    }

    driverStructList[indexOfDriverCard] = driverStruct;

  }else{

    driverStructList.push(driverStruct);
    orderDriverList();
  }

  //remove current driver cards
  enRouteDriverList.innerHTML = "";
  completedDriverList.innerHTML = "";
  offlineDriverList.innerHTML = "";

  console.log(enRouteDriverStructList);

  //build En Route drivers
  enRouteDriverStructList.forEach((x) => { enRouteDriverList.appendChild(createDriverCard(x)) });

  //build Completed drivers
  completedDriverStructList.forEach((x) => { completedDriverList.appendChild(createDriverCard(x)) });

  //build Offline drivers
  offlineDriverStructList.forEach((x) => { offlineDriverList.appendChild(createDriverCard(x)) });

}

function orderDriverList(){

  console.log("rebuilding driver list");

  enRouteDriverStructList = [];
  completedDriverStructList = [];
  offlineDriverStructList = [];

  //Seperate drivers into each list based on driverstatus
  for(const driver of driverStructList){

    console.log(driver);

    switch(driver.driverStatus){

      case 'En Route':

        enRouteDriverStructList.push(driver);
        break;

      case 'Completed':

        completedDriverStructList.push(driver);
        break;

      case 'Offline':

        offlineDriverStructList.push(driver);
        break;
    }

  }

  enRouteDriverStructList.sort(sortAlphabetically);
  completedDriverStructList.sort(sortAlphabetically);
  offlineDriverStructList.sort(sortAlphabetically);

  console.log(enRouteDriverStructList);
  console.log(completedDriverStructList);
  console.log(offlineDriverStructList);

} 




function parseDriverInfo(driverData, ID){

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

    driverID: ID,
    driverName: driverData['driverName'],
    driverStatus: driverData['driverStatus'],
    nextStop: driverData['nextStop'],
    nextStopTitle: driverData['nextStopTitle'],
    runName: driverData['runName'],
    statusColour: driverData['statusColour'],
    stopsTitle: driverData['stopsTitle'],
    stopsRemaining: driverData['stopsRemaining']

  }

  return driverStruct;

}

function createDriverCard(driverStruct){

  const driverCard = document.createElement('div');
  driverCard.classList = "driverCard";

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


  driverCard.appendChild(topRow);
  driverCard.appendChild(runName);
  driverCard.appendChild(bottomRow);

  // //add driver card struct so it can be accessed and mutated later
  driverStruct.driverCard = driverCard;
  console.log(driverStruct);
  addDriverCardEventListener(driverCard);


  return driverCard;

}

function addDriverCardEventListener(driverCard){

  driverCard.addEventListener('click', () => {
        
    if(currentSelectDriver != null){
      currentSelectDriver.classList.remove('selectedDriverInfoCard');
    }

    driverCard.classList.add('selectedDriverInfoCard');
    currentSelectDriver = driverCard;
    
    fetchDriverRuns();
     
  });

}


