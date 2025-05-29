

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


export function createStopCard(stop, stopMetaDataContainer, lockButtonWrapper, stopNumber){

  const stopData = stop['stopData'];

  const stopContainer = document.createElement('div');
  stopContainer.classList = "stopContainer";


  const stopCard = document.createElement('div');
  stopCard.classList = "stopCard";


  const stopCustomerName = document.createElement('p');
  stopCustomerName.classList = "stopCustomerName";
  stopCustomerName.innerText = stopData['name'];

  const stopAddressLine1 = document.createElement('p');
  stopAddressLine1.classList = "stopAddressLine1";
  stopAddressLine1.innerText = stopData['address1'];


  const stopAddressWrapper = document.createElement('div');
  stopAddressWrapper.classList = "stopAddressWrapper";

  const stopAddressLine2 = document.createElement('p');
  stopAddressLine2.classList = "stopAddressLine2";
  stopAddressLine2.innerHTML = stopData['address2'] + ",&nbsp;";

  const stopAddressLine3 = document.createElement('p');
  stopAddressLine3.classList = "stopAddressLine3";
  stopAddressLine3.innerHTML = stopData['address3'] + ",&nbsp;";

  const stopPostcode = document.createElement('p');
  stopPostcode.classList = "stopPostcode";
  stopPostcode.innerText = stopData['postcode'];



  stopAddressWrapper.appendChild(stopAddressLine2);
  stopAddressWrapper.appendChild(stopAddressLine3);
  stopAddressWrapper.appendChild(stopPostcode);


  stopCard.appendChild(stopMetaDataContainer);
  stopCard.appendChild(stopCustomerName);
  stopCard.appendChild(stopAddressLine1);
  stopCard.appendChild(stopAddressWrapper);
  stopCard.appendChild(lockButtonWrapper);


  stopContainer.appendChild(stopNumber);
  stopContainer.appendChild(stopCard);


  stopContainer.addEventListener('click', () => {


  });


  return stopContainer;

}


export function createStopMetaData(stop){

  const stopData = stop['stopData'];

  const stopMetaDataContainer = document.createElement('div');
  stopMetaDataContainer.classList = "stopMetaDataContainer hidden";

  const orderID = document.createElement('p');
  orderID.innerText = "#" + stopData['ID'];

  const stopType = document.createElement('p');
  stopType.innerText = stop['stopType'] == "collection" ? "Collection" : stop['stopType'] == "delivery" ? "Delivery" : stop['stopType'];

  stopMetaDataContainer.appendChild(orderID);
  stopMetaDataContainer.appendChild(stopType);

  return stopMetaDataContainer;

}

export function createStopLockButton(isLocked){

  const lockButtonWrapper = document.createElement('div');
  lockButtonWrapper.classList = "lockButtonWrapper hidden"; 

  const lockIcon = document.createElement('span');
  lockIcon.classList = "lock material-symbols-outlined"
  lockIcon.innerText = "lock";

  const lockOpenIcon = document.createElement('span');
  lockOpenIcon.classList = "lockOpen material-symbols-outlined";
  lockOpenIcon.innerText = "lock_open";

  if(isLocked){

    lockIcon.classList.add('hidden');

  }else{

    lockOpenIcon.classList.add('hidden');

  }

  
  lockButtonWrapper.appendChild(lockIcon);
  lockButtonWrapper.appendChild(lockOpenIcon);


  return lockButtonWrapper;

}

export function createStopNumber(stopNumberValue){

  const stopNumber = document.createElement('p');
  stopNumber.classList = "stopNumber";
  stopNumber.innerText = stopNumberValue;

  return stopNumber;

}


export function createUnassignedOrdersTableCard(stopData){

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";

  const x = document.createElement('td');
  const checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.value = stopData['orderID'];
  checkBox.classList = "assignStopCheckbox";

  x.appendChild(checkBox);

  tableRow.appendChild(x);

  tableRow.appendChild(tableData(stopData['stopData']['ID']));
  tableRow.appendChild(tableData(stopData['stopData']['animalType']));
  tableRow.appendChild(tableData(stopData['stopData']['quantity']));
  tableRow.appendChild(tableData(stopData['stopType']));

  tableRow.appendChild(tableData(stopData['stopData']['name']));

  tableRow.appendChild(
    createTableAddress(
      stopData['stopData']['address1'],
      stopData['stopData']['address2'],
      stopData['stopData']['address3'],
      stopData['stopData']['postcode'],
    )
  );

  tableRow.appendChild(tableData(stopData['stopData']['phoneNumber']));
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


export function createTableOrderCard(doc){

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
  tableRow.appendChild(tableData(orderData['account']));
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
    fuelCost.innerText = "£" + runStruct.fuelCost;

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


export function createOption(text, value){

  const option = document.createElement('option');
  option.innerText = text;
  option.value = value;

  return option;

}