import { auth, db, getDocument, getDocuments } from "/js/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, runTransaction, query, collection, where } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"
import { initInternalOrderForm, createAccountSelectOptions, createAnimalTypeSelectOptions } from "/js/FormModel.js";


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
const estimatedArrivalTime = document.getElementById('estimated_arrival_time');

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

const updateOrderButton = document.getElementById('update_order_button');
const updateOrderWidget = document.getElementById('update_order_details_widget');
const closeUpdateOrderWidgetButton = document.getElementById('close_update_order_details_widget_button');
const blurLayerUpdateOrder = document.getElementById('blur_layer_update_order');

const saveOrderButton = document.getElementById('save_order_button');

const updateAnimalTypeSelect = document.getElementById('update_animal_type_select');
const updateAccountSelect = document.getElementById('update_account_select');
const updateOrderDetailsTable = document.getElementById('update_order_details_table');

const updateOrderID = document.getElementById('update_order_id');
const updateQuantity = document.getElementById('update_quantity');
const updateEmail = document.getElementById('update_email');
const updateBoxes = document.getElementById('update_boxes');
const updateDeliveryWeek = document.getElementById('update_delivery_week');
const updateCollectionName = document.getElementById('update_collection_name');
const updateCollectionAddress1 = document.getElementById('update_collection_address_1');
const updateCollectionAddress2 = document.getElementById('update_collection_address_2');
const updateCollectionAddress3 = document.getElementById('update_collection_address_3');
const updateCollectionPostcode = document.getElementById('update_collection_postcode');
const updateCollectionPhoneNumber = document.getElementById('update_collection_phone_number');

const updateDeliveryName = document.getElementById('update_delivery_name');
const updateDeliveryAddress1 = document.getElementById('update_delivery_address_1');
const updateDeliveryAddress2 = document.getElementById('update_delivery_address_2');
const updateDeliveryAddress3 = document.getElementById('update_delivery_address_3');
const updateDeliveryPostcode = document.getElementById('update_delivery_postcode');
const updateDeliveryPhoneNumber = document.getElementById('update_delivery_phone_number');

const updatePayment = document.getElementById('update_payment');
const updatePrice = document.getElementById('update_price');
const updateMessage = document.getElementById('update_message');
const updateCode = document.getElementById('update_code');

const confirmOrderChangeDialog = document.getElementById('confirm_order_change_dialog');
const confirmUpdateOrderDialogButton = document.getElementById('confirm_update_order_dialog_button');
const cancelUpdateOrderDialogButton = document.getElementById('cancel_update_order_dialog_button');


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

let animalTypeSelectOptions = [];
let accountSelectOptions = [];

const validPaymentTypes = ["Delivery", "Pickup", "Collection", "Account"];


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

    });

  }

  if(updateOrderButton != null){

    updateOrderButton.addEventListener('click', () => {

      initUpdateOrderForm();
      showUpdateOrderWidget();

    });

  }

  if(closeUpdateOrderWidgetButton != null){

    closeUpdateOrderWidgetButton.addEventListener('click', () => {

      hideUpdateOrderWidget();

    });

  } 

  if(saveOrderButton != null){

    saveOrderButton.addEventListener('click', async () => {

      console.log(selectedStopData);
      const order = getOrder();
      const needToRemoveStopFromRun = hasVitalOrderDetailsChanged(order);

      if(needToRemoveStopFromRun){
        showConfirmOrderChangeDialog();
        return;
      }
      
      await saveOrderController();
      
    });

  }

  if(cancelUpdateOrderDialogButton != null){

    cancelUpdateOrderDialogButton.addEventListener('click', () => {
      console.log("cancelUpdateOrderDialogButton");
      hideConfirmOrderChangeDialog();

    });

  }

  if(confirmUpdateOrderDialogButton != null){

    confirmUpdateOrderDialogButton.addEventListener('click', async() => {
      await saveOrderController();
      hideConfirmOrderChangeDialog();
    });

  }
  
}

