import { auth, db, getDocument, bulkReadTransaction } from "/js/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"

const adminLinks = document.querySelectorAll(".adminLink");
const assignedRunDetailsContainer = document.getElementById('assigned_run_details_container')
const assignedRunsTableBody = document.getElementById('assigned_runs_table_body');
const assignedRunsDetailsTableBody = document.getElementById('assigned_run_details_table_body');
const closeAssignedRunsDetailsButton = document.getElementById('close_assigned_run_details_container_button');
const stopDetailsWidget = document.getElementById('stop_details_widget_form');
const closeStopDetailsWidgetButton = document.getElementById('close_stop_details_widget_button');
const blurLayer = document.getElementById('blur_layer');

const orderID = document.getElementById('order_id');
const stopType = document.getElementById('stop_type');
const animalType = document.getElementById('animal_type');
const quantity = document.getElementById('quantity');
const numberOfBoxes = document.getElementById('number_of_boxes');

const collectionInfoWrapper = document.getElementById('collection_info_wrapper');
const collectionName = document.getElementById('collection_name');
const collectionPhoneNumber = document.getElementById('collection_phone_number');
const collectionAddressWrapper = document.getElementById('collection_address_wrapper');

const deliveryInfoWrapper = document.getElementById('delivery_info_wrapper');
const deliveryName = document.getElementById('delivery_name');
const deliveryPhoneNumber = document.getElementById('delivery_phone_number');
const deliveryAddressWrapper = document.getElementById('delivery_address_wrapper');



let role;
let userID;
let assignedRuns = [];


function addEventListeners(){

  closeAssignedRunsDetailsButton.addEventListener('click', () => {

    assignedRunDetailsContainer.classList.remove('slideIn');  

  });

  closeStopDetailsWidgetButton.addEventListener('click', () => {

    stopDetailsWidget.classList.remove('stopDetailsWidgetSlideIn');
    blurLayer.classList.add('z-index-minusone');
    blurLayer.classList.remove('z-index-fifteen');

  });

}

onAuthStateChanged(auth, (user) => {

  if (user) {

    auth.currentUser.getIdTokenResult().then(async (getIdTokenResult) => {

        role = getIdTokenResult.claims.role;
        userID = getIdTokenResult.claims.user_id;

      if(role != "admin" && role != "staff"){
        showNotification("Error!", "Invalid permissions");
        return;
      }

      roleBasedAccess();
      initLabelRuns();

    });
  };
      
});

function roleBasedAccess(){

    if(role == "admin"){

      if(adminLinks != null){

        for(const link of adminLinks){
            
            link.classList.remove("hidden");

        }

      }

    }

}

async function initLabelRuns(){

  addEventListeners();
  const staffData = await fetchStaffDocument();

  if(!staffData){
    showNotification("Error!", "Error fetching staff document. Document doesnt exist");
    return;
  }

  const successfullyFetchedAssignedRunsDocuments = await fetchAssignedRunsDocuments(staffData);  

  if(!successfullyFetchedAssignedRunsDocuments){
    showNotification("Error!", "Error fetching runs documents. Document doesnt exist");
    return;
  }

  for(let i = 0; i < assignedRuns.length; i++){
    
    const runData = assignedRuns[i].data();
    const runCard = createAssignRunCard(runData);
    addRunCardEventListener(runCard, runData);
    assignedRunsTableBody.appendChild(runCard);

  }

  assignedRunsTableBody.classList.remove('hidden');

}



function addRunCardEventListener(runCard, assignedRunData){

  runCard.addEventListener('click', async () =>{
      console.log(assignedRunData);
      const stopOrders = await fetchStopOrders(assignedRunData['stops']);

      if(stopOrders == false){
        showNotification("Error!", "Error fetching stops for run");
        return; 
      }

      const parseDataResult = await parseStopsData(assignedRunData['stops']);

      if(parseDataResult == false){
        showNotification("Error!", "Error parsing stops for run");
        return; 
      }

      for(let i = 0; i < assignedRunData['stops'].length; i++){
        const tableStopCard = createTableStopCard(assignedRunData['stops'][i]);
        addTableStopCardListener(tableStopCard, assignedRunData['stops'][i]);
        assignedRunsDetailsTableBody.appendChild(tableStopCard);
      }

      assignedRunDetailsContainer.classList.add('slideIn');


  });

}


