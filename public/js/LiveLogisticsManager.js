import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, doc, onSnapshot} from "firebase/firestore";

const driverList = document.getElementById("driverList");

let numberOfDrivers;

let map;

let currentSelectDriver = null;
let enRouteDriverStructList = [];
let completedDriverStructList = [];
let offlineDriverStructList = [];
let driverStructList = [];

let subscriptionListeners = [];

let initialQuery = false;

//initMap();
fetchDriverInfo();

async function fetchDriverInfo(){

  const driverData = await getDocuments(query(collection(db, "Drivers")));
  numberOfDrivers = driverData.docs.length;

  for(let i = 0; i < numberOfDrivers; i++){

    //get document id
    const documentID = driverData.docs[i].id
    //setup listener on document
    addListenerToDocument(query(doc(db, 'Drivers', documentID)));

  }

}

async function initMap() {

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

}


function addListenerToDocument(docRef){

  onSnapshot(docRef, (doc) => {

    //parses driver data and add its to driverScructList
    const driverStruct = parseDriverInfo(doc.data(), docRef);
    createDriverCard(driverStruct);      

    //update UI
    updateDriverListUI(driverStruct);

  });

}


function updateDriverCard(oldDriverStruct, newDriverStruct){

  //update values of driver struct
  oldDriverStruct.driverStatus = newDriverStruct.driverStatus;
  oldDriverStruct.nextStop = newDriverStruct.nextStop;
  oldDriverStruct.nextStopTitle = newDriverStruct.nextStopTitle;
  oldDriverStruct.statusColour = newDriverStruct.statusColour;
  oldDriverStruct.stopsTitle = newDriverStruct.stopTitle;
  oldDriverStruct.stopsRemaining = newDriverStruct.stopsRemaining;

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

const sortAlphabetically = (a, b) => {

  if (a.runName < b.runName) {
    return -1;
  }

  if (a.runName > b.runName) {
    return 1;
  }

  return 0;
}

function updateDriverListUI(driverStruct){

  const indexOfDriverCard = driverStructList.findIndex((driver) => driver.driverID == driverStruct.driverID)

  //If in driver list already
  if(indexOfDriverCard > - 1){

    console.log("In List");

    const newDriverStatus = driverStruct.driverStatus;
    const oldDriverStatus = driverStructList[indexOfDriverCard].driverStatus;

    updateDriverCard(driverStructList[indexOfDriverCard], driverStruct);

    //does the card need updating or does the list need rebuilding as its status has changed
    if(newDriverStatus != oldDriverStatus){

       //update position of card in list
       orderDriverList();
    }

  }else{

    driverStructList.push(driverStruct);
    orderDriverList();
  
  }

}

function orderDriverList(){
  
  //if the all data about drivers has'nt been recieved
  if(numberOfDrivers != driverStructList.length){
    return;
  }

  console.log("orderDriverList");

  enRouteDriverStructList = [];
  completedDriverStructList = [];
  offlineDriverStructList = [];

  //seperate each driver into list based of status
  for(const driver of driverStructList){

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

  //Organise each sublist alphabetically
  enRouteDriverStructList.sort(sortAlphabetically);
  completedDriverStructList.sort(sortAlphabetically);
  offlineDriverStructList.sort(sortAlphabetically);

  driverStructList = [];
  driverStructList = driverStructList.concat(enRouteDriverStructList);
  driverStructList = driverStructList.concat(completedDriverStructList);
  driverStructList = driverStructList.concat(offlineDriverStructList);

  console.log(Object.assign({}, driverStructList));
  driverStructList.forEach((driver) => { driverList.appendChild(driver.driverCard) });

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

  //add driver card struct so it can be accessed and mutated later
  driverStruct.driverCard = driverCard;

  addDriverCardEventListener(driverCard);

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


