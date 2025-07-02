import { db, auth, getDocument, updateDocument } from '/js/firebase';
import { query, doc } from 'firebase/firestore';
import { showNotification } from '/js/Notification';

const fuelCostInput = document.getElementById('fuelCostInput');
const addRunButton = document.getElementById('addRunButton');
const addPostcodeButton = document.getElementById('addPostcodeButton');
const updateFuelCostButton = document.getElementById('updateFuelCostButton');
const runDefinitionsWrapper = document.getElementById('run_definitions_wrapper');
const postcodeExceptionsWrapper = document.getElementById('postcode_exceptions_wrapper');



let currentFuelCost;
let fuelInput;

addEventListeners();
fetchFuelCost();
fetchPostcodes();
fetchPostcodeExceptions();



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
        fuelCostInput.addEventListener('input', (input) => {

            fuelCostInputController(input);
            
        });

    }

    if(updateFuelCostButton != null){

        updateFuelCostButton.addEventListener('click', () => {

            updateFuelCostButtonController();

        });

    }

}


async function fetchFuelCost(){

    const fuelDocument = await getDocument(query(doc(db, 'Settings', 'fuelcost')));

    //add fuel cost to ui
    currentFuelCost = fuelDocument.data()['fuelcost'];
    if(fuelCostInput != null){
        fuelCostInput.value = currentFuelCost;
    }

}

async function fetchPostcodes(){

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


async function fetchPostcodeExceptions(){

    const postcodeExceptionsDocument = await getDocument(query(doc(db, 'Settings', 'postcodeExceptions')));
    const postcodeExceptions = postcodeExceptionsDocument.data()['exceptions'];

    console.log(postcodeExceptions);

    for(let i = 0; i < postcodeExceptions.length; i++){

        const postcodeExceptionCard = createPostcodeExceptionCard(postcodeExceptions[i]);
        postcodeExceptionsWrapper.appendChild(postcodeExceptionCard);
    }

}


function createPostcodeExceptionCard(postcodeException){

    console.log(postcodeException.exceptionTypes);

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


function areaCodePillController(){



}


function fuelCostInputController(input){

    fuelInput = input.target.value;

    if(fuelInput != currentFuelCost){

        if(updateFuelCostButton != null){
            updateFuelCostButton.classList.remove('hidden');
        }

    }else{
        updateFuelCostButton.classList.add('hidden');
    }

}

function updateFuelCostButtonController(){


    if(fuelInput <= 0){
        alert("Error - fuel cost must be greater than 0");
        return;
    }

    if(fuelInput % 1 !== 0){
        alert("Error - fuel cost must rounded to the nearest whole penny");
        return;
    }  

    updateFuelCost();

}

function updateFuelCost(){

    updateDocument(doc(db, 'Settings', 'fuelcost'), {fuelcost: parseInt(fuelInput)}).then(() => {

        showNotification("Success!", "Fuel cost has been updated");
        currentFuelCost = fuelInput;
        updateFuelCostButton.classList.add('hidden');

    }).catch(() => {

        showNotification("Error!", "Fuel cost has not been updated");

    });


}