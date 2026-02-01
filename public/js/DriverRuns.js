import { db, auth, getDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { showNotification } from "/js/Notification.js"; 

const driverRunsList = document.getElementById('driver_runs_list');
const runStopsList = document.getElementById('run_stops_list');
const runStopsListContainer = document.getElementById('run_stops_list_container');
const closeRunStopsListButton = document.getElementById('close_run_stops_list_button');


var uid;

addEventListeners();

onAuthStateChanged(auth, (user) => {
  
  if (user) {
    // User is signed in
    uid = user.uid;

    if(uid == null || db == null){
      showNotification("Error!", "Error fetching driver document")
    }
  
    const docRef = doc(db, "Drivers", uid);

    getDocument(docRef).then( async (doc) => {
        const driverData = doc.data();
        await parseDriverDoc(driverData);
        createUI(driverData);
    });
    
  } else {
    // User is signed out
    showNotification("Error!", "Unauthenticated");
  }

});


function addEventListeners(){

    if(closeRunStopsListButton != null){
        
        closeRunStopsListButton.addEventListener('click', () => {
            runStopsListContainer.classList.add('hidden');
        });

    }

}


async function parseDriverDoc(driverData){

    if(driverData == null || driverData == undefined){
        showNotification("Error!", "No driver data found");
        return;
    }

    let progressedRuns = driverData['progressedRuns'];
    let assignedRuns = driverData['assignedRuns'];

    console.log(assignedRuns);

    let promises = [];

    for(let i = 0; i < progressedRuns.length; i++){

        const uid = progressedRuns[i]['progressedRunID'];
        const progressedRunDocRef = doc(db, "ProgressedRuns", uid);
        const document = getDocument(progressedRunDocRef)
        progressedRuns[i]['doc'] = document;
        promises.push(document);

    }

    for(let i = 0; i < assignedRuns.length; i++){

        const uid = assignedRuns[i]['runID'];
        const assignedRunDocRef = doc(db, "Runs", uid);
        const document = getDocument(assignedRunDocRef)
        assignedRuns[i]['doc'] = document;
        promises.push(document);

    }


    await Promise.all(promises);

    console.log(driverData);

    for(let i = 0; i < progressedRuns.length; i++){
        progressedRuns[i]['doc'] = await progressedRuns[i]['doc'];
    }

    for(let i = 0; i < assignedRuns.length; i++){
        assignedRuns[i]['doc'] = await assignedRuns[i]['doc'];
    }
}


function createUI(driverData){

    const runs = driverData['progressedRuns'].concat(driverData['assignedRuns']);
    console.log(runs);
    for(let i = 0; i < runs.length; i++){

        const runCard = createRunCard(runs[i]);
        addListenerToRunCard(runCard, runs[i]['doc']);
        driverRunsList.appendChild(runCard);
        
    }


}


function addListenerToRunCard(runCard, runDoc){

    runCard.addEventListener('click', () => {

        //clear stops already on list
        runStopsList.innerHTML = "";

        const runData = runDoc.data();
        const stops = runData['stops'];

        for(let  i = 0; i < stops.length; i++){

            const stopMetaDataContainer = createStopMetaData(stops[i]);
            const stopCard = createStopCard(stops[i], stopMetaDataContainer);
            runStopsList.appendChild(stopCard);

        }

        runStopsListContainer.classList.remove('hidden');

    });

}


function createRunCard(driverData){

    const driverDocument = driverData['doc'];
    const documentData = driverDocument.data();

    if(documentData == null || documentData == undefined){
        const unknown = document.createElement('p');
        unknown.textContent = "Unknown run";
        return unknown;
    }

    const card = document.createElement('div');
    card.classList = "runCard"

    const runName = document.createElement('p');
    runName.textContent = documentData['runName'];

    const shipmentName = document.createElement('p');
    shipmentName.textContent = documentData['shipmentName'];

    const runStatus = document.createElement('p');

    let status = "New";

    if(documentData['runStatus'] != undefined){
        status = documentData['runStatus'];      
    }

    runStatus.textContent = status;


    card.appendChild(shipmentName);
    card.appendChild(runName);
    card.appendChild(runStatus);


    return card;

}

function createStopCard(stop, stopMetaDataContainer){

    console.log(stop);

    const stopData = stop['stopData'];

    const stopCardWrapper = document.createElement('div');
    stopCardWrapper.classList = "stopCardWrapper";


    const stopCard = document.createElement('div');
    stopCard.classList = "stopCard";



    const stopNumber = document.createElement('p');
    stopNumber.textContent = "Stop number: " + stop['stopNumber'];


    const stopCustomerName = document.createElement('p');
    stopCustomerName.classList = "stopCustomerName";
    stopCustomerName.innerText = stopData['name'];



    const animalTypeQuantityContainer = document.createElement('div'); 
    animalTypeQuantityContainer.classList = "animalTypeQuantityContainer";

    const animalType = document.createElement('p');
    animalType.innerText = stopData['animalType'];

    const quantity = document.createElement('p');
    quantity.innerText = "x" + stopData['quantity'];

    animalTypeQuantityContainer.appendChild(animalType);
    animalTypeQuantityContainer.appendChild(quantity);


    const collectionAddressContainer = createStopAddress(stop, "collection");
    const deliveryAddressContainer = createStopAddress(stop, "delivery");

    stopCard.appendChild(stopMetaDataContainer);
    stopCard.appendChild(stopNumber);
    stopCard.appendChild(stopCustomerName);
    stopCard.appendChild(animalTypeQuantityContainer);
    stopCard.appendChild(collectionAddressContainer);
    stopCard.appendChild(deliveryAddressContainer);


    stopCardWrapper.appendChild(stopCard);

    return stopCardWrapper;

}

function createStopMetaData(stop){

  const stopData = stop['stopData'];

  const stopMetaDataContainer = document.createElement('div');
  stopMetaDataContainer.classList = "stopMetaDataContainer";

  const orderID = document.createElement('p');
  orderID.classList = "orderID";
  orderID.innerText = "#" + stopData['ID'];

  const stopType = document.createElement('p');
  stopType.classList = "stopType";
  stopType.innerText = stop['stopType'] == "collection" ? "Collection" : stop['stopType'] == "delivery" ? "Delivery" : stop['stopType'];

  stopMetaDataContainer.appendChild(orderID);
  stopMetaDataContainer.appendChild(stopType);

  return stopMetaDataContainer;

}


function createStopAddress(stop, stopType){

    let address1;
    let address2;
    let address3;
    let postcode;

    const orderData = stop['orderData'];
    const isStopAddress = stop['stopType'] == stopType;

    const container = document.createElement('div');

    if(stopType == "collection"){

        address1 = orderData['collectionAddress1'];
        address2 = orderData['collectionAddress2'];
        address3 = orderData['collectionAddress3'];
        postcode = orderData['collectionPostcode'];

    }else{

        address1 = orderData['deliveryAddress1'];
        address2 = orderData['deliveryAddress2'];
        address3 = orderData['deliveryAddress3'];
        postcode = orderData['deliveryPostcode'];

    }



    if(isStopAddress){

        if(stopType == "collection"){
            container.classList.add('collectionAddress');
        }else{
            container.classList.add('deliveryAddress');
        }

    }


    const stopTypeTitle = document.createElement('p');
    stopTypeTitle.innerText = stopType + " address :";


    const stopAddressLine1 = document.createElement('p');
    stopAddressLine1.classList = "stopAddressLine1 paddingLeftTwenty";
    stopAddressLine1.innerText = address1;


    const stopAddressWrapper = document.createElement('div');
    stopAddressWrapper.classList = "stopAddressWrapper paddingLeftTwenty";

    const stopAddressLine2 = document.createElement('p');
    stopAddressLine2.classList = "stopAddressLine2";
    stopAddressLine2.innerHTML = address2 + ",&nbsp;";

    const stopAddressLine3 = document.createElement('p');
    stopAddressLine3.classList = "stopAddressLine3";
    stopAddressLine3.innerHTML = address3 + ",&nbsp;";

    const stopPostcode = document.createElement('p');
    stopPostcode.classList = "stopPostcode";
    stopPostcode.innerText = postcode;


    stopAddressWrapper.appendChild(stopAddressLine2);
    stopAddressWrapper.appendChild(stopAddressLine3);
    stopAddressWrapper.appendChild(stopPostcode);

    container.appendChild(stopTypeTitle);
    container.appendChild(stopAddressLine1);
    container.appendChild(stopAddressWrapper);

    return container;
}