async function saveOrderController(){

  if(selectedStopData['label'] == undefined){
    showNotification("Error!", "You must label the stop before updating the order");
    return;
  }

  const order = getOrder();

  const validitionResult = validateOrder(order);

  if(validitionResult != null){
    showNotification("Error!", validitionResult);
    return false;
  }

  const needToRemoveStopFromRun = hasVitalOrderDetailsChanged(order);

  const updatedOrderSuccessfully = await updateOrder(order, needToRemoveStopFromRun);

  if(!updatedOrderSuccessfully){
    showNotification("Error!", "Error updating order");
    return false;
  }

  if(needToRemoveStopFromRun){
    closeForm();
  }else{
    updateLabelForm();
  }

  updateTableStops();
  showNotification("Success!", "Successfully updated order details");
  hideUpdateOrderWidget();    

}

function showConfirmOrderChangeDialog(){

  confirmOrderChangeDialog.classList.remove('hidden');

}

function hideConfirmOrderChangeDialog(){

  confirmOrderChangeDialog.classList.add('hidden');

}

function showUpdateOrderWidget(){

  updateOrderWidget.classList.remove('hidden');
  blurLayerUpdateOrder.classList.add('z-index-twentyone');
  blurLayerUpdateOrder.classList.remove('z-index-minusone');

}

function hideUpdateOrderWidget(){

  updateOrderWidget.classList.add('hidden');
  blurLayerUpdateOrder.classList.remove('z-index-twentyone');
  blurLayerUpdateOrder.classList.add('z-index-minusone');

}

function showSaveLabelButtonLoader(){

  savelLabelButtonLoader.classList.remove('hidden');
  saveLabelButton.classList.add('hidden');

}

function hideSaveLabelButtonLoader(){

  savelLabelButtonLoader.classList.add('hidden');
  saveLabelButton.classList.remove('hidden');

}

function closeForm(){

  stopDetailsWidget.classList.remove('stopDetailsWidgetSlideIn');
  blurLayer.classList.add('z-index-minusone');
  blurLayer.classList.remove('z-index-fifteen');

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
      init();

    });
  };
      
});

async function init(){

  initLabelRuns();
  const formDataMap = await initInternalOrderForm();
  console.log(formDataMap.get('Settings/birdSpecies'));

  animalTypeSelectOptions = createAnimalTypeSelectOptions(formDataMap.get('Settings/birdSpecies'));
  accountSelectOptions = createAccountSelectOptions(formDataMap.get('Users'));

  console.log(animalTypeSelectOptions);

  for(let i = 0; i < animalTypeSelectOptions.length; i++){
    updateAnimalTypeSelect.appendChild(animalTypeSelectOptions[i]);
  }

  for(let i = 0; i < accountSelectOptions.length; i++){
    updateAccountSelect.appendChild(accountSelectOptions[i]);
  }

  console.log(animalTypeSelectOptions);
  console.log(accountSelectOptions);


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

  console.log(staffData);

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

    updateLabelForm(stopData);
    updateLabelFormSelections(selectedStopData['label']);

  });

}

function updateLabelForm(stopData){

  stopDetailsWidget.classList.add('stopDetailsWidgetSlideIn');
  blurLayer.classList.remove('z-index-minusone');
  blurLayer.classList.add('z-index-fifteen');

  console.log(stopData);

  const orderData = selectedStopData['orderData'];

  //set orderData
  orderID.innerText = orderData['ID'];
  stopType.innerText =  selectedStopData['stopType'];
  estimatedArrivalTime.innerText =  selectedStopData['stopTime'];
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
    collectionInfoWrapper.classList.add('redBorder');
    deliveryInfoWrapper.classList.remove('blueBorder');
  }

  if(selectedStopData['stopType'] == "delivery"){
    deliveryInfoWrapper.classList.add('blueBorder');
    collectionInfoWrapper.classList.remove('redBorder');
  }

}

