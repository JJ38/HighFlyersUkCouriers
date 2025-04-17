import { db, auth, getDocument, updateDocument } from '/js/firebase';
import { query, doc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";
import { showNotification } from '/js/Notification';

const fuelCostInput = document.getElementById('fuelCostInput');
const addRunButton = document.getElementById('addRunButton');
const addPostcodeButton = document.getElementById('addPostcodeButton');
const updateFuelCostButton = document.getElementById('updateFuelCostButton');


let currentFuelCost;
let fuelInput;

addEventListeners();


onAuthStateChanged(auth, (user) => {

  if (user) {

    auth.currentUser.getIdTokenResult().then(async (getIdTokenResult) => {
      console.log(getIdTokenResult.claims.role);   
      fetchFuelCost();

    });
  }

});


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