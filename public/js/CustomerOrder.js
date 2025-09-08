// const transportinfowrapper = document.querySelector('.transportinfowrapper');
// const addressDataRow = transportinfowrapper.querySelectorAll('.columns');
import { db, auth, getDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { validatePostcodes } from "/js/ValidateAddress.js";
import { fetchBirdSpecies, fetchPricePostcodeDefinitions, calculateOrderPrice, createAnimalTypeSelectOptions, createDescriptionTable } from "/js/FormModel.js";


const quickCollectionAddress = document.querySelector('.quickcollectionaddresswrapper');
const collectionAddressInfo = document.getElementById('collectioninfoFormWrapper');
var transporticons;
// var exandButtons = document.querySelectorAll('.expand');

const basket = document.getElementById('basket');
const addToBasketButton = document.getElementById('addToBasketButton');
const submitOrderButton = document.getElementById('submitorders');

//inputform elements

const code = document.getElementById('code');
const quantity = document.getElementById('quantity');
const quickAddress = document.getElementById('quickaddress');
const boxes = document.getElementById('boxes');


const quickAddressName = document.getElementById('quickAddressName');
const quickAddress1 = document.getElementById('quickAddress1');
const quickAddress2 = document.getElementById('quickAddress2');
const quickAddress3 = document.getElementById('quickAddress3');
const quickAddressPostcode = document.getElementById('quickAddressPostcode');
const quickAddressEmail = document.getElementById('quickAddressEmail');
const quickAddressTelephone = document.getElementById('quickAddressTelephone');

const collectionName = document.getElementById('collectionName');
const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');
const collectionPostcode = document.getElementById('collectionPostcode');
const email = document.getElementById('email');
const profileEmail = document.getElementById('profileemail');

const deliveryName = document.getElementById('deliveryName');
const deliveryPhoneNumber = document.getElementById('deliveryPhoneNumber');
const deliveryPostcode = document.getElementById('deliveryPostcode');
const paymentOption = document.getElementById('payment');
const message = document.getElementById('message');

const animalType = document.getElementById('animal_type');

const animalTypeWrapper = document.getElementById('animal_type_wrapper');
const hintWrapper = document.getElementById('question_mark_wrapper');

const orderPrice = document.getElementById('order_price');

const requiredFields = [collectionName, collectionAddress1, collectionPostcode, collectionPhoneNumber, email, deliveryName, deliveryAddress1, 
    deliveryPostcode, deliveryPhoneNumber, paymentOption, quantity, 
    animalType, boxes];

const table = document.getElementById('table');
const loadingSymbol = document.getElementById('loadingsymbol');
const submitOrdersButton = document.getElementById('submitorders');

let animalTypeValue;
let quantityValue;
let codeValue = "N/A";
let boxesValue;
let collectionNameValue;
let collectionPostcodeValue;
let collectionAddress1Value;
let collectionAddress2Value;
let collectionAddress3Value;
let collectionTelephoneValue;
let deliveryNameValue;
let deliveryPostcodeValue;
let deliveryAddress1Value;
let deliveryAddress2Value;
let deliveryAddress3Value;
let deliveryTelephoneValue;
let emailValue;
let paymentOptionValue;
let messageValue;
let orderPriceValue;
let addedToBasket = false;
let idBookmark = 0;
var uid;

let animalDescriptionTable;

let priceDefinitions;
let birdSpecies;
let birdSpeciesSet = new Set();


init();

async function init(){

    const promisesMap = new Map(); 
    const promisesArray = [];

    const birdSpeciesPromise = fetchBirdSpecies();
    promisesArray.push(birdSpeciesPromise)

    const fetchPricePostcodeDefinitionsPromise = fetchPricePostcodeDefinitions();
    promisesArray.push(fetchPricePostcodeDefinitionsPromise)

    promisesMap.set("Settings/birdSpecies", birdSpeciesPromise);
    promisesMap.set("Settings/priceDefinitions", fetchPricePostcodeDefinitionsPromise);

    await Promise.all(promisesArray);

    birdSpecies = await promisesMap.get('Settings/birdSpecies');
    priceDefinitions = await promisesMap.get('Settings/priceDefinitions');


    for(let i = 0; i < birdSpecies.species.length; i++){

        birdSpeciesSet.add(birdSpecies.species[i].name);

    }   

    const options = createAnimalTypeSelectOptions(birdSpecies);

    for(let i =0; i < options.length; i++){
        animalType.appendChild(options[i]);
    }
    
    const animalDescriptionTableAnchor = document.createElement('div');
    animalDescriptionTableAnchor.classList = "animalDescriptionTableAnchor";
    animalTypeWrapper.appendChild(animalDescriptionTableAnchor);

    animalDescriptionTable = createDescriptionTable(birdSpecies);
    animalDescriptionTableAnchor.appendChild(animalDescriptionTable);

    setupEventListeners();

}


onAuthStateChanged(auth, (user) => {

    if (user) {
    // User is signed in

    uid = user.uid;
    const docRef = doc(db, "Customers", uid);

    getDocument(docRef).then((doc) => {
        setProfileData(doc.data());
        //show customer profile data
        // loader.style.display = "none";
        // customerProfileData.classList.remove("hidden");
    });

    } else {
    // User is signed out

    }

});


function setProfileData(customerProfileData){

    //used to check if email has been set in profile.
    profileEmail.value = customerProfileData['email'];

    quickAddressEmail.innerText = customerProfileData['email'];
    quickAddressName.innerText = customerProfileData['collectionName'];
    quickAddress1.innerText = customerProfileData['collectionAddress1'];
    quickAddress2.innerText = customerProfileData['collectionAddress2'];
    quickAddress3.innerText = customerProfileData['collectionAddress3'];
    quickAddressPostcode.innerText = customerProfileData['collectionPostcode'];
    quickAddressTelephone.innerText = customerProfileData['collectionPhoneNumber'];


    email.value = customerProfileData['email'];
    collectionName.value = customerProfileData['collectionName'];
    collectionAddress1.value = customerProfileData['collectionAddress1'];
    collectionAddress2.value = customerProfileData['collectionAddress2'];
    collectionAddress3.value = customerProfileData['collectionAddress3'];
    collectionPostcode.value = customerProfileData['collectionPostcode'];
    collectionPhoneNumber.value = customerProfileData['collectionPhoneNumber'];
   
}

// updateTransportIconsPositon();

onresize = (event) => {
    // document.querySelectorAll('')
    //updateTransportIconsPositions(transporticons); //reworking for multiple expanded orders
}

function setupEventListeners(){

    if(hintWrapper != null){

        hintWrapper.addEventListener('click', () => {
            console.log("awiopjdiopawd");
            animalDescriptionTable.classList.toggle("hidden");

        });

    }


    if(collectionPostcode != null){
    
        collectionPostcode.addEventListener('input', () => {
    
            updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, boxes.value, animalType.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }

    if(deliveryPostcode != null){
    
        deliveryPostcode.addEventListener('input', () => {

            updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, boxes.value, animalType.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }

    if(animalType != null){
    
        animalType.addEventListener('input', () => {

           updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, boxes.value, animalType.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }
    
    if(quantity != null){
    
        quantity.addEventListener('input', () => {

            updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, boxes.value, animalType.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }

    if(boxes != null){
    
        boxes.addEventListener('input', () => {

            updatePrice(calculateOrderPrice(collectionPostcode.value, deliveryPostcode.value, quantity.value, boxes.value, animalType.value, birdSpecies, priceDefinitions, birdSpeciesSet));

        });

    }


    quickCollectionAddress.addEventListener('click', (e) => {

        quickCollectionAddress.children[0].classList.toggle('rotate90anticlockwise');
        collectionAddressInfo.classList.toggle('hideInfo');
    
    });
    
    addToBasketButton.addEventListener('click', () => {
    
        addToBasket();
    
    });

    submitOrderButton.addEventListener('click', () => {

        submitOrders();

    });

}

function updatePrice(price){

    return;

    orderPriceValue = price;

    console.log(orderPriceValue);

    if(price == false){
        orderPrice.innerText = " N/A";
        return;
    }

    orderPrice.innerText = " £" + price;

}


function updateQuickAddressName(){
    quickAddressName.innerHTML = collectionName.value;

}
function updateQuickAddressPostcode(){
    quickAddressPostcode.innerHTML = collectionPostcode.value;

}
function updateQuickAddressTelephone(){
    quickAddressTelephone.innerHTML = collectionTelephone.value;

}
function updateQuickAddress1(){
    quickAddress1.innerHTML = collectionAddress1.value;

}
function updateQuickAddress2(){
    quickAddress2.innerHTML = collectionAddress2.value;

}
function updateQuickAddress3(){
    quickAddress3.innerHTML = collectionAddress3.value;
    
}   

function updateQuickAddressEmail(){
    quickAddressEmail.innerHTML = email.value;

}


async function validateOrder(){ 

    var isNumber = /^\d+$/;
    var isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    //validate phone numbers
    
    if((!deliveryPhoneNumber.value.match(isNumber)) || !(deliveryPhoneNumber.value.length > 10 && deliveryPhoneNumber.value.length < 12)){
        return "Delivery Telephone is not a valid phone number";
    }

    if((!collectionPhoneNumber.value.match(isNumber)) || !(collectionPhoneNumber.value.length > 10 && collectionPhoneNumber.value.length < 12)){
        return "Collection Telephone is not a valid phone number";
    }

    //validate quantity

    if(!quantity.value.match(isNumber) || parseInt(quantity.value) < 1){
        return "Quantity is not a valid number";
    }

    if(!boxes.value.match(isNumber) || parseInt(boxes.value) < 1){
        return "Boxes is not a valid number";
    }

    //validate email

    if(!email.value.match(isEmail)){
        return "Email is not valid";
    }

    //validate payment method

    if(paymentOption.value != "Pickup" && paymentOption.value != "Delivery" && paymentOption.value != "Account"){
        return "Payment method is not valid";
    }

    const validatePostcodesResult = await validatePostcodes(deliveryPostcode.value, collectionPostcode.value);

    if(validatePostcodesResult != false){
        return validatePostcodesResult;
    }   

    return null;

}


async function addToBasket(){
    
    try{
        //check if profile has email
        var isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!profileEmail.value.match(isEmail)){
            alert("Please enter a valid email under the profile tab before making an order");
        }
        
        //check if required fields are filled
        let requiredFieldsMet = true;
     
        for(let i = 0; i < requiredFields.length; i++){

            if(requiredFields[i].value == ""){
                requiredFields[i].style.borderColor = "#ff0000ff";
                requiredFieldsMet = false;
            }else{
                requiredFields[i].style.borderColor = "#000000FF";
            }
        }

        if(!requiredFieldsMet){
            alert("Please fill in all required fields");
            return;
        }


        //validate fields
        const validateResult = await validateOrder();
        if(validateResult != null){
            alert(validateResult);
            return;
        }

        animalTypeValue = animalType.value;
        quantityValue = quantity.value;
        codeValue = code.value;
        boxesValue = boxes.value;
        collectionNameValue = collectionName.value;
        collectionPostcodeValue = collectionPostcode.value;
        collectionAddress1Value = collectionAddress1.value;
        collectionAddress2Value = collectionAddress2.value;
        collectionAddress3Value = collectionAddress3.value;
        collectionTelephoneValue = collectionPhoneNumber.value;
        deliveryNameValue = deliveryName.value;
        deliveryPostcodeValue = deliveryPostcode.value;
        deliveryAddress1Value = deliveryAddress1.value;
        deliveryAddress2Value = deliveryAddress2.value;
        deliveryAddress3Value = deliveryAddress3.value;
        deliveryTelephoneValue = deliveryPhoneNumber.value;
        emailValue = email.value;
        paymentOptionValue = paymentOption.value;
        messageValue = message.value;
        
        //update local storage

        addOrderHTML(idBookmark);
        resetFormValues();
        updateBasket();

    }catch(e){

        console.log(e);
    }
    

}

function addOrderHTML(id){

    console.log(orderPriceValue);

    const tableRow = document.createElement('div');
    tableRow.classList = "tablerow";

    const orderHTML =   
                        '<div class="transportinfowrapper">'+
                            '<div class="hideInfo collectiondeliveryicons transporticons">'+
                                '<i class="fa-solid fa-box-open" title="collection"></i>'+
                                '<i class="fa-solid fa-ellipsis-vertical"></i>'+
                                '<i class="fa-solid fa-truck" title="delivery"></i>'+
                            '</div>'+
                            '<div class="columns hideInfo collectioninfomargin">'+
                                '<p>' + animalTypeValue + '</p>'+
                                '<p>' + quantityValue + '</p>'+
                                '<p>' + collectionNameValue + '</p>'+
                                '<div class="onelineaddress"><p>' + collectionAddress1Value + '</p><p>' + collectionAddress2Value + '</p><p>' + collectionAddress3Value + '</p><p>' + collectionPostcodeValue + '</p></div>'+
                                '<p>' + collectionTelephoneValue + '</p>'+
                                '<p></p>'+
                            '</div>'+
                            '<div class="columns deliveryinfomargin">'+
                                '<p class="">' + animalTypeValue + '</p>'+
                                '<p>' + quantityValue + '</p>'+
                                '<p>' + deliveryNameValue + '</p>'+
                                '<div class="onelineaddress"><p>' + deliveryAddress1Value + '</p><p>' + deliveryAddress2Value + '</p><p>' + deliveryAddress3Value + '</p><p>' + deliveryPostcodeValue + '</p></div>'+
                                '<p>' + deliveryTelephoneValue + '</p>'+
                                '<p class="">' + paymentOptionValue + '</p>'+
                                '<div class="expand" onclick="toggleExpand(this)"><p>V</p></div>'+
                            '</div>'+
                        '</div>'+
                        '<div class="extrainfo hideInfo">'+
                            '<div>'+
                                '<i class="fa-solid fa-at" title="email"></i>'+
                                '<p>'+
                                    emailValue +
                                '</p>'+
                            '</div>'+
                            '<div>'+
                                '<i class="fa-solid fa-credit-card" title="payment on delivery or collection"></i>'+
                                '<p>'+
                                    paymentOptionValue +
                                '</p>'+
                            '</div>'+
                            '<div>'+
                                '<i class="fa-solid fa-ticket-simple" title="code"></i>'+
                                '<p>'+
                                    codeValue +
                                '</p>'+
                            '</div>'+
                            '<div>'+
                                '<i class="fa-solid fa-boxes-stacked" title="boxes"></i>'+
                                '<p>'+
                                    boxesValue +
                                '</p>'+
                            '</div>'+
                            // '<div>'+
                            //     '<i class="fa-solid fa-money-bill"></i>'+
                            //     '<p>'+
                            //         orderPriceValue +
                            //     '</p>'+
                            // '</div>'+
                            '<div>'+
                                '<i class="fa-solid fa-message" title="message"></i>'+
                                '<p>'+
                                    messageValue +
                                '</p>'+
                            '</div>'+
                        '</div>'+
                        '<div id="' + id + '" class="deletewrapper hideInfo">'+
                            '<i class="fa-solid fa-trash-can"></i>'+
                        '</div>' +
                        '<input type=hidden name=id value=' + id + '>';
                        
    tableRow.innerHTML = orderHTML;
    table.appendChild(tableRow);

    //add delete or even listener
    const deleteButton = document.getElementById(id);
    deleteButton.addEventListener('click', () => {

        deleteOrder(deleteButton);

    });


    addedToBasket = true;
    idBookmark ++;

}

function resetFormValues(){

    deliveryName.value = "";
    deliveryAddress1.value = "";
    deliveryAddress2.value = "";
    deliveryAddress3.value = "";
    deliveryPostcode.value = "";
    deliveryPhoneNumber.value = "";
    paymentOption.value = "";
    message.value = "";
    animalType.value = "";
    quantity.value = "";
    boxes.value = "";
    code.value = ""

    orderPriceValue = "N/A";
    updatePrice(false);

}

function deleteOrder(element){

    element.parentElement.parentElement.removeChild(element.parentElement);
    updateBasket();

}

function updateBasket(){

    try{
        if(table.children.length == 1){
            basket.classList= "hideInfo";
        }else{
            basket.classList = "";
        }
    }catch(e){
        basket.classList = "";
    }

}

function getAllElements(element, array){

    array.push(element);

    if(element.children.length > 0){
       
        //loop through children
        for(let i = 0; i < element.children.length; i++){
           
            getAllElements(element.children[i], array);       
        
        } 
       
    }else{
        return element;
        
    }
    return array;
}

function getAllPTagsOfParent(element){

    let all_child_elements = getAllElements(element, []);
    let filter_child_elements = [];
    for(let i = 0; i < all_child_elements.length; i++){
        if(all_child_elements[i].tagName == "P"){
            filter_child_elements.push(all_child_elements[i]);
        }
    }


    return filter_child_elements;
}


function submitOrders(){

    //loading symbol
    submitOrdersButton.classList = 'hidesubmitbutton';
    loadingSymbol.classList = 'loader';

    //get all orders
    const form = document.querySelector('form');
    var orders = document.querySelectorAll('.tablerow');
    
    //create input elements and then  add to DOM
    for(let i = 1; i < orders.length; i++){
        const orderWrapper = document.createElement('div');

        const collection_data = getAllPTagsOfParent(orders[i].children[0].children[1]);

        for(let j = 0; j < collection_data.length - 1; j++){ //collection info -1 on length to stop payment option being submitted mulitple times.
        
            const input = document.createElement('input');
            input.name="collection" + "[" + i + "][]";
            input.type = "hidden";
            input.value = collection_data[j].textContent;
            orderWrapper.appendChild(input);
        
        }

        const delivery_data = getAllPTagsOfParent(orders[i].children[0].children[2]);

        for(let j = 2; j < delivery_data.length - 2; j++){ //delivery info //j = 2 to stop animal type and quantity being submitted multiple times. -2 on length to stop payment and button being being submitted
            const input = document.createElement('input');
            input.name="delivery" + "[" + i + "][]";
            input.type = "hidden";
            input.value = delivery_data[j].textContent;
            orderWrapper.appendChild(input);
        }


        const extra_data = getAllPTagsOfParent(orders[i].children[1]);

        for(let j = 0; j < extra_data.length; j++){
            const input = document.createElement('input');
            input.name ="extra" + "[" + i + "][]";
            input.type = "hidden";
            input.value = extra_data[j].textContent;
            orderWrapper.appendChild(input);
        }

        form.appendChild(orderWrapper);
    }

    //add profile email
    form.appendChild(profileEmail);

    console.log(form);

    //submit form
    form.submit();
}