function initUpdateOrderForm(){

  console.log(selectedStopData);
  const orderData = selectedStopData['orderData'];

  if(orderData == undefined){
    return;
  }

  updateOrderID.value = orderData['ID'];
  setSelectedOption(orderData['animalType'], animalTypeSelectOptions, updateAnimalTypeSelect);
  updateQuantity.value = orderData['quantity'];
  updateEmail.value = orderData['email'];
  updateBoxes.value = orderData['boxes'];
  setSelectedOption(orderData['account'], accountSelectOptions, updateAccountSelect);
  updateDeliveryWeek.value = orderData['deliveryWeek'];
  
  updateCollectionName.value = orderData['collectionName'];
  updateCollectionAddress1.value = orderData['collectionAddress1'];
  updateCollectionAddress2.value = orderData['collectionAddress2'];
  updateCollectionAddress3.value = orderData['collectionAddress3'];
  updateCollectionPostcode.value = orderData['collectionPostcode'];
  updateCollectionPhoneNumber.value = orderData['collectionPhoneNumber'];
  
  updateDeliveryName.value = orderData['deliveryName'];
  updateDeliveryAddress1.value = orderData['deliveryAddress1'];
  updateDeliveryAddress2.value = orderData['deliveryAddress2'];
  updateDeliveryAddress3.value = orderData['deliveryAddress3'];
  updateDeliveryPostcode.value = orderData['deliveryPostcode'];
  updateDeliveryPhoneNumber.value = orderData['deliveryPhoneNumber'];

  updatePayment.value = orderData['payment'];
  updatePrice.value = orderData['price'];
  updateMessage.value = orderData['message'];
  updateCode.value = orderData['code'];

}

function setSelectedOption(selectedOrderValue, options, selectElement){

  let foundAnimalType = false;

  //reset all option to unselected
  for(let i = 0; i < options.length; i++){

    console.log(options[i].value);

    if(options[i].value == selectedOrderValue){

      options[i].selected = true;
      foundAnimalType = true;

    }else{

      options[i].selected = false;

    } 
  
  }

  if(!foundAnimalType){
    const option = createOption(selectedOrderValue, selectedOrderValue);
    option.selected = true;
    selectElement.appendChild(option);
  }


}

function updateLabelFormSelections(stopLabel){

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

  stops.sort(orderByID);

}

function orderByID(a, b){

  if(a.orderData.ID > b.orderData.ID){
    return -1; //sort a before b
  }

  return 1;

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

function createOption(text, value){

  const option = document.createElement('option');
  option.innerText = text;
  option.value = value;

  return option;

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
    selectedRunData['stops'] = newStops; //to update table
    selectedStopData['label'] = label;
    return true;

  } catch (err) {
    console.error("Transaction failed:", err);
    return false;
  }

}

function getOrder(){

  const order = {

    ID: selectedStopData['orderData']['ID'],
    addedBy: selectedStopData['orderData']['addedBy'],
    animalType: updateAnimalTypeSelect.value,
    email: updateEmail.value,
    quantity: parseInt(updateQuantity.value),
    boxes: parseInt(updateBoxes.value),
    account: updateAccountSelect.value,
    deliveryWeek: parseInt(updateDeliveryWeek.value),
    collectionName: updateCollectionName.value,
    collectionAddress1: updateCollectionAddress1.value,
    collectionAddress2: updateCollectionAddress2.value,
    collectionAddress3: updateCollectionAddress3.value,
    collectionPostcode: updateCollectionPostcode.value,
    collectionPhoneNumber: updateCollectionPhoneNumber.value,
    deliveryName: updateDeliveryName.value,
    deliveryAddress1: updateDeliveryAddress1.value,
    deliveryAddress2: updateDeliveryAddress2.value,
    deliveryAddress3: updateDeliveryAddress3.value,
    deliveryPostcode: updateDeliveryPostcode.value,
    deliveryPhoneNumber: updateDeliveryPhoneNumber.value,
    payment: updatePayment.value,
    price: updatePrice.value,
    message: updateMessage.value,
    code: updateCode.value,
    timestamp: selectedStopData['orderData']['timestamp']

  }

  return order;

}

