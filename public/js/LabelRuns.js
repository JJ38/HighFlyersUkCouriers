import { auth, db, getDocument } from "/js/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, runTransaction } from "firebase/firestore";
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

const methodOfContactRadio = document.getElementById('radio_method_of_contact');
const methodOfContactTold = document.getElementById('radio_method_of_contact_told');
const methodOfContactText = document.getElementById('radio_method_of_contact_text');
const methodOfContactVoicemail = document.getElementById('radio_method_of_contact_voicemail');


const giveNoticeRadio = document.getElementById('radio_notice');
const giveNoticeYes = document.getElementById('radio_notice_yes');
const giveNoticeNo = document.getElementById('radio_notice_no');


const noticeInput = document.getElementById('notice_input');
const messageInput = document.getElementById('message');

const arrivalNoticeWrapper = document.getElementById('arrival_notice_wrapper');

const saveLabelButton = document.getElementById('save_label_button');
const savelLabelButtonLoader = document.getElementById('save_label_button_loader');
const assignedRunsLoader = document.getElementById('assigned_runs_loader');

let role;
let userID;

let methodOfContactRadioValue;
let arrivalNoticeRadioValue;
let noticeInputValue;
let messageInputValue;

let validationErrorMessage;
let selectedRunID;
let selectedRunData;
let selectedStopData;

let assignedRuns = [];
let assignedRunsDocs = [];


function addEventListeners(){

  if(closeAssignedRunsDetailsButton != null){

    closeAssignedRunsDetailsButton.addEventListener('click', () => {

      assignedRunDetailsContainer.classList.remove('slideIn');  

    });

  }

  if(closeStopDetailsWidgetButton != null){

    closeStopDetailsWidgetButton.addEventListener('click', () => {

      closeForm();

    });

  } 

  if(methodOfContactRadio != null){

    methodOfContactRadio.addEventListener('change', (e) => {

      methodOfContactRadioValue = e.target.value;

    });

  }

  if(giveNoticeRadio != null){

    giveNoticeRadio.addEventListener('change', (e) => {

      arrivalNoticeRadioValue = e.target.value

      if(arrivalNoticeRadioValue == "yes"){
        arrivalNoticeWrapper.classList.remove('hidden');
      }else{
        arrivalNoticeWrapper.classList.add('hidden');
      }    

    });

  }

  if(noticeInput != null){

    noticeInput.addEventListener('input', (e) => {

      noticeInputValue = e.target.value;

    });

  }

  if(messageInput != null){

    messageInput.addEventListener('input', (e) => {

      messageInputValue = e.target.value;

    });

  }

  if(saveLabelButton != null){

    saveLabelButton.addEventListener('click', async () => {

      showSaveLabelButtonLoader();

      const successfullyValidated = validateForm();

      if(!successfullyValidated){

        hideSaveLabelButtonLoader();
        showNotification("Error!", validationErrorMessage);
        return;

      }

      const storedLabelSuccessfully = await storeLabel();

      hideSaveLabelButtonLoader();

      if(!storedLabelSuccessfully){

        showNotification("Error!", "Error saving label");
        return;

      }

      showNotification("Success!", "Successfully saved label");

      //update stops table to mark as stop having a label
      updateTableStops();
      closeForm();

    });

  }

}

function showSaveLabelButtonLoader(){

  savelLabelButtonLoader.classList.remove('hidden');
  saveLabelButton.classList.add('hidden');

}

function hideSaveLabelButtonLoader(){

  savelLabelButtonLoader.classList.add('hidden');
  saveLabelButton.classList.remove('hidden');

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

function closeForm(){

  stopDetailsWidget.classList.remove('stopDetailsWidgetSlideIn');
  blurLayer.classList.add('z-index-minusone');
  blurLayer.classList.remove('z-index-fifteen');

}

function validateForm(){

  if(methodOfContactRadioValue == undefined){
    validationErrorMessage = "Please select a method of contact";
    return false;
  }

  if(arrivalNoticeRadioValue == undefined){
    validationErrorMessage = "Please select if arrival notice is required";
    return false;
  }

  if(arrivalNoticeRadioValue == "yes"){

    if(noticeInputValue == undefined){
      validationErrorMessage = "Please input a notice period";
      return false;
    }

    if(noticeInputValue < 0){
      validationErrorMessage = "Notice period must be greater than 0 minutes"
      return false;
    }

  }

  return true;

}

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

  assignedRunsLoader.classList.remove('hidden');

  addEventListeners();
  const staffData = await fetchStaffDocument();

  if(!staffData){
    assignedRunsLoader.classList.add('hidden');
    showNotification("Error!", "Error fetching staff document. Document doesnt exist");
    return;
  }

  const successfullyFetchedRuns = await fetchAssignedRunsDocuments(staffData);  

  if(!successfullyFetchedRuns){
    assignedRunsLoader.classList.add('hidden');
    showNotification("Error!", "Error fetching runs documents. Document doesnt exist");
    return;
  }

  assignedRuns = [];

  for(let i = 0; i < assignedRunsDocs.length; i++){

    const runData = assignedRunsDocs[i].data();
    assignedRuns.push(runData);

    const runCard = createAssignRunCard(runData);
    addRunCardEventListener(runCard, runData, assignedRunsDocs[i].id);
    assignedRunsTableBody.appendChild(runCard);

  }

  assignedRunsLoader.classList.add('hidden');
  assignedRunsTableBody.classList.remove('hidden');

}



