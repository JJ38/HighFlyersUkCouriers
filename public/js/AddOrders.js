import { fetchBirdSpecies, createAnimalTypeSelectOptions } from "/js/FormModel.js";


const email = document.getElementById('email');
const submitButton = document.getElementById('submitButton');
const addOrderForm = document.getElementById('addOrderForm');
const loadingSymbol = document.getElementById('loadingsymbol');
const deliveryPhoneNumber = document.getElementById('deliveryPhoneNumber');
const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');

const animalTypeSelect = document.getElementById('animal_type');
const payment = document.getElementById('payment');

const boxes = document.getElementById('boxes');
const quantity = document.getElementById('quantity');


const validPaymentOptions = ['Account', 'Collection', 'Delivery'];
const validAnimalTypes = ['Pigeons - Young Birds', 'Pigeons - Old Birds', 'Aviary & Cage Birds', 'Birds Of Prey', 'Reptiles', 'Small Mammals', 'Small Rodents', 'Poultry & Gamebirds'];


init();

async function init(){

    const birdSpecies = await fetchBirdSpecies();

    const options = createAnimalTypeSelectOptions(birdSpecies);

    for(let i =0; i < options.length; i++){
        animalTypeSelect.appendChild(options[i]);
    }

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