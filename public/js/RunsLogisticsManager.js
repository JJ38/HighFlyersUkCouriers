import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, orderBy } from "firebase/firestore";


const progressedRunsTableBody = document.getElementById('progressed_runs_table_body');
const isNumber = new RegExp('^[0-9]*$');

init();


function init(){

    getProgressedRuns();
  

}


async function getProgressedRuns(){

    const progressedRunsDocs = await getDocuments(query(collection(db, 'ProgressedRuns'), orderBy('runName', 'desc')));
    
    const progressedRunsData = [];

    for(let i = 0; i < progressedRunsDocs.docs.length; i++){
        progressedRunsData.push(progressedRunsDocs.docs[i].data());
    }

    console.log(progressedRunsData);
    parseProgressedRuns(progressedRunsData)
    createProgressedRunsTableBody(progressedRunsData);

}

function parseProgressedRuns(progressedRunsDocs){
    console.log(progressedRunsDocs);

    for(let i = 0; i < progressedRunsDocs.length; i++){
        calculateRunFinances(progressedRunsDocs[i]);
    }

}

function calculateRunFinances(progressedRunData){

    let totalPromised = 0;
    let totalCollected = 0;
    let unknown = 0;

    const stopPrimaryKeys = [];


    for(let i = 0; i < progressedRunData['stops'].length; i++){

        if(isNumber.test(progressedRunData['stops'][i]['orderData']['price'])){
        
            //add up total promised
            totalPromised += parseInt(progressedRunData['stops'][i]['orderData']['price']);

            //add up total taken
            const amountCollectedResult = parseInt(amountCollectedAtStop(progressedRunData['stops'][i]));

            if(amountCollectedResult == -1){
                //TODO: track orders that are unknown
                unknown += 1;
            }else{
                totalCollected += amountCollectedResult;
            }
            
            const primaryKey = progressedRunData['stops']['orderID'] + "_" + progressedRunData['stops']['stopType'];
            stopPrimaryKeys.push(primaryKey);

        }else{
            unknown += 1;
        }
    
    }

    progressedRunData['totalPromised'] = totalPromised;
    progressedRunData['totalCollected'] = totalCollected;

    console.log(progressedRunData);


    //fetch and parse deferred orders
    


}

function amountCollectedAtStop(stop){

    if(stop['stopStatus'] == "Skipped" || stop['stopStatus'] == "Pending"){
        return 0;
    }
    
    if(isEmpty(stop['orderData'])){
        return -1;
    }

    if(isEmpty(stop['orderData']['payment'])){
        return -1;
    }

    if(stop['orderData']['payment'] == "Account"){
        return 0;
    }

    if(isEmpty(stop['orderData']['price'])){
        return -1;
    }

    if(stop['stopStatus'] == "Complete"){

        if(isEmpty(stop['formDetails'])){
            return 0;
        }

        if(stop['formDetails']['collectedPayment'] == true){
            return stop['orderData']['price'];
        } 

    }

    return -1;

}

function isEmpty(value){

    if(value == null || value == undefined){
        return true;
    }

    return false;

}

function createProgressedRunsTableBody(progressedRunsDocs){

    for(let i = 0; i < progressedRunsDocs.length; i++){
        progressedRunsTableBody.appendChild(createTableOrderCard(progressedRunsDocs[i]));
    }

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



function createTableOrderCard(progressedRunData){

  const tableRow = document.createElement('tr');
  tableRow.classList = "tableDataRow";


  tableRow.appendChild(tableData(progressedRunData['driverName']));
  tableRow.appendChild(tableData(progressedRunData['shipmentName']));
  tableRow.appendChild(tableData(progressedRunData['runName']));
  tableRow.appendChild(tableData(progressedRunData['runStatus']));
  tableRow.appendChild(tableData(progressedRunData['stops'].length));
  tableRow.appendChild(tableData(""));
  tableRow.appendChild(tableData("£" + progressedRunData['totalPromised']));
  tableRow.appendChild(tableData("£" + progressedRunData['totalCollected']));
  tableRow.appendChild(tableData(""));
  tableRow.appendChild(tableData(progressedRunData['updatedAt'] != undefined ? progressedRunData['updatedAt'].toDate().toLocaleString() : "00:00:00"));

//   tableRow.appendChild(
//     createTableAddress(
//       orderData['collectionAddress1'],
//       orderData['collectionAddress2'],
//       orderData['collectionAddress3'],
//       orderData['collectionPostcode'],
//     )
//   );
  
//   tableRow.appendChild(
//     createTableAddress(
//       orderData['deliveryAddress1'],
//       orderData['deliveryAddress2'],
//       orderData['deliveryAddress3'],
//       orderData['deliveryPostcode'],
//     )
//   );

  const rowBackground = tableData("");
  rowBackground.classList = "tableRowBackground";
  tableRow.appendChild(rowBackground);

  return tableRow;

}

function tableData(value){

  const tableData = document.createElement('td');
  tableData.innerHTML = value;

  return tableData;

}