function addRunCardEventListener(runCard, runData, runID){


  runCard.addEventListener('click', async () =>{

    selectedRunID = runID; 
    selectedRunData = runData;

    const stopOrders = await fetchStopOrders(runData['stops']);

    if(stopOrders == false){
      showNotification("Error!", "Error fetching stops for run");
      return; 
    }

    const parseDataResult = await parseStopsData(runData['stops']);
 
    if(parseDataResult == false){
      showNotification("Error!", "Error parsing stops for run");
      return; 
    }

    updateTableStops();
    selectedRunData = runData;

    assignedRunDetailsContainer.classList.add('slideIn');

  });

}

function updateTableStops(){

  console.log(selectedRunData);
  assignedRunsDetailsTableBody.innerHTML = "";

  for(let i = 0; i < selectedRunData['stops'].length; i++){

    const tableStopCard = createTableStopCard(selectedRunData['stops'][i]);
    addTableStopCardListener(tableStopCard, i);
    assignedRunsDetailsTableBody.appendChild(tableStopCard);

  }

}

function addTableStopCardListener(tableStopCard, indexOfStopInRun){

  tableStopCard.addEventListener('click', () => { 

    const stopData = selectedRunData['stops'][indexOfStopInRun];

    selectedStopData = stopData;
 
    stopDetailsWidget.classList.add('stopDetailsWidgetSlideIn');
    blurLayer.classList.remove('z-index-minusone');
    blurLayer.classList.add('z-index-fifteen');

    console.log(stopData);

    const orderData = selectedStopData['orderData'];

    //set orderData
    orderID.innerText = orderData['ID'];
    stopType.innerText = selectedStopData['stopType'];
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

    if(selectedStopData['stopType'] == "collection"){
      collectionInfoWrapper.classList.add('lightgrayBackground');
      deliveryInfoWrapper.classList.remove('lightgrayBackground');
    }

    if(selectedStopData['stopType'] == "delivery"){
      deliveryInfoWrapper.classList.add('lightgrayBackground');
      collectionInfoWrapper.classList.remove('lightgrayBackground');
    }

    updateForm(selectedStopData['label']);

  });

}

function updateForm(stopLabel){

  console.log(stopLabel);

  resetForm();

  if(stopLabel == undefined){
    return;
  }

  if(stopLabel['methodOfContact'] != undefined){
    
    methodOfContactRadioValue = stopLabel['methodOfContact'];

    switch (methodOfContactRadioValue){

      case "told":
        methodOfContactTold.checked = true;
        break;

      case "text":
        methodOfContactText.checked = true;
        break;

      case "voicemail":
        methodOfContactVoicemail.checked = true;
        break;
    }

  }

  if(stopLabel['arrivalNotice'] != undefined){

    arrivalNoticeRadioValue = stopLabel['arrivalNotice'];

    switch (arrivalNoticeRadioValue){

      case "yes":
        giveNoticeYes.checked = true;
        break;

      case "no":
        giveNoticeNo.checked = true;
        break;
      
    }

  }

  if(stopLabel['noticePeriod'] != undefined){

    noticeInputValue = stopLabel['noticePeriod'];

    if(parseInt(stopLabel['noticePeriod']) > 0){
      
      noticeInput.value = stopLabel['noticePeriod'];
      arrivalNoticeWrapper.classList.remove('hidden');

    }

  }

  if(stopLabel['message'] != undefined){

    messageInputValue = stopLabel['message'];
    messageInput.value = stopLabel['message'];

  }

}

function resetForm(){

  methodOfContactRadioValue = undefined;
  arrivalNoticeRadioValue = undefined;
  noticeInputValue = undefined;
  messageInputValue = undefined;

  clearRadios(methodOfContactRadio);
  clearRadios(giveNoticeRadio);
  arrivalNoticeWrapper.classList.add('hidden');
  noticeInput.value = "";
  messageInput.value = "";

}

function clearRadios(element) {

  const radios = element.querySelectorAll('input[type="radio"]');
  radios.forEach(radio => radio.checked = false);

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

  if(stopData['label'] != undefined){
    rowBackground.classList.add('labelledStop');
  }

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

    assignedRunsDocs = [];

    for(let i = 0; i < promises.length; i++){
      const run = await promises[i];
      assignedRunsDocs.push(run);
    }

    return true;

  }catch(err){
    console.log(err);
    return false
  }

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

async function storeLabel(){

  const label = {
    "methodOfContact": methodOfContactRadioValue,
    "arrivalNotice": arrivalNoticeRadioValue,
    "message": messageInputValue == undefined ? "" : messageInputValue
  };

  if(arrivalNoticeRadioValue == "yes"){
    label['noticePeriod'] = noticeInputValue;
  }

  const runDocRef = doc(db, "Runs", selectedRunID);
  
  let newStops;

  try {

    await runTransaction(db, async (transaction) => {

      const runDoc = await transaction.get(runDocRef);

      if (!runDoc.exists()) {
        throw new Error("Document does not exist!");
      }

      //the stops to update client with - contain orderData
      const stops = structuredClone(selectedRunData['stops']);

      //stops to store in database - will have orderData removed
      const databaseStops = structuredClone(selectedRunData['stops']);

      const currentStopPrimaryKey = selectedStopData['orderID'] + '_' + selectedStopData['stopType'];  

      let foundStop = false;

      for(let i = 0; i < databaseStops.length; i++){
        
        const stopPrimaryKey = databaseStops[i]['orderID'] + '_' + databaseStops[i]['stopType'];

        if(currentStopPrimaryKey == stopPrimaryKey){
          stops[i]['label'] = label;
          databaseStops[i]['label'] = label;
          foundStop = true;
        }

        delete databaseStops[i]['orderData'];

      }

      if(!foundStop){
        throw new Error("No stop to update");
      }

      transaction.update(runDocRef, {stops: databaseStops});

      newStops = stops;

    });

    //update client
    selectedRunData['stops'] = newStops;
    return true;

  } catch (err) {
    console.error("Transaction failed:", err);
    return false;
  }

}


