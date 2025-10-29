import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, doc, onSnapshot} from "firebase/firestore";

const driverList = document.getElementById("driverList");

let numberOfProgressedRuns;

let map;

let currentSelectDriver = null;
let enRouteProgressedRunStructList = [];
let completedProgressedRunStructList = [];
let offlineProgressedRunStructList = [];
let progressedRunStructList = [];

let subscriptionListeners = [];

let initialQuery = false;

//initMap();
fetchProgressedRunsInfo();

async function fetchProgressedRunsInfo(){

  const progressedRunsData = await getDocuments(query(collection(db, "ProgressedRuns")));
  numberOfProgressedRuns = progressedRunsData.docs.length;

  console.log(numberOfProgressedRuns);

  for(let i = 0; i < numberOfProgressedRuns; i++){

    //get document id
    const documentID = progressedRunsData.docs[i].id
    //setup listener on document
    addListenerToDocument(query(doc(db, 'ProgressedRuns', documentID)));

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
  
  console.log("addListenerToDocument");
  onSnapshot(docRef, (doc) => {

    console.log("update for " + doc.id);

    //parses driver data and add its to driverScructList
    const progressedRunStruct = parseRunInfo(doc.data(), doc.id);
    createProgressedRunCard(progressedRunStruct);      
    console.log(progressedRunStruct.runCard);
    //update UI
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

  const progressedRunStruct = {

    runID: ID,
    driverName: runData['driverName'],
    nextStop: getNextStop(runData['stops'], [(runData['currentStopNumber'] - 1)]), // to fix
    nextStopTitle: runData['nextStopTitle'],
    runName: runData['runName'],
    runStatus: runData['runStatus'],
    statusColour: runData['statusColour'],
    stopsTitle: runData['stopsTitle'],
    stopsRemaining: (runData['stops'].length - runData['currentStopNumber']) + 1, //+1 to show current stop as a stop thats remaining e.g on stop 10/10 it will say 1 stop remaining
    totalStops: runData['stops'].length,
    updatedAt: runData['updatedAt'].toDate().toLocaleString()

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

  const driverName = document.createElement('p');
  driverName.classList = "driverName flexTwo";
  driverName.textContent = progressedRunStruct['driverName'].replace("@placeholder.com", "");

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

  addRunCardEventListener(runCard);

}

function addRunCardEventListener(runCard){

  runCard.addEventListener('click', () => {
        
    if(currentSelectDriver != null){
      currentSelectDriver.classList.remove('selectedDriverInfoCard');
    }

    runCard.classList.add('selectedDriverInfoCard');
    currentSelectDriver = runCard;
    
    fetchDriverRuns();
     
  });

}


