import { createAccountSelectOptions } from "./FormModel";
import { createAnimalTypeSelectOptions, initInternalOrderForm, createDescriptionTable } from "/js/FormModel.js";


const email = document.getElementById('email');
const submitButton = document.getElementById('submitButton');
const addOrderForm = document.getElementById('addOrderForm');
const loadingSymbol = document.getElementById('loadingsymbol');
const deliveryPhoneNumber = document.getElementById('deliveryPhoneNumber');
const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');

const animalTypeSelect = document.getElementById('animal_type');
const accountSelect = document.getElementById('username');
const payment = document.getElementById('payment');

const boxes = document.getElementById('boxes');
const quantity = document.getElementById('quantity');

const animalTypeWrapper = document.getElementById('animal_type_wrapper');
const questionMarkWrapper = document.getElementById('question_mark_wrapper');

const validPaymentOptions = ['Account', 'Collection', 'Delivery', 'Pickup'];
const validAnimalTypes = ['Pigeons - Young Birds', 'Pigeons - Old Birds', 'Aviary & Cage Birds', 'Birds Of Prey', 'Reptiles', 'Small Mammals', 'Small Rodents', 'Poultry & Gamebirds'];

let animalDescriptionTable;

init();

async function init(){

    const formDataMap = await initInternalOrderForm();

    const birdSpecies = formDataMap.get('Settings/birdSpecies');
    const customerAccounts = formDataMap.get('Users'); 

    if(birdSpecies == false){
        return;
    }

    if(customerAccounts == false){
        return;
    }

    const animalTypeOptions = createAnimalTypeSelectOptions(birdSpecies);

    for(let i = 0; i < animalTypeOptions.length; i++){
        animalTypeSelect.appendChild(animalTypeOptions[i]);
    }

    const accountOptions = createAccountSelectOptions(customerAccounts);

    for(let i =0; i < accountOptions.length; i++){
        accountSelect.appendChild(accountOptions[i]);
    }

    const animalDescriptionTableAnchor = document.createElement('div');
    animalDescriptionTableAnchor.classList = "animalDescriptionTableAnchor";
    animalTypeWrapper.appendChild(animalDescriptionTableAnchor);

    animalDescriptionTable = createDescriptionTable(birdSpecies);
    animalDescriptionTableAnchor.appendChild(animalDescriptionTable);

    addEventListeners();

}


    
function addEventListeners(){

    
    if(submitButton != null){
  
        submitButton.addEventListener('click', () => {

            const validateResult = validateForm();
            console.log(validateResult);

            if(validateResult == null){
     
                submitButton.classList = 'hidden';
                loadingSymbol.classList = 'loader';

                addOrderForm.submit();
                return;
            }

            //show alert
            alert(validateResult);

        });

    }else{
        console.log("null");
    }

    if(questionMarkWrapper != null){

        questionMarkWrapper.addEventListener('click', () => {

            const isHidden = animalDescriptionTable.classList.contains('hidden');

            if(isHidden){
                animalDescriptionTable.classList.remove('hidden');
                return;
            }

            animalDescriptionTable.classList.add('hidden');

        });

    }

}


function validateForm(){ 

    const isNumber = new RegExp('^[0-9]*$');
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const deliveryTelephoneNumber = deliveryPhoneNumber.value.replace(" ", "");
    const collectionTelephoneNumber = collectionPhoneNumber.value.replace(" ", "");

    //validate phone numbers
    
    if(!isNumber.test(deliveryTelephoneNumber) || deliveryTelephoneNumber.length != 11){
        return "Delivery Telephone is not a valid phone number. Please enter an 11 digit phone number";
    }

    if(!isNumber.test(collectionTelephoneNumber) || collectionTelephoneNumber.length != 11){
        return "Collection Telephone is not a valid phone number. Please enter an 11 digit phone number";
    }

    //validate email

    if(!email.value.match(isEmail)){
        return "Email is not valid";
    }

    if(!validPaymentOptions.includes(payment.value)){
        return "Please select a valid payment option";
    }

    if(!validAnimalTypes.includes(animalTypeSelect.value)){
        return "Please select a valid animal type";
    }

    if(!isNumber.test(quantity.value) || parseInt(quantity.value) < 1 || quantity.value == ""){
        return "Quantity is not a valid number. Please enter a number greater than 0";
    }

    if(!isNumber.test(boxes.value) || parseInt(boxes.value) < 1 || boxes.value == ""){
        return "Boxes is not a valid number. Please enter a number greater than 0";
    }


    return null;

}