async function updateOrder(order, needToRemoveStopFromRun){

  const selectedRunShipmentName = selectedRunData['shipmentName'];

  console.log(selectedRunShipmentName);
  console.log(selectedRunID);
  
  if(isEmpty(selectedRunShipmentName)){
    return false;
  }

  const orderDocRef = doc(db, "Orders", selectedStopData['orderID']);
  const runDocRef = doc(db, "Runs", selectedRunID);
  const unassignedStopsDocQuery = query(collection(db, "Runs"), where("runName", "==", null), where("shipmentName", "==", selectedRunShipmentName));

  //fetched as query as null as a where value isnt allowed in transaction for some reason even tho
  const unassignedStopsDoc = await getDocuments(unassignedStopsDocQuery);

  if(unassignedStopsDoc == false){
    return false;
  }

  //get doc id so it can be refetched inside transaction
  const unassignedStopsDocID = unassignedStopsDoc.docs[0].id;
  const unassignedStopsDocRef = doc(db, "Runs", unassignedStopsDocID);

  try{

    await runTransaction(db, async (transaction) => {
      
      const orderDoc = await transaction.get(orderDocRef);
      const unassignedStopsDoc = await transaction.get(unassignedStopsDocRef);
      const runDoc = await transaction.get(runDocRef);

      //update order  SwAVxvJkWvVYkKYHZgyc
      transaction.update(orderDocRef, {

        animalType: order.animalType,
        email: order.email,
        quantity: order.quantity,
        boxes: order.boxes,
        account: order.account,
        deliveryWeek: order.deliveryWeek,
        collectionName: order.collectionName,
        collectionAddress1: order.collectionAddress1,
        collectionAddress2: order.collectionAddress2,
        collectionAddress3: order.collectionAddress3,
        collectionPostcode: order.collectionPostcode,
        collectionPhoneNumber: order.collectionPhoneNumber,
        deliveryName: order.deliveryName,
        deliveryAddress1: order.deliveryAddress1, 
        deliveryAddress2: order.deliveryAddress2,
        deliveryAddress3: order.deliveryAddress3,
        deliveryPostcode: order.deliveryPostcode,
        deliveryPhoneNumber: order.deliveryPhoneNumber,
        payment: order.payment,
        price: order.price,
        message: order.message,
        code: order.code
        
      });

      if(!needToRemoveStopFromRun){
        return;
      }

      if (!orderDoc.exists()) {
        throw new Error("Document does not exist!");
      }

      if (!unassignedStopsDoc.exists()) {
        throw new Error("Document does not exist!");
      }
      
      const unassignedStopsDocData = unassignedStopsDoc.data();
      const runDocData = runDoc.data();
      
      //add stop to unassigned stops run - remove coordinates, orderData and stopTime
      console.log(unassignedStopsDocData);
      console.log(selectedStopData);
      
      const stop = {

        isLocked: false,
        orderID: selectedStopData['orderID'],
        stopType: selectedStopData['stopType'],
        label: selectedStopData['label'] //cant be undefined

      } 

      const newUnassignedStops = unassignedStopsDocData['stops'];

      newUnassignedStops.push(stop);

      transaction.update(unassignedStopsDocRef, {
        stops: newUnassignedStops
      })

      //remove stop from assigned run
      const runStops = runDocData['stops'];

      const selectedStopPrimaryKey = selectedStopData['orderID'] + '_' + selectedStopData['stopType'];

      let foundStop = false;

      for(let i = 0; i < runStops.length; i++){

        const primaryKey = runStops[i]['orderID'] + '_' + runStops[i]['stopType']

        if(primaryKey == selectedStopPrimaryKey){
          console.log(primaryKey);
          runStops.splice(i, 1);
          foundStop = true;
          break;
        }

      }

      transaction.update(runDocRef, {
        stops: runStops
      })

      console.log(newUnassignedStops);
      console.log(runStops);

      if(!foundStop){
        throw new Error('Unable to find stop to remove');
      }
    
    });

    //update client side data to match order detail changes

    //find stop to update
    const selectedStopPrimaryKey = selectedStopData['orderID'] + '_' + selectedStopData['stopType'];
    let updatedClient = false;

    for(let i = 0; i < selectedRunData['stops'].length; i++){

      const primarykey =  selectedRunData['stops'][i]['orderID'] + '_' + selectedRunData['stops'][i]['stopType'];
      if(selectedStopPrimaryKey == primarykey){

        //if the stop has been removed from the run then remove from clientside to stop duplicate stops being created later on
        if(needToRemoveStopFromRun){
          selectedRunData['stops'].splice(i, 1);
          selectedStopData = null;
          updatedClient = true;
        }else{
            
          selectedRunData['stops'][i]['orderData'] = order; //to update data shown in table
          selectedStopData['orderData'] = order; //to update label form
          updatedClient = true;

        }

      } 

    }

    console.log(selectedRunData['stops']);

    if(!updatedClient){
      showNotification("Error!", "Error updating client. Order details have been updated");
      return;
    }

  }catch(e){  
    console.log(e);
    return false;
  }

  return true;

}


