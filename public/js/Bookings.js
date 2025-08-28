import { validatePostcodes } from "/js/ValidateAddress.js";
import { fetchBirdSpecies, fetchPricePostcodeDefinitions, createAnimalTypeSelectOptions, createDescriptionTable } from "/js/FormModel.js";
import { calculateOrderPrice } from "./FormModel";

const submitOrdersButton = document.getElementById('submitButton');

const loadingSymbol = document.getElementById('loadingsymbol');
const form = document.getElementById('bookingForm');

const collectionName = document.getElementById('collectionName');
const collectionTelephone = document.getElementById('collectionTelephone');
const collectionPostcode = document.getElementById('collectionPostcode');
const email = document.getElementById('email');
const confirmEmail = document.getElementById('confirmEmail');


const deliveryName = document.getElementById('deliveryName');
const deliveryTelephone = document.getElementById('deliveryTelephone');
const deliveryPostcode = document.getElementById('deliveryPostcode');
const paymentOption = document.getElementById('payment');

const quantity = document.getElementById('quantity');
const animalTypeSelect = document.getElementById('animal_type');

const animalTypeWrapper = document.getElementById('animal_type_wrapper');
const hintWrapper = document.getElementById('question_mark_wrapper');

const orderPrice = document.getElementById('order_price');


const requiredFields = [collectionName, collectionAddress1, collectionPostcode, collectionTelephone, email, deliveryName, deliveryAddress1, 
    deliveryPostcode, deliveryTelephone, paymentOption, quantity, animalTypeSelect];

let priceDefinitions;
let birdSpecies;
let birdSpeciesSet = new Set();

init();

async function init(){
    
    const promisesMap = new Map(); 
    const promisesArray = [];

    const birdSpeciesPromise = fetchBirdSpecies();
    promisesArray.push(birdSpeciesPromise)

    // const fetchPricePostcodeDefinitionsPromise = fetchPricePostcodeDefinitions();
    // promisesArray.push(fetchPricePostcodeDefinitionsPromise)

    promisesMap.set("Settings/birdSpecies", birdSpeciesPromise);
    // promisesMap.set("Settings/priceDefinitions", fetchPricePostcodeDefinitionsPromise);

    await Promise.all(promisesArray);

    // priceDefinitions = await promisesMap.get('Settings/priceDefinitions');
    birdSpecies = await promisesMap.get('Settings/birdSpecies');


    for(let i = 0; i < birdSpecies.species.length; i++){

        birdSpeciesSet.add(birdSpecies.species[i].name);

    }   

    const options = createAnimalTypeSelectOptions(birdSpecies);

    for(let i =0; i < options.length; i++){
        animalTypeSelect.appendChild(options[i]);
    }

    // requiredFields.push(animalTypeSelect);

    const animalDescriptionTableAnchor = document.createElement('div');
    animalDescriptionTableAnchor.classList = "animalDescriptionTableAnchor";
    animalTypeWrapper.appendChild(animalDescriptionTableAnchor);

    const animalDescriptionTable = createDescriptionTable(await promisesMap.get('Settings/birdSpecies'));
    animalDescriptionTableAnchor.appendChild(animalDescriptionTable);

    addEventListeners(animalDescriptionTable);

}

function addEventListeners(animalDescriptionTable){

    if(hintWrapper != null){

        hintWrapper.addEventListener('click', () => {

            animalDescriptionTable.classList.toggle("hidden");

        });

    }

    if(submitOrdersButton != null){
    
        submitOrdersButton.addEventListener('click', () => {
            
            submitOrders();

        });

    }

     if(collectionPostcode != null){
    
        collectionPostcode.addEventListener('input', () => {
  
            // updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, animalTypeSelect.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }

    if(deliveryPostcode != null){
    
        deliveryPostcode.addEventListener('input', () => {

            // updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, animalTypeSelect.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }

    if(animalTypeSelect != null){
    
        animalTypeSelect.addEventListener('input', () => {

            // updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, animalTypeSelect.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }
    
    if(quantity != null){
    
        quantity.addEventListener('input', () => {

            // updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, animalTypeSelect.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }


   
}


async function submitOrders(){
    
    //if form fields are filled

    let requiredFieldsMet = true;

    for(let i = 0; i < requiredFields.length; i++){
        console.log(requiredFields[i]);
        requiredFields[i].style.border = "1px solid black";

        if(requiredFields[i].value == ""){
            requiredFields[i].style.border = "1px solid red";
            requiredFieldsMet = false;
        }
    }


    if(requiredFieldsMet){

        let validateResult = await validateForm();

        //Validate fields 
        if(validateResult == null){
            submitOrdersButton.classList = 'hidden';
            loadingSymbol.classList = 'loader';
            form.submit();
        }else{
            alert(validateResult);
        }
        
    }else{
        alert("Please fill in all the required fields");
    }

}


async function validateForm(){ 

    //var isNumber = /^\d+$/;
    const isNumber = new RegExp('^[0-9]*$');
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const deliveryTelephoneNumber = deliveryTelephone.value.replace(" ", "");
    const collectionTelephoneNumber = collectionTelephone.value.replace(" ", "");


    //confirm emails

    if(confirmEmail.value != email.value){
        return "Emails do not match";
    }

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

    const validatePostcodesResult = await validatePostcodes(deliveryPostcode.value, collectionPostcode.value);

    if(validatePostcodesResult != false){
        return validatePostcodesResult;
    }   

    return null;

}

function updatePrice(price){

    if(price == false){
        orderPrice.innerText = " N/A";
        return;
    }

    orderPrice.innerText = " £" + price;


}