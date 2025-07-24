import { db, auth, getDocument, updateDocument } from '/js/firebase';
import { query, doc, collection } from 'firebase/firestore';
import { showNotification } from '/js/Notification';

const fuelCostInput = document.getElementById('fuel_cost_input');
const milesPerGallonInput = document.getElementById('mile_per_gallon_input');
const addRunButton = document.getElementById('addRunButton');
const addPostcodeButton = document.getElementById('addPostcodeButton');
const updateFuelSettingsButton = document.getElementById('update_fuel_settings_button');
const runDefaultsWrapper = document.getElementById('run_defaults_wrapper');
const runDefinitionsWrapper = document.getElementById('run_definitions_wrapper');
const postcodeExceptionsWrapper = document.getElementById('postcode_exceptions_wrapper');
const stopDurationInput = document.getElementById('stop_duration_input');
const additionalStopDurationInput = document.getElementById('additional_stop_duration_input');
const updateStopSettingsButton = document.getElementById('update_stop_duration_button');



let fuelCost;
let milesPerGallon;
let fuelUserInput;
let milesPerGallonUserInput;
let stopDurationSeconds;
let additionalStopDurationSeconds;
let stopDurationSecondsInput;
let additionalStopDurationSecondsInput;


addEventListeners();
fetchFuelSettings();
fetchRunDefaults();
fetchRunDefinitions();
fetchPostcodeExceptions();
fetchRunTimings();


const sortAlphabetically = (a, b) => {

  if(a.runName < b.runName){
    return -1;
  }

  else if(a.runName > b.runName){
    return 1;
  }

  return 0;

}


function addEventListeners(){

    if(addRunButton != null){

        addRunButton.addEventListener('click', () => {

        });

    }

    if(addPostcodeButton != null){

        addPostcodeButton.addEventListener('click', () => {

        });

    }

    if(fuelCostInput != null){
        console.log("awdawd");
        fuelCostInput.addEventListener('input', () => {

            fuelUserInput = fuelCostInput.value;
            fuelSettingsContoller();
            
        });

    }

    if(milesPerGallonInput != null){

        milesPerGallonInput.addEventListener('input', () => {

            milesPerGallonUserInput = milesPerGallonInput.value;
            fuelSettingsContoller();

        });

    }

    if(updateFuelSettingsButton != null){

        updateFuelSettingsButton.addEventListener('click', () => {

            updateFuelSettingsButtonController();

        });

    }
    if(updateStopSettingsButton != null){

        updateStopSettingsButton.addEventListener('click', () => {

            updateStopSettingsButtonController();

        });

    }

    if(stopDurationInput != null){

        stopDurationInput.addEventListener('input', () => {

            stopDurationSecondsInput = stopDurationInput.value;
            stopSettingsContoller();

        });

    }

    if(additionalStopDurationInput != null){

        additionalStopDurationInput.addEventListener('input', () => {

            additionalStopDurationSecondsInput = additionalStopDurationInput.value;
            stopSettingsContoller();

        });

    }

}

async function fetchRunTimings(){

    const runTimingsDocument = await getDocument(query(doc(db, 'Settings', 'runTimings')));
    console.log(runTimingsDocument);
    stopDurationSeconds = runTimingsDocument.data()['stopDurationSeconds'];
    if(stopDurationInput != null){
        stopDurationInput.value = stopDurationSeconds;
        stopDurationSecondsInput = stopDurationSeconds;
    }

    additionalStopDurationSeconds = runTimingsDocument.data()['additionalStopDurationSeconds'];
    if(additionalStopDurationInput != null){
        additionalStopDurationInput.value = additionalStopDurationSeconds;
        additionalStopDurationSecondsInput = additionalStopDurationSeconds;
    }
}

async function fetchFuelSettings(){

    const fuelDocument = await getDocument(query(doc(db, 'Settings', 'fuelSettings')));

    //add fuel cost to ui
    fuelCost = fuelDocument.data()['fuelCost'];
    if(fuelCostInput != null){
        fuelCostInput.value = fuelCost;
        fuelUserInput = fuelCost;
    }

    milesPerGallon = fuelDocument.data()['milesPerGallon'];
    if(milesPerGallonInput != null){
        milesPerGallonInput.value = milesPerGallon;
        milesPerGallonUserInput = milesPerGallon;

    }

}


async function fetchRunDefaults(){

    const runDefaultsDocument = await getDocument(query(doc(db, 'Settings', 'runDefaults')));
    const runDefaults = runDefaultsDocument.data();
    
    const runsList = [];

    for (const run in runDefaults) {

        runsList.push(run);

    }

    runsList.sort();

    for(let i = 0; i < runsList.length; i++){

        runDefaultsWrapper.appendChild(createRunDefaultCard(runsList[i], runDefaults[runsList[i]]));

    }

}