function hasVitalOrderDetailsChanged(order){

  const selectedStopOrderData = selectedStopData['orderData'];

  if(selectedStopOrderData.deliveryWeek != order.deliveryWeek){
    return true;
  }

  if(selectedStopOrderData.collectionAddress1 != order.collectionAddress1){
    return true;
  }

  if(selectedStopOrderData.collectionAddress2 != order.collectionAddress2){
    return true;
  }

  if(selectedStopOrderData.collectionAddress3 != order.collectionAddress3){
    return true;
  }

  if(selectedStopOrderData.collectionPostcode != order.collectionPostcode){
    return true;
  }


  if(selectedStopOrderData.deliveryAddress1 != order.deliveryAddress1){
    return true;
  }

  if(selectedStopOrderData.deliveryAddress2 != order.deliveryAddress2){
    return true;
  }

  if(selectedStopOrderData.deliveryAddress3 != order.deliveryAddress3){
    return true;
  }

  if(selectedStopOrderData.deliveryPostcode != order.deliveryPostcode){
    return true;
  }

  return false;

}


function validateOrder(order){ 

    const isNumber = new RegExp('^[0-9]*$');
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    //validate phone numbers
    if(!isNumber.test(order.deliveryPhoneNumber) || order.deliveryPhoneNumber.length != 11){
        return "Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number";
    }

    if(!isNumber.test(order.collectionPhoneNumber) || order.collectionPhoneNumber.length != 11){
        return "Collection Telephone is not a valid phone number. Please enter an 11 digit phone number";
    }

    //validate email
    if(!(order.email).match(isEmail)){
        return "Email is not valid";
    }

    if(!validPaymentTypes.includes(order.payment)){
        return "Please select a valid payment option";
    }

    if(isEmpty(order.animalType)){
        return "Please select a valid animal type";
    }

    if(isEmpty(order.collectionAddress1)){
      return "Please enter a collection address";
    }

    if(isEmpty(order.collectionPostcode)){
      return "Please enter a collection postcode";
    }
    
    if(isEmpty(order.deliveryAddress1)){
      return "Please enter a Delivery address";
    }

    if(isEmpty(order.deliveryPostcode)){
      return "Please enter a delivery postcode";
    }

    if(!isNumber.test(order.quantity) || parseInt(order.quantity) < 1 || order.quantity == ""){
        return "Quantity is not a valid number. Please enter a number greater than 0";
    }

    if(!isNumber.test(order.boxes) || parseInt(order.boxes) < 1 || order.boxes == ""){
        return "Boxes is not a valid number. Please enter a number greater than 0";
    }

    return null;

}


function isEmpty(value){

  if(value == null || value == undefined || value == ""){
    return true;
  }

  return false;

}