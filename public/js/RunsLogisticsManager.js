import { defer } from "lodash";
import { db, getDocuments } from "/js/Firebase.js";
import { query, collection, orderBy, where } from "firebase/firestore";
import { showNotification } from "/js/Notification.js";


const progressedRunsTableBody = document.getElementById('progressed_runs_table_body');
const progressedRunsTableWrapper = document.getElementById('progressed_runs_table_wrapper');
const searchFilterInput = document.getElementById('runs_search_input');
const searchFilterSelect = document.getElementById('search_filter_select');
const searchRunsButton = document.getElementById('search_runs_button');
const tableHeader = document.getElementById('table_header_container');
const tableActionContainer = document.getElementById('table_action_container');
const progressedRunDetailsContainer = document.getElementById('progressed_run_details_container');
const closeProgressedRunDetailsContainer = document.getElementById('close_progressed_run_details_container_button')
const progressedRunsDetailsTableBody = document.getElementById('progressed_run_details_table_body');

const isNumber = new RegExp('^[0-9]*$');

let searchFilterInputValue;
let searchFilterSelectValue;
let loadingSymbol;

init();


function init(){

    getProgressedRuns();
    addEventListeners();

}

function addEventListeners(){

    if(searchFilterInput != null){

        searchFilterInput.addEventListener('input', () => {

            searchFilterInputValue = searchFilterInput.value;

        });

    }

    if(searchFilterSelect != null){
        
        searchFilterSelect.addEventListener('input', () => {

            searchFilterSelectValue = searchFilterSelect.value;

        });

    }

    if(searchRunsButton != null){

        searchRunsButton.addEventListener('click', () => {

            const searchedRunsSuccessfully = searchRuns();

            if(!searchedRunsSuccessfully){
                showNotification("Error!", "")
            }

        });

    }

    if(closeProgressedRunDetailsContainer != null){
        
        closeProgressedRunDetailsContainer.addEventListener('click', () => {
            progressedRunDetailsContainer.classList.remove('slideIn');

        })

    }

}

function showUI(element){
    element.classList.remove('hidden');
}

function hideUI(element){
    element.classList.add('hidden');
}


function createLoadingSymbol(){

    loadingSymbol = document.createElement('div');    
    loadingSymbol.classList = "loadingSymbolWrapper";

    const loader = document.createElement('div');    
    loader.classList = "loader center";

    loadingSymbol.appendChild(loader);

    return loadingSymbol;
}

function showLoadingOrders(){

    progressedRunsTableBody.innerHTML = "";
    // progressedRunsTableBody.appendChild(createLoadingSymbol());
    progressedRunsTableWrapper.after(createLoadingSymbol())

}

function hideLoadingOrders(){

    if(loadingSymbol != null){

        loadingSymbol.remove();

    }

}

async function searchRuns(){

    if(isEmpty(searchFilterInputValue)){
        showNotification("Error!", "Please enter a value to fitler by");
        return;
    }

    if(isEmpty(searchFilterSelectValue)){
        showNotification("Error!", "Please select a field to filter by");
        return;
    }

    showLoadingOrders();


    //fetch documents
    const progressedRunsDocs = await getDocuments(query(collection(db, 'ProgressedRuns'), where(searchFilterSelectValue, "==", searchFilterInputValue)));
    console.log(progressedRunsDocs);

    if(progressedRunsDocs == false){
        showNotification("Error!", "Error fetching runs");
        return;
    }

    //parse document

    const progressedRunsData = [];

    for(let i = 0; i < progressedRunsDocs.docs.length; i++){
        progressedRunsData.push(progressedRunsDocs.docs[i].data());
    }

    await parseProgressedRuns(progressedRunsData, progressedRunsDocs.docs);
    updateProgressedRunsTableBody(progressedRunsData);


}



async function getProgressedRuns(){

    showLoadingOrders();

    const progressedRunsDocs = await getDocuments(query(collection(db, 'ProgressedRuns'), orderBy('shipmentName', 'desc')));
    const progressedRunsData = [];

    for(let i = 0; i < progressedRunsDocs.docs.length; i++){
        progressedRunsData.push(progressedRunsDocs.docs[i].data());
    }

    await parseProgressedRuns(progressedRunsData, progressedRunsDocs.docs);
    updateProgressedRunsTableBody(progressedRunsData);

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

    if(value == null || value == undefined || value == ""){
        return true;
    }

    return false;

}

function updateProgressedRunsTableBody(progressedRunsData){

    hideLoadingOrders();

    for(let i = 0; i < progressedRunsData.length; i++){
        
        const tableRunCard = createTableRunCard(progressedRunsData[i]);
        addTableRunCardListener(tableRunCard, progressedRunsData[i]);
        progressedRunsTableBody.appendChild(tableRunCard);
    }

}

function addTableRunCardListener(tableRunCard, progressedRunData){

    tableRunCard.addEventListener('click', () => {

        progressedRunDetailsContainer.classList.add('slideIn');
        parseStopsData(progressedRunData['stops']);

    });

}

function parseStopsData(stops){

    if(isEmpty(stops)){
        console.log("stops is empty");
        return;
    }

    for(let i = 0; i < stops.length; i++){
        progressedRunsDetailsTableBody.appendChild(createTableStopCard(stops[i]));
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


function createTableStopCard(stopData){

    const tableRow = document.createElement('tr');
    tableRow.classList = "tableDataRow runCard";

    console.log(stopData);


    tableRow.appendChild(tableData(stopData['stopNumber']));
    tableRow.appendChild(tableData(stopData['stopType'] == "collection" ? "Collection" : "Delivery"));
    tableRow.appendChild(tableData(stopData['stopData']['ID']));
    tableRow.appendChild(tableData(stopData['stopStatus']));


    tableRow.appendChild(
        createTableAddress(
            stopData['stopData']['address1'],
            stopData['stopData']['address2'],
            stopData['stopData']['address3'],
            stopData['stopData']['postcode'],
        )
    );

    let formDetails = stopData['formDetails'];

    if(formDetails == null){
        formDetails = {};
    }


    tableRow.appendChild(tableData(isEmpty(formDetails['animalType']) ? "" : formDetails['animalType']));
    tableRow.appendChild(tableData(isEmpty(formDetails['quantity']) ? "" : formDetails['quantity']));
    tableRow.appendChild(tableData(isEmpty(formDetails['collectedPayment']) ? "No" : formDetails['collectedPayment'] ? "Yes" : "No"));
    tableRow.appendChild(tableData(isEmpty(formDetails['notes']) ? "" : formDetails['notes']));
    
    const rowBackground = document.createElement('div');
    rowBackground.classList = "tableRowBackground";
    tableRow.appendChild(rowBackground);


    return tableRow;

}


function createTableRunCard(progressedRunData){

    const tableRow = document.createElement('tr');
    tableRow.classList = "tableDataRow runCard";

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


    const rowHoverDetector = tableData("");
    rowHoverDetector.classList = "rowHoverDetector";

    const rowBackground = document.createElement('div');
    rowBackground.classList = "tableRowBackground";

    rowHoverDetector.appendChild(rowBackground);

    tableRow.appendChild(rowHoverDetector);

    // rowHoverDetector.appendChild(rowBackground);


    // tableRow.appendChild(rowHoverDetector);


    return tableRow;

}

function tableData(value){

  const tableData = document.createElement('td');
  tableData.innerHTML = value;

  return tableData;

}