async function fetchRunDefinitions(){

    const runDefinitionsDocument = await getDocument(query(doc(db, 'Settings', 'runDefinitions')));
    const runDefinitions = runDefinitionsDocument.data();

    const runs = [];

    const runSet = new Set();

    runSet.add(null);

    for (const property in runDefinitions) {
        runSet.add(runDefinitions[property]);
    }

    runSet.forEach((runName) => {

        runs.push(
            {
                runName: runName,
                postcodes: []
            }
        );

    });


    for (const postcode in runDefinitions) {

        const runName = runDefinitions[postcode];
        
        for(let j = 0; j < runs.length; j++){

            if(runs[j].runName === runName){
                runs[j].postcodes.push(postcode);
            }

        }
    }


    for(let i = 0; i < runs.length; i++){
        runs[i].postcodes.sort();
    }

    console.log(runs);

    runs.sort(sortAlphabetically);

    for(let i = 0; i < runs.length; i++){

        if(runs[i].runName != null){
            const runDefinitionCard = createRunDefinitionCard(runs[i]);
            runDefinitionsWrapper.appendChild(runDefinitionCard);
        }

    }

}


async function fetchPostcodeExceptions(){

    const postcodeExceptionsDocument = await getDocument(query(doc(db, 'Settings', 'postcodeExceptions')));
    const postcodeExceptions = postcodeExceptionsDocument.data()['exceptions'];

    console.log(postcodeExceptions);

    for(let i = 0; i < postcodeExceptions.length; i++){

        const postcodeExceptionCard = createPostcodeExceptionCard(postcodeExceptions[i]);
        postcodeExceptionsWrapper.appendChild(postcodeExceptionCard);
    }

}


function createRunDefaultCard(run, runDefaultProperties){

    const card = document.createElement('div');
    card.classList = "card";

    const runName = document.createElement('h3');
    runName.classList = "runName";
    runName.innerText = run;


    const collectionDefaults = createRunTypeContainer(runDefaultProperties.collection, "Collection");
    const deliveryDefaults = createRunTypeContainer(runDefaultProperties.delivery, "Delivery");

    const defaultsWrapper = document.createElement('div');
    defaultsWrapper.classList = "defaultsWrapper";

    defaultsWrapper.appendChild(collectionDefaults);
    defaultsWrapper.appendChild(deliveryDefaults);

    const startTime = createStartTime(runDefaultProperties.collection.start.time);

    card.appendChild(runName);
    card.appendChild(defaultsWrapper);
    card.appendChild(startTime);


    return card;

}


function createStartTime(time){

    const startTimeWrapper = document.createElement('div');
    startTimeWrapper.classList = "startTimeWrapper";

    const title = document.createElement('h4');
    title.innerHTML = "Start Time: &nbsp;";

    const startTime = document.createElement('p');
    startTime.innerText = time.hour + ":" + time.minute;

    startTimeWrapper.appendChild(title);
    startTimeWrapper.appendChild(startTime);

    return startTimeWrapper;

}


function createRunTypeContainer(runDefaultProperties, runType){
    
    const startAddress = runDefaultProperties.start.address;
    const endAddress = runDefaultProperties.end.address;


    const startAddressContainer = createAddress(startAddress.address1, startAddress.address2, startAddress.address3, startAddress.postcode);
    const endAddressContainer = createAddress(endAddress.address1, endAddress.address2, endAddress.address3, endAddress.postcode);

    const runTypeContainer = document.createElement('div');
    runTypeContainer.classList = "runTypeContainer";

    const runTypeTitle = document.createElement('h4');
    runTypeTitle.classList = "runTypeTitle";
    runTypeTitle.innerText = runType;

    const arrow = document.createElement('span');
    arrow.classList = "material-symbols-outlined";
    arrow.innerText = "east";

    const addressWrapper = document.createElement('div');
    addressWrapper.classList = "addressWrapper";
    
    addressWrapper.appendChild(startAddressContainer);
    addressWrapper.appendChild(arrow);
    addressWrapper.appendChild(endAddressContainer);


    runTypeContainer.appendChild(runTypeTitle);
    runTypeContainer.appendChild(addressWrapper);

    return runTypeContainer;

}

function createAddress(addressLine1, addressLine2, addressLine3, addressPostcode){

  const addressContainer = document.createElement('div');

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

  addressContainer.appendChild(wrapper);

  return addressContainer;

}


function createRunDefinitionCard(run){

    const runDefinitionCard = document.createElement('div');
    runDefinitionCard.classList = "card";

    const runNameButtonWrapper = document.createElement('div');
    runNameButtonWrapper.classList = "runNameButtonWrapper";

    const runName = document.createElement('h4');
    runName.classList = "runName";
    runName.innerText = run.runName;

    const toggleButton = document.createElement('div');
    toggleButton.classList = "toggleButton";

    const v = document.createElement('p');
    v.innerText = "V";

    toggleButton.appendChild(v);

    toggleButton.addEventListener('click', () => {

        postcodeWrapper.classList.toggle('hidden');
        toggleButton.classList.toggle('rotateButton');

    });

    runNameButtonWrapper.appendChild(runName);
    runNameButtonWrapper.appendChild(toggleButton);

    runDefinitionCard.appendChild(runNameButtonWrapper);

    const postcodeWrapper = document.createElement('div');
    postcodeWrapper.classList = "postcodeWrapper hidden";

    for(let i = 0; i < run.postcodes.length; i++){

        const postcodePill = createPostcodePill(run.postcodes[i]);
        postcodeWrapper.appendChild(postcodePill);
    }

    runDefinitionCard.appendChild(postcodeWrapper);

    return runDefinitionCard;

}


