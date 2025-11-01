import { defer } from "lodash";
import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, orderBy, where } from "firebase/firestore";


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

    await parseProgressedRuns(progressedRunsData, progressedRunsDocs.docs);
    createProgressedRunsTableBody(progressedRunsData);

}

async function parseProgressedRuns(progressedRunsData, progressedRunsDocs){

    const deferredPaymentsPromises = new Map();
    let deferredPaymentsPromisesList = [];

    for(let i = 0; i < progressedRunsData.length; i++){

        calculateStopMetaData(progressedRunsData[i]);

        const deferredPaymentsQueries = getDeferredPaymentsQueries(progressedRunsData[i]['deferredPaymentPrimaryKeys']);

        deferredPaymentsPromisesList = deferredPaymentsPromisesList.concat(deferredPaymentsQueries);
        deferredPaymentsPromises.set(progressedRunsDocs[i].id, deferredPaymentsQueries);  

    }

    await Promise.all(deferredPaymentsPromisesList);
    await parseDeferredPayments(deferredPaymentsPromises, progressedRunsData, progressedRunsDocs);
    
}

async function parseDeferredPayments(deferredPaymentsPromises, progressedRunsData, progressedRunsDocs){

    for(let i = 0; i < progressedRunsDocs.length; i++){

        const deferredPaymentsForRunPromises = deferredPaymentsPromises.get(progressedRunsDocs[i].id);
        let deferredPayments = [];

        for(let i = 0; i < deferredPaymentsForRunPromises.length; i++){

            const deferredPaymentsForRun = await deferredPaymentsForRunPromises[i];
            const deferredPaymentDocs = deferredPaymentsForRun.docs
            deferredPayments = deferredPayments.concat(deferredPaymentDocs);

        }

        progressedRunsData[i]['deferredPayments'] = deferredPayments;

    }

}

function getDeferredPaymentsQueries(deferredPaymentPrimaryKeys){

    const queryLimit = 30;
    const queries = [];

    for(let i = 0; i < deferredPaymentPrimaryKeys.length; i++){

        if(deferredPaymentPrimaryKeys.length <= queryLimit){

            queries.push(getDocuments(query(collection(db, 'DeferredPayments'), where("stopID", "in", deferredPaymentPrimaryKeys))));
            deferredPaymentPrimaryKeys.splice(0, deferredPaymentPrimaryKeys.length);

        }else{

            queries.push(getDocuments(query(collection(db, 'DeferredPayments'), where("stopID", "in", deferredPaymentPrimaryKeys.slice(0, queryLimit)))));
            deferredPaymentPrimaryKeys.splice(0, queryLimit);

        }

    }

    return queries;

}


function calculateStopMetaData(progressedRunData){

    let totalPromised = 0;
    let totalSkippedStops = 0;
    let totalCollected = 0;
    let unknown = 0;

    const deferredPaymentPrimaryKeys = [];
    const stops = progressedRunData['stops'];

    for(let i = 0; i < stops.length; i++){

        if(stops[i]['stopStatus'] == "Skipped"){
            totalSkippedStops += 1;
        }

        if(isNumber.test(stops[i]['orderData']['price'])){
        
            //add up total promised
            totalPromised += parseInt(stops[i]['orderData']['price']);

            //add up total taken
            const amountCollectedResult = parseInt(amountCollectedAtStop(stops[i]));

            if(amountCollectedResult == -1){
                //TODO: track orders that are unknown
                unknown += 1;
            }else{
                totalCollected += amountCollectedResult;
            }
            
            const deferredPaymentType = stops[i]['stopType'] == "collection" ? "delivery" : "chase";

            const deferredPaymentPrimaryKey = stops[i]['orderID'] + "_" + deferredPaymentType;
            deferredPaymentPrimaryKeys.push(deferredPaymentPrimaryKey);

        }else{
            unknown += 1;
        }
    
    }

    //create deferred payments query

    progressedRunData['deferredPaymentPrimaryKeys'] = deferredPaymentPrimaryKeys;
    progressedRunData['totalSkippedStops'] = totalSkippedStops;
    progressedRunData['totalPromised'] = totalPromised;
    progressedRunData['totalCollected'] = totalCollected;

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
            return -1;
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

function createProgressedRunsTableBody(progressedRunsData){

    for(let i = 0; i < progressedRunsData.length; i++){
        console.log("progressedRunsData[" + i + "]")
        progressedRunsTableBody.appendChild(createTableOrderCard(progressedRunsData[i]));
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

    console.log(progressedRunData);
    console.log(progressedRunData['deferredPayments']);


    tableRow.appendChild(tableData(progressedRunData['driverName']));
    tableRow.appendChild(tableData(progressedRunData['shipmentName']));
    tableRow.appendChild(tableData(progressedRunData['runName']));
    tableRow.appendChild(tableData(progressedRunData['runStatus']));
    tableRow.appendChild(tableData(progressedRunData['stops'].length));
    tableRow.appendChild(tableData(progressedRunData['totalSkippedStops']));
    tableRow.appendChild(tableData("£" + progressedRunData['totalPromised']));
    tableRow.appendChild(tableData("£" + progressedRunData['totalCollected']));
    tableRow.appendChild(tableData(progressedRunData['deferredPayments'] == undefined ? "0" : progressedRunData['deferredPayments'].length));
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