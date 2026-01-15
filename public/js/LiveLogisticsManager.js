import { db, getDocuments, getDocument } from "/js/Firebase.js";
import { query, collection, doc, onSnapshot, Timestamp, where} from "firebase/firestore";
import { showNotification } from "./Notification";
import { bulkReadTransaction } from "./Firebase.js";

const driverList = document.getElementById("runList");

const drivers = new Map();

let GoogleAdvancedMarkerElement;
let GooglePinElement;
let GoogleMap;


let numberOfProgressedRuns;
let currentSelectedRunDriverID;

let map;

let currentSelectDriver = null;
let enRouteProgressedRunStructList = [];
let completedProgressedRunStructList = [];
let offlineProgressedRunStructList = [];
let progressedRunStructList = [];


initMap();
fetchProgressedRunsInfo();
// fetchDriverDocs();

async function fetchProgressedRunsInfo(){

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const progressedRunsDocs = await getDocuments(query(collection(db, "ProgressedRuns"), where("updatedAt", ">=", Timestamp.fromDate(startOfToday)), where("updatedAt", "<", Timestamp.fromDate(startOfTomorrow)))); 

  if(progressedRunsDocs.docs.length == 0){
    return;
  }

  numberOfProgressedRuns = progressedRunsDocs.docs.length;

  const driverIDs = [];

  for(let i = 0; i < numberOfProgressedRuns; i++){

    //get document id
    const documentID = progressedRunsDocs.docs[i].id
    const progressedRunData = progressedRunsDocs.docs[i].data();

    driverIDs.push(progressedRunData['driverID']);

    //setup listener on document
    addListenerToProgressedRunDocument(query(doc(db, 'ProgressedRuns', documentID)));
    addListenerToDriverDocument(progressedRunData['driverID']);

  }

  // fetchDriverDocs(driverIDs);

}

// async function fetchDriverDocs(driverIDs){

//   const driverDocs = await bulkReadTransaction(driverIDs, "/Drivers");

//   if(driverDocs == false){
//     showNotification("Error!", "Error fetching driver documents. Driver locations wont show on the map");
//     return;
//   }

//   for(let i = 0; i < driverDocs.docs.length; i++){

//     addListenerToDriverDocument(driverDocs[i].id);

//   }


// }


async function addListenerToDriverDocument(driverDocID){

  const driverDocRef = doc(db, 'Drivers', driverDocID);

  onSnapshot(driverDocRef, (doc) => {

    const driverData = doc.data();
    
    if(!isEmpty(drivers.get(doc.id))){
      driverData.marker = drivers.get(doc.id).marker;
    }

    //updates driver doc
    drivers.set(doc.id, driverData);

    console.log(drivers);

    //update position of marker on map
    updateDriverMarker(drivers.get(doc.id));

    if(currentSelectedRunDriverID == doc.id){
      updateMapCamera(driverData.location.latitude, driverData.location.longitude);
    }

  });

  //link driver doc to run


}

async function updateDriverMarker(driverData){

  if(isEmpty(driverData.location) || isEmpty(map)){
    return;
  }

  const location = {

    "lat": driverData.location.latitude,
    "lng": driverData.location.longitude,

  }


  if(!isEmpty(driverData.marker)){
    // console.log("removing driver marker");
    //remove current marker from map
    driverData.marker.map = null;
  }


  const ratio = 160/384;
  const width = 60;

  const heading = (driverData.location.heading + 90) % 360;

  let anchorY;
  let anchorX;


  //the image needs translating to place the center of the image on the coordinates
  const vanElement = document.createElement("img");
  vanElement.src = "/images/van.png"; // can be PNG, JPG, WebP, etc.
  vanElement.style.width = width + "px";
  vanElement.style.height = (width * ratio) + "px";
  // vanElement.style.transform = "";
  vanElement.style.transform = `rotate(${heading}deg) translateY(-50%) translateX(-50%)`; //+90 as the van picture is facing west

  // optional: allow CSS rotation
  vanElement.style.transition = "transform 0.3s linear";


  //add marker to map
  const marker = new GoogleAdvancedMarkerElement({
    map: map,
    position: location,
    content: vanElement,
    collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
  });

  driverData['marker'] = marker;

} 