function addTableStopCardListener(tableStopCard, stopData){

  tableStopCard.addEventListener('click', () => { 
 
    stopDetailsWidget.classList.add('stopDetailsWidgetSlideIn');
    blurLayer.classList.remove('z-index-minusone');
    blurLayer.classList.add('z-index-fifteen');

    console.log(stopData);

    const orderData = stopData['orderData'];

    //set orderData
    orderID.innerText = orderData['ID'];
    stopType.innerText = stopData['stopType'];
    animalType.innerText = orderData['animalType'];
    quantity.innerText = orderData['quantity'];
    numberOfBoxes.innerText = orderData['boxes'] == undefined ? "N/A" : orderData['boxes'];

    collectionName.innerText = orderData['collectionName'];
    collectionPhoneNumber.innerText = orderData['collectionPhoneNumber'];
    collectionAddressWrapper.innerHTML = "";
    collectionAddressWrapper.appendChild(
      createTableAddress(
        orderData['collectionAddress1'],
        orderData['collectionAddress2'],
        orderData['collectionAddress3'],
        orderData['collectionPostcode'],
      )
    );

    deliveryName.innerText = orderData['deliveryName'];
    deliveryPhoneNumber.innerText = orderData['deliveryPhoneNumber'];
    deliveryAddressWrapper.innerHTML = "";
    deliveryAddressWrapper.appendChild(
      createTableAddress(
        orderData['deliveryAddress1'],
        orderData['deliveryAddress2'],
        orderData['deliveryAddress3'],
        orderData['deliveryPostcode'],
      )
    );

    if(stopData['stopType'] == "collection"){
      collectionInfoWrapper.classList.add('lightgrayBackground');
      deliveryInfoWrapper.classList.remove('lightgrayBackground');
    }

    if(stopData['stopType'] == "delivery"){
      deliveryInfoWrapper.classList.add('lightgrayBackground');
      collectionInfoWrapper.classList.remove('lightgrayBackground');
    }

  });

}

async function fetchStopOrders(stops){

  const promises = [];

  for(let i = 0; i < stops.length; i++){

    const promise = getDocument(doc(db, 'Orders', stops[i]['orderID']))
    stops[i]['orderData'] = promise;
  }
  
  await Promise.all(promises);

}

async function parseStopsData(stops){

  for(let i = 0; i < stops.length; i++){
    const doc = await stops[i]['orderData'];
    stops[i]['orderData']= doc.data();
  }

}


function createTableStopCard(stopData){
  
  const orderData = stopData['orderData'];

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";

  if(orderData == undefined){
    return tableRow;
  }


  tableRow.appendChild(tableData(orderData['ID']));
  tableRow.appendChild(tableData(orderData['animalType']));
  tableRow.appendChild(tableData(orderData['quantity']));
  tableRow.appendChild(tableData(stopData['stopType']));


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
  div.classList = "orderMessage";

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


async function fetchStaffDocument(){

  const staffDocRef= doc(db, 'Staff', userID);
  const staffDocument = await getDocument(staffDocRef);

  const staffData = staffDocument.data();

  console.log(staffDocument.data());

  if(staffData == undefined){
    return false;
  }

  return staffData;

}

async function fetchAssignedRunsDocuments(staffData){

  const promises = [];

  try{

    for(let i = 0; i < staffData.assignedRuns.length; i++){

      const runDocRef = doc(db, 'Runs', staffData.assignedRuns[i].runID);
      promises.push(getDocument(runDocRef));

    }

    await Promise.all(promises);

    assignedRuns = [];

    for(let i = 0; i < promises.length; i++){
      const run = await promises[i];
      assignedRuns.push(run);
    }

  }catch(err){
    console.log(err);
    return false
  }

  return true;

}

function createAssignRunCard(runData){

    const tableRow = document.createElement('tr');
    tableRow.classList = "tableDataRow";

    if(runData == undefined){
      return tableRow;
    }

    tableRow.appendChild(tableData(runData['shipmentName']));
    tableRow.appendChild(tableData(runData['runName']));
    tableRow.appendChild(tableData(runData['runWeek']));
    tableRow.appendChild(tableData(runData['stops'].length));

    const rowBackground = document.createElement('td');
    rowBackground.classList = "tableRowBackground";
    tableRow.appendChild(rowBackground);


    return tableRow;

}

function tableData(value){

  const tableData = document.createElement('td');
  tableData.innerHTML = value;

  return tableData;

}


