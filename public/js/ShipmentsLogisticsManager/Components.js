export function createLoader(){

  const loader = document.createElement('div');
  loader.classList = "loader";

  return loader;

}
  

function tableData(value){

  const tableData = document.createElement('td');
  tableData.innerHTML = value;

  return tableData;

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


export function createAddressSuggestionCard(addressObject, addressNumber){

  console.log(addressObject);

  const card = document.createElement('div');
  card.classList = "addressSuggestionCard";

  const suggestionNumber = document.createElement('p');
  suggestionNumber.innerText = addressNumber;
  suggestionNumber.classList = "addressSuggestionNumber"

  const address1 = document.createElement('p');
  address1.innerHTML = addressObject.streetAddress;
  address1.classList = "addressSuggestionStreetAddress";

  const secondaryAddressWrapper = document.createElement('div');
  secondaryAddressWrapper.classList = "addressSuggestionSecondaryAddress";
  
  const address2 = document.createElement('p');
  address2.innerHTML = addressObject.city + ",&nbsp;";

  const address3 = document.createElement('p');
  address3.innerHTML = addressObject.county + ",&nbsp;";

  const postcode = document.createElement('p');
  postcode.innerText = addressObject.postcode;

  secondaryAddressWrapper.appendChild(address2);
  secondaryAddressWrapper.appendChild(address3);
  secondaryAddressWrapper.appendChild(postcode);


  const addressWrapper = document.createElement('div');
  addressWrapper.classList = "suggestionAddressWrapper";


  addressWrapper.appendChild(address1);
  addressWrapper.appendChild(secondaryAddressWrapper);

  
  card.appendChild(suggestionNumber);
  card.appendChild(addressWrapper);


  return card;

}


export function createStopContainer(stopNumber, stopCard){

  const stopContainer = document.createElement('div');
  stopContainer.classList = "stopContainer";

  stopContainer.appendChild(stopNumber);
  stopContainer.appendChild(stopCard);

  return stopContainer;  

}


export function createStopCard(stop, stopMetaDataContainer, stopsWrapper, buttonWrapper, isOptimised){

  const stopData = stop['stopData'];

  const stopCardWrapper = document.createElement('div');
  stopCardWrapper.classList = "stopCardWrapper";


  const stopCard = document.createElement('div');
  stopCard.classList = "stopCard";

  const stopPrimaryKey = document.createElement('p');
  stopPrimaryKey.innerText = stop.orderID + "_" + stop.stopType;
  stopPrimaryKey.classList = "primaryKeyDebug"


  const stopTime = document.createElement('p');
  stopTime.classList = "stopTime";
  stopTime.innerText = isOptimised ? stop.stopTime : "";


  const stopCustomerName = document.createElement('p');
  stopCustomerName.classList = "stopCustomerName";
  stopCustomerName.innerText = stop.stopType == "collection" ? stopData['collectionName'] : stopData['deliveryName'];



  const animalTypeQuantityContainer = document.createElement('div'); 
  animalTypeQuantityContainer.classList = "animalTypeQuantityContainer";

  const animalType = document.createElement('p');
  animalType.innerText = stopData['animalType'];

  const quantity = document.createElement('p');
  quantity.innerText = "x" + stopData['quantity'];

  animalTypeQuantityContainer.appendChild(animalType);
  animalTypeQuantityContainer.appendChild(quantity);


  stopCard.appendChild(stopMetaDataContainer);

  stopCard.appendChild(stopPrimaryKey);

  stopCard.appendChild(stopTime);
  

  stopCard.appendChild(stopCustomerName);
  stopCard.appendChild(animalTypeQuantityContainer);
  stopCard.appendChild(stopsWrapper);
  stopCard.appendChild(buttonWrapper);


  stopCardWrapper.appendChild(stopCard);

  return stopCardWrapper;

}


export function createStopsWrapper(stopAddress, opposingStopAddress){

  const stopsWrapper = document.createElement('div');
  stopsWrapper.classList = "stopsWrapper";

  stopsWrapper.appendChild(stopAddress);
  stopsWrapper.appendChild(opposingStopAddress);

  return stopsWrapper

}


export function createStopAddress(stop, isActiveStop){

  let address1;
  let address2;
  let address3;
  let postcode;

  const stopData = stop.stopData;

  const container = document.createElement('div');

  if(isActiveStop){
    //get active stop address

    if(stop.stopType == "collection"){

      address1 = stopData['collectionAddress1'];
      address2 = stopData['collectionAddress2'];
      address3 = stopData['collectionAddress3'];
      postcode = stopData['collectionPostcode'];

    }else{

      address1 = stopData['deliveryAddress1'];
      address2 = stopData['deliveryAddress2'];
      address3 = stopData['deliveryAddress3'];
      postcode = stopData['deliveryPostcode'];

    }


  }else{

    //get opposing stop address
    if(stop.stopType == "collection"){

      address1 = stopData['deliveryAddress1'];
      address2 = stopData['deliveryAddress2'];
      address3 = stopData['deliveryAddress3'];
      postcode = stopData['deliveryPostcode'];

    }else{

      address1 = stopData['collectionAddress1'];
      address2 = stopData['collectionAddress2'];
      address3 = stopData['collectionAddress3'];
      postcode = stopData['collectionPostcode'];

    }

    container.classList = "hidden";

  }


  const stopAddressLine1 = document.createElement('p');
  stopAddressLine1.classList = "stopAddressLine1";
  stopAddressLine1.innerText = address1;


  const stopAddressWrapper = document.createElement('div');
  stopAddressWrapper.classList = "stopAddressWrapper";

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


  container.appendChild(stopAddressLine1);
  container.appendChild(stopAddressWrapper);

  return container;
}


export function createButtonWrapper(stopLockButton, editButton, deleteButton, moveUpButton, moveDownButton){

  const wrapper = document.createElement('div');
  wrapper.classList = "buttonWrapper hidden";

  wrapper.appendChild(stopLockButton);
  wrapper.appendChild(editButton);
  wrapper.appendChild(moveUpButton);
  wrapper.appendChild(moveDownButton);
  wrapper.appendChild(deleteButton);

  return wrapper;

}


export function createEditButton(){

  const editButtonWrapper = document.createElement('div');
  editButtonWrapper.classList = "editButtonWrapper"; 

  const editIcon = document.createElement('span');
  editIcon.classList = "edit material-symbols-outlined";
  editIcon.innerText = "edit";

  editButtonWrapper.appendChild(editIcon);

  return editButtonWrapper;

}


export function createDeleteStopButton(){

  const deleteButtonWrapper = document.createElement('div');
  deleteButtonWrapper.classList = "deleteButtonWrapper"; 

  const deleteIcon = document.createElement('span');
  deleteIcon.classList = "delete material-symbols-outlined"
  deleteIcon.innerText = "delete";

  deleteButtonWrapper.appendChild(deleteIcon);

  return deleteButtonWrapper;

}


export function createStopMetaData(stop){

  const stopData = stop['stopData'];

  const stopMetaDataContainer = document.createElement('div');
  stopMetaDataContainer.classList = "stopMetaDataContainer hidden";

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

export function createStopLockButton(isLocked, lockIcon, lockOpenIcon){

  const lockButtonWrapper = document.createElement('div');
  lockButtonWrapper.classList = "lockButtonWrapper hidden"; 

  if(isLocked){

    lockOpenIcon.classList.add('hidden');

  }else{

    lockIcon.classList.add('hidden');

  }

  lockButtonWrapper.appendChild(lockIcon);
  lockButtonWrapper.appendChild(lockOpenIcon);

  return lockButtonWrapper;

}

export function createMoveUpButton(isTopStop){

  const moveUpButtonWrapper = document.createElement('div');
  moveUpButtonWrapper.classList = "moveUpButtonWrapper"; 

  if(isTopStop){
    moveUpButtonWrapper.classList += " hidden";
  }

  const upIcon = document.createElement('span');
  upIcon.classList = "up material-symbols-outlined";
  upIcon.innerText = "arrow_upward_alt";

 

  moveUpButtonWrapper.appendChild(upIcon);

  return moveUpButtonWrapper;

}

export function createMoveDownButton(isBottomStop){
  
  const moveDownButtonWrapper = document.createElement('div');
  moveDownButtonWrapper.classList = "moveDownButtonWrapper"; 

  if(isBottomStop){
    moveDownButtonWrapper.classList +=  " hidden";
  }

  const downIcon = document.createElement('span');
  downIcon.classList = "down material-symbols-outlined";
  downIcon.innerText = "arrow_downward_alt";

  moveDownButtonWrapper.appendChild(downIcon);

  return moveDownButtonWrapper;

}

export function createLockIcon(){

  const lockIcon = document.createElement('span');
  lockIcon.classList = "lock material-symbols-outlined"
  lockIcon.innerText = "lock";

  return lockIcon;

}

export function createOpenLockIcon(){

  const lockOpenIcon = document.createElement('span');
  lockOpenIcon.classList = "lockOpen material-symbols-outlined";
  lockOpenIcon.innerText = "lock_open";

  return lockOpenIcon;
}

export function createStopLabel(label, isLocked){

  const wrapper = document.createElement('div');
  wrapper.classList = "stopNumberWrapper";

  const stopNumber = document.createElement('p');
  stopNumber.classList = "stopNumber";
  stopNumber.innerText = label;

  if(isLocked){

    stopNumber.classList.add('locked');

  }


  wrapper.appendChild(stopNumber);

  return wrapper;

}


export function createUnassignedStopCardClickableElement(stopData){

  const td = document.createElement("td");

  if(stopData['coordinates'] != null){

    const checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    checkBox.value = stopData['orderID'] + "_" + stopData['stopType'];
    checkBox.id = stopData['orderID'] + "_" + stopData['stopType'];
    checkBox.classList = "assignStopCheckbox";

    td.appendChild(checkBox);
    
  }else{

    const container = document.createElement('div');
    container.classList = "validateAddressButton";

    const span = document.createElement('span');
    span.classList = "material-symbols-rounded exclamation";
    span.innerText = "priority_high";

    container.appendChild(span);

    td.appendChild(container);

  }

  return td;

}


export function createUnassignedOrdersTableCard(stopData, clickableElement){

  //clickableElement is either a checkbox or button

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";

  tableRow.appendChild(clickableElement);

  tableRow.appendChild(tableData(stopData['stopData']['ID']));
  tableRow.appendChild(tableData(stopData['stopData']['animalType']));
  tableRow.appendChild(tableData(stopData['stopData']['quantity']));
  tableRow.appendChild(tableData(stopData['stopType']));


  let stopAddress;
  let stopName;
  let stopPhoneNumber;

  if(stopData.stopType == "collection"){

    stopAddress = createTableAddress(
      stopData['stopData']['collectionAddress1'],
      stopData['stopData']['collectionAddress2'],
      stopData['stopData']['collectionAddress3'],
      stopData['stopData']['collectionPostcode'],
    )

    stopName = tableData(stopData['stopData']['collectionName']);
    stopPhoneNumber = tableData(stopData['stopData']['collectionPhoneNumber']);

  }else{

    stopAddress = createTableAddress(
      stopData['stopData']['deliveryAddress1'],
      stopData['stopData']['deliveryAddress2'],
      stopData['stopData']['deliveryAddress3'],
      stopData['stopData']['deliveryPostcode'],
    )

    stopName = tableData(stopData['stopData']['deliveryName']);
    stopPhoneNumber = tableData(stopData['stopData']['deliveryPhoneNumber']);

  }

  tableRow.appendChild(stopName);
  tableRow.appendChild(stopAddress);
  tableRow.appendChild(stopPhoneNumber);

  tableRow.appendChild(tableData(stopData['stopData']['payment']));

 
  const td = document.createElement('td');
  const div = document.createElement('div');
  div.innerText = stopData['stopData']['message'];
  td.appendChild(div);
  tableRow.appendChild(td);

  tableRow.appendChild(tableData(stopData['stopData']['code']));

  const rowBackground = tableData("");
  rowBackground.classList = "tableRowBackground";
  tableRow.appendChild(rowBackground);

  return tableRow;

}


export function createTableOrderCard(doc, customerAccounts){

  const orderData = doc.data();

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";

  const x = document.createElement('td');
  const checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.value = doc.id;
  checkBox.classList = "addStopCheckbox";

  x.appendChild(checkBox);

  tableRow.appendChild(x);

  tableRow.appendChild(tableData(orderData['ID']));
  tableRow.appendChild(tableData(orderData['animalType']));
  tableRow.appendChild(tableData(orderData['quantity']));

  if(customerAccounts != false){

    let accountName = customerAccounts.get(orderData['account']);

    //if value of account is literally account name rather than account id
    if(accountName == undefined){
      accountName = orderData['account'];
    }

    tableRow.appendChild(tableData(accountName));

  }else{
    tableRow.appendChild(tableData(orderData['account']));
  }

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
  td.appendChild(div);
  tableRow.appendChild(td);

  tableRow.appendChild(tableData(orderData['code']));

  const rowBackground = tableData("");
  rowBackground.classList = "tableRowBackground";
  tableRow.appendChild(rowBackground);

  return tableRow;

}


export function createRunCard(runStruct){

  const runCard = document.createElement('div');
  runCard.classList = "runCard";
  runCard.id = runStruct.documentId

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
  totalStops.innerText = runStruct.stops.length;

  totalStopsWrapper.appendChild(totalStopsIcon);
  totalStopsWrapper.appendChild(totalStops);



  const fuelCostWrapper = document.createElement('div');
  fuelCostWrapper.classList = "row";

  const fuelCostIcon = document.createElement('span');
  fuelCostIcon.classList = "material-symbols-rounded runInfoIcon";
  fuelCostIcon.innerText = "local_gas_station";

  const fuelCost = document.createElement('p');
  fuelCost.innerText = "£" + (runStruct.isOptimised == true ? runStruct.fuelCost : "0");

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

  return runCard;


}


export function createUnassignedOrdersButton(runStruct){

    const unassignedOrdersCard = document.createElement('div');
    unassignedOrdersCard.id = runStruct.documentId;
    unassignedOrdersCard.classList = "unassignedOrdersCard";

    const reportIcon = document.createElement('span');
    reportIcon.classList = "warningIcon material-symbols-outlined";
    reportIcon.innerText = "report";

    const title = document.createElement('p');
    title.classList = "unassignedOrdersTitle";
    title.innerText = "Unassigned";

    const noOfUnassignedOrders = document.createElement('p');
    noOfUnassignedOrders.classList = "numberOfUnassignedOrders";
    noOfUnassignedOrders.innerText = "#" + runStruct.stops.length;


    unassignedOrdersCard.appendChild(reportIcon);
    unassignedOrdersCard.appendChild(title);
    unassignedOrdersCard.appendChild(noOfUnassignedOrders);


    return unassignedOrdersCard;


}


export function createAddStopButton(){

  const addStopButton = document.createElement('div');
  addStopButton.classList = "addStopButton";

  const reportIcon = document.createElement('span');
  reportIcon.classList = "addIcon material-symbols-outlined";
  reportIcon.innerText = "add";

  const title = document.createElement('p');
  title.classList = "unassignedOrdersTitle";
  title.innerText = "Add Stop";

  addStopButton.appendChild(reportIcon);
  addStopButton.appendChild(title);

  return addStopButton;

}


export function createAddRunButton(){

  const addRunButton = document.createElement('div');
  addRunButton.classList = "addStopButton";

  const reportIcon = document.createElement('span');
  reportIcon.classList = "addIcon material-symbols-outlined";
  reportIcon.innerText = "add";

  const title = document.createElement('p');
  title.classList = "unassignedOrdersTitle";
  title.innerText = "Add Run";

  addRunButton.appendChild(reportIcon);
  addRunButton.appendChild(title);

  return addRunButton;

}


export function createOption(text, value){

  const option = document.createElement('option');
  option.innerText = text;
  option.value = value;

  return option;

}


export function createDragDetectionZone(classList){

  const dragZone = document.createElement('div');
  dragZone.classList = "dragDetectionZone hidden " + classList;

  return dragZone;

}

export function createShipmentOptions(shipmentName, shipments){

  const shipmentOptions = [];

  const selectShipmentOption = document.createElement('option');
  selectShipmentOption.value = "SELECT_SHIPMENT";
  selectShipmentOption.innerText = "-- select a shipment --";
  shipmentOptions.push(selectShipmentOption);


  for(let i = 0; i < shipments.docs.length; i++){

    //add option to select element
    const shipmentOption = document.createElement('option');
    shipmentOption.value = shipments.docs[i].data()['shipmentName'];
    shipmentOption.innerText = shipments.docs[i].data()['shipmentName'];

    if(shipmentName == shipments.docs[i].data()['shipmentName']){
      shipmentOption.selected = true;
    }

    shipmentOptions.push(shipmentOption);

  }

  const createShipmentOption = document.createElement('option');
  createShipmentOption.value = "CREATE_SHIPMENT";
  createShipmentOption.innerText = "-- create a shipment --";
  shipmentOptions.push(createShipmentOption);

  const deleteShipmentOption = document.createElement('option');
  deleteShipmentOption.value = "DELETE_SHIPMENT";
  deleteShipmentOption.innerText = "-- delete a shipment --";
  shipmentOptions.push(deleteShipmentOption);

  return shipmentOptions

}


export function createDriverSelectOptions(drivers, shipmentRunIDs, runID){

  const options = [];

  for(let i = 0; i < drivers.length; i++){

    const option = createOption(drivers[i].driverName, drivers[i].driverID);

    const driverRunsAndShipmentRuns = drivers[i].assignedRuns.concat(shipmentRunIDs);

    const runIDSet = new Set(driverRunsAndShipmentRuns);

    //if driver already assigned run in shipment
    if(driverRunsAndShipmentRuns.length != runIDSet.size){

      if(drivers[i].assignedRuns.includes(runID)){

        option.selected = true;

      }else{

        console.log("driver already assigned run in shipment");
        option.disabled = true;

      }

    }

    options.push(option);

  }

  return options;

}