async function initMap() {

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  GoogleMap = Map;
  GoogleAdvancedMarkerElement = AdvancedMarkerElement;
  GooglePinElement = PinElement;

  map = new Map(document.getElementById("map"), {
    center: { lat: 51, lng: -1 },
    zoom: 8,
    mapId: "298860eb89cd00b43e74dbd5",
  });

}


function addListenerToProgressedRunDocument(docRef){
  
  onSnapshot(docRef, (doc) => {

    //parses driver data and add its to driverScructList
    const progressedRunStruct = parseRunInfo(doc.data(), doc.id);
    createProgressedRunCard(progressedRunStruct);      
    updateProgressedRunsUIList(progressedRunStruct);

  });

}


function updateRunCard(oldprogressedRunStruct, newprogressedRunStruct){

  //update values of driver struct
  oldprogressedRunStruct.driverStatus = newprogressedRunStruct.driverStatus;
  oldprogressedRunStruct.nextStop = newprogressedRunStruct.nextStop;
  oldprogressedRunStruct.nextStopTitle = newprogressedRunStruct.nextStopTitle;
  oldprogressedRunStruct.statusColour = newprogressedRunStruct.statusColour;
  oldprogressedRunStruct.stopsTitle = newprogressedRunStruct.stopTitle;
  oldprogressedRunStruct.stopsRemaining = newprogressedRunStruct.stopsRemaining;

  //remove old children
  oldprogressedRunStruct.runCard.innerHTML = "";

  //needed as children are moved from one card to another not copied
  const noOfChildren = newprogressedRunStruct.runCard.children.length;

  for(let i = 0; i < noOfChildren ; i++){
    oldprogressedRunStruct.runCard.appendChild(newprogressedRunStruct.runCard.children[0]);

  }

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

function updateProgressedRunsUIList(progressedRunStruct){

  console.log("updateProgressedRunsUIList");

  const indexOfRunCard = progressedRunStructList.findIndex((run) => run.runID == progressedRunStruct.runID)

  //If in driver list already
  if(indexOfRunCard > - 1){

    console.log("In List");

    const newDriverStatus = progressedRunStruct.runStatus;
    const oldDriverStatus = progressedRunStructList[indexOfRunCard].runStatus;

    updateRunCard(progressedRunStructList[indexOfRunCard], progressedRunStruct);

    //does the card need updating or does the list need rebuilding as its status has changed
    if(newDriverStatus != oldDriverStatus){

       //update position of card in list
       orderDriverList();
    }

  }else{

    progressedRunStructList.push(progressedRunStruct);
    orderDriverList();
  
  }

}

function orderDriverList(){
  
  //if the all data about drivers has'nt been recieved
  if(numberOfProgressedRuns != progressedRunStructList.length){
    return;
  }

  console.log("orderDriverList");

  enRouteProgressedRunStructList = [];
  completedProgressedRunStructList = [];
  offlineProgressedRunStructList = [];

  //seperate each driver into list based of status
  for(const run of progressedRunStructList){

    switch(run.runStatus){

      case 'En route':
      case 'Online':
      case 'In Progress':
        enRouteProgressedRunStructList.push(run);
        break;
      
      case 'Completed':
        completedProgressedRunStructList.push(run);
        break;
      
      case 'Offline':
        offlineProgressedRunStructList.push(run);
        break;

    }

  }  

  //Organise each sublist alphabetically
  enRouteProgressedRunStructList.sort(sortAlphabetically);
  completedProgressedRunStructList.sort(sortAlphabetically);
  offlineProgressedRunStructList.sort(sortAlphabetically);

  progressedRunStructList = [];
  progressedRunStructList = progressedRunStructList.concat(enRouteProgressedRunStructList);
  progressedRunStructList = progressedRunStructList.concat(completedProgressedRunStructList);
  progressedRunStructList = progressedRunStructList.concat(offlineProgressedRunStructList);

  console.log(Object.assign({}, progressedRunStructList));
  progressedRunStructList.forEach((run) => { driverList.appendChild(run.runCard) });

} 


function parseRunInfo(runData, ID){

  switch(runData['runStatus']){

    case 'En route':

      runData['statusColour'] = "#3CBD00";
      break;
  
    case 'Offline':

      runData['statusColour'] = "#D70700";
      break;
    
    case 'Completed':  

      runData['statusColour'] = "#2881FF";
      runData['stopsTitle'] = "Total Stops";
      runData['nextStopTitle'] = "Time Completed";
      break;
    
    default:

      runData['statusColour'] = "";
      break;

  }

  const timestamp = runData['updatedAt'] != undefined && runData['updatedAt'] != null ? runData['updatedAt'].toDate().toLocaleString() : "00:00:00"

  const progressedRunStruct = {

    runID: ID,
    driverName: runData['driverName'],
    driverID: runData['driverID'],
    nextStop: getNextStop(runData['stops'], [(runData['currentStopNumber'] - 1)]), // to fix
    nextStopTitle: runData['nextStopTitle'],
    runName: runData['runName'],
    runStatus: runData['runStatus'],
    statusColour: runData['statusColour'],
    stopsTitle: runData['stopsTitle'],
    stopsRemaining: (runData['stops'].length - runData['currentStopNumber']) + 1, //+1 to show current stop as a stop thats remaining e.g on stop 10/10 it will say 1 stop remaining
    totalStops: runData['stops'].length,
    updatedAt: timestamp

  }

  return progressedRunStruct;

}

function getNextStop(stops, indexOfNextStop){

  const nextStop = {}
  const stopData = stops[indexOfNextStop]['stopData'];

  if(stopData['address1'] != "" || stopData['address1'] != null){
    nextStop['address1'] = stopData['address1'] + ",";
  }

  if(stopData['address2'] != "" || stopData['address2'] != null){
    nextStop['address2'] = stopData['address2'] + ",";
  }

  if(stopData['address3'] != "" || stopData['address3'] != null){
    nextStop['address3'] = stopData['address3'];
  }

  return nextStop;

}

function createProgressedRunCard(progressedRunStruct){

  const runCard = document.createElement('div');
  runCard.classList = "runCard";

  const topRow = document.createElement('div');
  topRow.classList = "row";

  const statusWrapper = document.createElement('div');
  statusWrapper.classList = "row flexOne noGap alignItemsCenter";

  const circleIcon = document.createElement('span');
  circleIcon.classList = "material-symbols-outlined";
  circleIcon.textContent = "circle";
  circleIcon.style.color = progressedRunStruct['statusColour'];

  const runStatus = document.createElement('p');
  runStatus.classList = "runStatus";
  runStatus.textContent = progressedRunStruct['runStatus'];

  statusWrapper.appendChild(circleIcon);
  statusWrapper.appendChild(runStatus);

  const driversNameString = progressedRunStruct['driverName'] == null || progressedRunStruct['driverName'] == undefined ? "unknown" : progressedRunStruct['driverName'].replace("@placeholder.com", "");

  const driverName = document.createElement('p');
  driverName.classList = "driverName flexTwo";
  driverName.textContent = driversNameString;

  topRow.appendChild(statusWrapper);
  topRow.appendChild(driverName);



  const runName = document.createElement('p');
  runName.classList = "runName";
  runName.textContent = progressedRunStruct['runName'];



  const bottomRow = document.createElement('div');
  bottomRow.classList = "row smallGap alignItemsTop";

  const columnLeft = document.createElement('div');
  columnLeft.classList = "column flexOne";

  const stopsRemaining = document.createElement('p');
  stopsRemaining.classList = "runInfoTitle";
  stopsRemaining.textContent = progressedRunStruct['stopsTitle'] == null ? "Stops Pending" : progressedRunStruct['stopsTitle'];

  const noOfStopsRemaining = document.createElement('p');
  noOfStopsRemaining.classList = "runInfo";
  noOfStopsRemaining.textContent = progressedRunStruct['stopsTitle'] == "Total Stops" ? progressedRunStruct['totalStops'] : progressedRunStruct['stopsRemaining'];

  columnLeft.appendChild(stopsRemaining);
  columnLeft.appendChild(noOfStopsRemaining);


  const columnRight = document.createElement('div');
  columnRight.classList = "column flexTwo";

  const nextStopTitle = document.createElement('p');
  nextStopTitle.classList = "runInfoTitle";
  nextStopTitle.textContent = progressedRunStruct['nextStopTitle'] == null ? "Next Stop" : progressedRunStruct['nextStopTitle'];


  const nextStopData = [];

  if(progressedRunStruct['nextStopTitle'] != "Time Completed"){

    if(progressedRunStruct['nextStop']['address1'] != undefined){

      const nextStopDataParagraph = document.createElement('p');
      nextStopDataParagraph.classList = "runInfo";
      nextStopDataParagraph.textContent = progressedRunStruct['nextStop']['address1'];
      nextStopData.push(nextStopDataParagraph);

    }

    if(progressedRunStruct['nextStop']['address2'] != undefined){

      const nextStopDataParagraph = document.createElement('p');
      nextStopDataParagraph.classList = "runInfo";
      nextStopDataParagraph.textContent = progressedRunStruct['nextStop']['address2'];
      nextStopData.push(nextStopDataParagraph);

    }

    if(progressedRunStruct['nextStop']['address3'] != undefined){

      const nextStopDataParagraph = document.createElement('p');
      nextStopDataParagraph.classList = "runInfo";
      nextStopDataParagraph.textContent = progressedRunStruct['nextStop']['address3'];
      nextStopData.push(nextStopDataParagraph);

    }


  }else{

    const nextStopDataParagraph = document.createElement('p');
    nextStopDataParagraph.classList = "runInfo";
    nextStopDataParagraph.textContent = progressedRunStruct['updatedAt'];
    nextStopData.push(nextStopDataParagraph);

  }

  columnRight.appendChild(nextStopTitle);

  for(let i = 0; i < nextStopData.length; i++){
    columnRight.appendChild(nextStopData[i]);
  }


  bottomRow.appendChild(columnLeft);
  bottomRow.appendChild(columnRight);


  runCard.appendChild(topRow);
  runCard.appendChild(runName);
  runCard.appendChild(bottomRow);

  //add driver card struct so it can be accessed and mutated later
  progressedRunStruct.runCard = runCard;

  addRunCardEventListener(progressedRunStruct);

}

function addRunCardEventListener(progressedRunStruct){

  const runCard = progressedRunStruct.runCard;

  runCard.addEventListener('click', () => {

    //find driver location
    const driver = drivers.get(progressedRunStruct.driverID);

    if(driver.location == undefined || driver.location == null){
      showNotification("Error!", "Driver " + driver['driverName']  + " does not have location tracking turned on");
      return;
    }

    if(currentSelectDriver != null){
      currentSelectDriver.classList.remove('selectedDriverInfoCard');
    }

    //if already selected
    if(currentSelectDriver == progressedRunStruct.runCard){
      console.log("already selected");
      currentSelectedRunDriverID = null;
      currentSelectDriver = null;
      return;
    }


    runCard.classList.add('selectedDriverInfoCard');
    currentSelectDriver = runCard;
  
    currentSelectedRunDriverID = progressedRunStruct.driverID;

    //update camera location of map
    updateMapCamera(driver.location.latitude, driver.location.longitude);
     
  });

}

function updateMapCamera(latitude, longitude){

  if(isEmpty(latitude) || isEmpty(longitude)){
    console.log("invalid coordinates to update map camera");
    return;
  }

  map.setCenter(new google.maps.LatLng(latitude, longitude));
  map.setZoom(16);

}


function isEmpty(value){

  if(value == null || value == undefined || value == ""){
    return true;
  }

  return false;

}