function createPostcodePill(postcodeDefinition){
    
    const postcode = document.createElement('p');
    postcode.classList = "postcode";
    postcode.innerText = postcodeDefinition;

    return postcode

}




function createPostcodeExceptionCard(postcodeException){

    const postcodeExceptionCard = document.createElement('div')
    postcodeExceptionCard.classList = "card";

    const exceptionName = document.createElement('h4');
    exceptionName.classList = "runName";
    exceptionName.innerText = postcodeException.name;

    const exceptionTypes = document.createElement('p');
    exceptionTypes.innerText = "Applies to postcode(s): "

    if(postcodeException.exceptionTypes.includes('COLLECTION')){
        exceptionTypes.innerText += "Collection";
    }

    if(postcodeException.exceptionTypes.includes('DELIVERY')){
        exceptionTypes.innerText += ", Delivery";
    }


    const exceptionMessage = document.createElement('div');
    exceptionMessage.classList = "exceptionMessage";
    exceptionMessage.innerText = "Message: " + postcodeException.message;

    const br = document.createElement('br');

    const postcodeWrapper = document.createElement('div');
    postcodeWrapper.classList = "postcodeWrapper";



    for(let i = 0; i < postcodeException.postcodes.length; i++){

        const postcodePill = createPostcodePill(postcodeException.postcodes[i]);
        postcodeWrapper.appendChild(postcodePill);
    }

    postcodeExceptionCard.appendChild(exceptionName);
    postcodeExceptionCard.appendChild(exceptionTypes);
    postcodeExceptionCard.appendChild(exceptionMessage);
    postcodeExceptionCard.appendChild(br);
    postcodeExceptionCard.appendChild(postcodeWrapper);

    return postcodeExceptionCard;

}

function fuelSettingsContoller(){

    if(updateFuelSettingsButton == null){
        return;
    }   

    if(fuelUserInput != fuelCost){
        updateFuelSettingsButton.classList.remove('hidden');
        return;
    }

    if(milesPerGallonUserInput != milesPerGallon){
        updateFuelSettingsButton.classList.remove('hidden');
        return;
    }

    updateFuelSettingsButton.classList.add('hidden');

}


function stopSettingsContoller(){

    if(updateFuelSettingsButton == null){
        return;
    }   

    if(stopDurationSecondsInput != stopDurationSeconds){
        updateStopSettingsButton.classList.remove('hidden');
        return;
    }

    if(additionalStopDurationSecondsInput != additionalStopDurationSeconds){
        updateStopSettingsButton.classList.remove('hidden');
        return;
    }

    updateStopSettingsButton.classList.add('hidden');

}

function updateStopSettingsButtonController(){

    if(stopDurationSecondsInput < 0){
        alert("Error - stop duration must be greater than -1");
        return;
    }

    if(additionalStopDurationSecondsInput < 0){
        alert("Error - additional stop duration must be greater than -1");
        return;
    }  

    updateStopSettings();

}

function updateFuelSettingsButtonController(){


    if(fuelUserInput <= 0){
        alert("Error - fuel cost must be greater than 0");
        return;
    }

    if(fuelUserInput % 1 !== 0){
        alert("Error - fuel cost must rounded to the nearest whole penny");
        return;
    }  

    updateFuelSettings();

}

function updateFuelSettings(){

    updateDocument(doc(db, 'Settings', 'fuelSettings'), 
        {
            fuelCost: parseInt(fuelUserInput),
            milesPerGallon: parseInt(milesPerGallonUserInput)
        }
    ).then(() => {

        showNotification("Success!", "Fuel cost has been updated");
        fuelCost = fuelUserInput;
        milesPerGallon = milesPerGallonUserInput;

        updateFuelSettingsButton.classList.add('hidden');

    }).catch(() => {

        showNotification("Error!", "Fuel cost has not been updated");

    });

}

function updateStopSettings(){

    updateDocument(doc(db, 'Settings', 'runTimings'), 
        {
            stopDurationSeconds: parseInt(stopDurationSecondsInput),
            additionalStopDurationSeconds: parseInt(additionalStopDurationSecondsInput)
        }
    ).then(() => {

        showNotification("Success!", "Stop settings have been updated");
        stopDurationSeconds = stopDurationSecondsInput;
        additionalStopDurationSeconds = additionalStopDurationSecondsInput;

        updateStopSettingsButton.classList.add('hidden');

    }).catch(() => {

        showNotification("Error!", "Stop settings have not been updated");

    });

}