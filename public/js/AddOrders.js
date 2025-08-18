import { fetchBirdSpecies, createAnimalTypeSelectOptions, createDescriptionTable } from "/js/FormModel.js";


const email = document.getElementById('email');
const submitButton = document.getElementById('submitButton');
const addOrderForm = document.getElementById('addOrderForm');
const loadingSymbol = document.getElementById('loadingsymbol');
const deliveryPhoneNumber = document.getElementById('deliveryPhoneNumber');
const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');

const animalTypeSelect = document.getElementById('animal_type');

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


    return null;

}