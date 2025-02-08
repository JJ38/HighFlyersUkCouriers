// const transportinfowrapper = document.querySelector('.transportinfowrapper');
// const addressDataRow = transportinfowrapper.querySelectorAll('.columns');
const quickCollectionAddress = document.querySelector('.quickcollectionaddresswrapper');
const collectionAddressInfo = document.getElementById('collectioninfoFormWrapper');
var transporticons;
// var exandButtons = document.querySelectorAll('.expand');
const headers = document.querySelector('.headerrow');
const basket = document.getElementById('basket');

//inputform elements
const animalType = document.getElementById('animal');
const code = document.getElementById('code');
const quantity = document.getElementById('quantity');
const quickAddress = document.getElementById('quickaddress');

const quickAddressName = document.getElementById('quickAddressName');
const quickAddress1 = document.getElementById('quickAddress1');
const quickAddress2 = document.getElementById('quickAddress2');
const quickAddress3 = document.getElementById('quickAddress3');
const quickAddressPostcode = document.getElementById('quickAddressPostcode');
const quickAddressEmail = document.getElementById('quickAddressEmail');
const quickAddressTelephone = document.getElementById('quickAddressTelephone');

const collectionName = document.getElementById('collectionname');
const collectionTelephone = document.getElementById('collectiontelephone');
const email = document.getElementById('email');
const profileEmail = document.getElementById('profileemail');


const deliveryName = document.getElementById('deliveryname');
const deliveryTelephone = document.getElementById('deliverytelephone');
const paymentOption = document.getElementById('payment');
const message = document.getElementById('message');

const requiredFields = [collectionName, collectionAddress1, collectionPostcode, collectionTelephone, email, deliveryName, deliveryAddress1, 
    deliveryPostcode, deliveryTelephone, paymentOption, quantity, 
    animalType];

const table = document.getElementById('table');
const loadingSymbol = document.getElementById('loadingsymbol');
const submitOrdersButton = document.getElementById('submitorders');

let animalTypeValue;
let quantityValue;
let codeValue = "N/A";
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
let addedToBasket = false;
let idBookmark = 0;

setProfileData();
loadBasket();


function setProfileData(){

    collectionName.value = quickAddress.children[1].innerHTML;
    collectionAddress1.value = quickAddress.children[2].children[0].innerHTML;
    collectionAddress2.value = quickAddress.children[2].children[2].innerHTML;
    collectionAddress3.value = quickAddress.children[2].children[4].innerHTML;
    collectionPostcode.value = quickAddress.children[2].children[6].innerHTML;
    email.value = quickAddress.children[3].innerHTML;
    collectionTelephone.value = quickAddress.children[4].innerHTML;
   
}




// updateTransportIconsPositon();

onresize = (event) => {
    // document.querySelectorAll('')
    //updateTransportIconsPositions(transporticons); //reworking for multiple expanded orders
}

quickCollectionAddress.addEventListener('click', (e) => {

    quickCollectionAddress.children[0].classList.toggle('rotate90anticlockwise');
    collectionAddressInfo.classList.toggle('hideInfo');

});


function updateTransportIconsPositions(transporticons, collectioninfo, deliveryinfo){
    var deliveryinfoStyle = window.getComputedStyle(deliveryinfo);
    transporticons.style.height = collectioninfo.offsetHeight + parseInt(deliveryinfoStyle.marginTop) + 20 + 'px';
    transporticons.style.top = '30px';
    transporticons.style.right = headers.children[headers.children.length-1].offsetWidth + headers.children[headers.children.length-2].offsetWidth + 20 - 30 + 50 + 'px';
}

function toggleExpand(element){
    
    const transportinfowrapper = element.parentElement.parentElement;
    const tablerow = transportinfowrapper.parentElement;

    transportinfowrapper.children[0].classList.toggle('hideInfo'); //transport icons 
    transportinfowrapper.children[1].classList.toggle('hideInfo'); //collection info
    transportinfowrapper.children[2].classList.toggle('deliveryinfomargin');
    transportinfowrapper.children[2].children[5].classList.toggle('hideInfo'); //payment info

    tablerow.children[1].classList.toggle('hideInfo'); //extra info
    tablerow.children[2].classList.toggle('hideInfo'); //delete button
    
    element.parentElement.children[0].classList.toggle('hidefont'); //animal name
    element.parentElement.children[1].classList.toggle('hidefont'); //animal name
    element.parentElement.children[5].classList.toggle('hidefont'); //payment type
    element.classList.toggle('hide')// button animation

    transporticons = transportinfowrapper.children[0];
    collectioninfo = transportinfowrapper.children[1];
    deliveryinfo = transportinfowrapper.children[2];
    updateTransportIconsPositions(transporticons, collectioninfo, deliveryinfo);

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


function validateOrder(){ 

    var isNumber = /^\d+$/;
    var isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    //validate phone numbers
    
    if((!deliveryTelephone.value.match(isNumber)) || !(deliveryTelephone.value.length > 10 && deliveryTelephone.value.length < 12)){
        return "Delivery Telephone is not a valid phone number";
    }

    if((!collectionTelephone.value.match(isNumber)) || !(collectionTelephone.value.length > 10 && collectionTelephone.value.length < 12)){
        return "Collection Telephone is not a valid phone number";
    }

    //validate quantity

    if(!quantity.value.match(isNumber)){
        return "Quantity is not a valid number";
    }

    //validate email

    if(!email.value.match(isEmail)){
        return "Email is not valid";
    }

    //validate payment method

    if(paymentOption.value != "Pickup" && paymentOption.value != "Delivery" && paymentOption.value != "Account"){
        return "Payment method is not valid";
    }


    return null;

}

function loadBasket(){
   
    try{
        console.log(localStorage.getItem('basket'));
        // console.log(localStorage.getItem('basket'));
        if(localStorage.getItem('basket') != null){
            idBookmark = basketJSON['id_bookmark'];
            if(basketJSON['basket'].length > 0){ 
                
                
                for(let i = 0; i < basketJSON['basket'].length; i++){
                
                    animalTypeValue = basketJSON['basket'][i]['animal_type'];
                    quantityValue = basketJSON['basket'][i]['quantity'];
                    codeValue = basketJSON['basket'][i]['code'];
                    collectionNameValue = basketJSON['basket'][i]['collection_name'];
                    collectionPostcodeValue = basketJSON['basket'][i]['collection_postcode'];
                    collectionAddress1Value = basketJSON['basket'][i]['collection_address1'];
                    collectionAddress2Value = basketJSON['basket'][i]['collection_address2'];
                    collectionAddress3Value = basketJSON['basket'][i]['collection_address3'];
                    collectionTelephoneValue = basketJSON['basket'][i]['collection_telephone'];
                    deliveryNameValue = basketJSON['basket'][i]['delivery_name'];
                    deliveryPostcodeValue = basketJSON['basket'][i]['delivery_postcode'];
                    deliveryAddress1Value = basketJSON['basket'][i]['delivery_address1'];
                    deliveryAddress2Value = basketJSON['basket'][i]['delivery_address2'];
                    deliveryAddress3Value = basketJSON['basket'][i]['delivery_address3'];
                    deliveryTelephoneValue = basketJSON['basket'][i]['delivery_telephone'];
                    emailValue = basketJSON['basket'][i]['email'];
                    paymentOptionValue = basketJSON['basket'][i]['payment_option'];
                    messageValue = basketJSON['basket'][i]['message'];
                    addOrderHTML(basketJSON['basket'][i]['id']);
                }

                updateBasket();
            
            } 
        }else{
            
            basketBoilerPlateJSON = '{"id_bookmark": 0,"basket": []}';
            localStorage.setItem("basket", basketBoilerPlateJSON);
            
        }
    }catch(e){

        console.log("local storage not loaded");

        basketBoilerPlateJSON = '{"id_bookmark": 0,"basket": []}';
        try{
            localStorage.setItem("basket", basketBoilerPlateJSON);
        }catch(e){
            console.log(e);
        }
        
    }

    console.log(localStorage.getItem("basket"));

    // console.log()

}

function addToBasket(){

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
    const validateResult = validateOrder();
    if(validateResult != null){
        alert(validateResult);
        return;
    }


    //store in local storage

    //create JSON of order

    //get current basket

    //add order to JSON

    // if required fields entered add dom elements

    

    //set order data

    
    animalTypeValue = animalType.value;
    quantityValue = quantity.value;
    codeValue = code.value;
    collectionNameValue = collectionName.value;
    collectionPostcodeValue = collectionPostcode.value;
    collectionAddress1Value = collectionAddress1.value;
    collectionAddress2Value = collectionAddress2.value;
    collectionAddress3Value = collectionAddress3.value;
    collectionTelephoneValue = collectionTelephone.value;
    deliveryNameValue = deliveryName.value;
    deliveryPostcodeValue = deliveryPostcode.value;
    deliveryAddress1Value = deliveryAddress1.value;
    deliveryAddress2Value = deliveryAddress2.value;
    deliveryAddress3Value = deliveryAddress3.value;
    deliveryTelephoneValue = deliveryTelephone.value;
    emailValue = email.value;
    paymentOptionValue = paymentOption.value;
    messageValue = message.value;
    
    //update local storage

    addOrderHTML(idBookmark);
    
    try{
    
        basketJSON = JSON.parse(localStorage.getItem("basket"));
        basketJSON['basket'].push(orderToJSON());

        localStorage.setItem("basket", JSON.stringify(basketJSON));

        console.log(basketJSON = JSON.parse(localStorage.getItem("basket")));


        idBookmark ++;

        //update localstorage id_bookmark
        basketJSON = JSON.parse(localStorage.getItem("basket"));
        console.log(basketJSON['id_bookmark']);
        basketJSON['id_bookmark'] = idBookmark;

        localStorage.setItem("basket", JSON.stringify(basketJSON));

        console.log(JSON.parse(localStorage.getItem("basket")));
        
    }catch(e){
        console.log(e);
        updateBasket();

    }

    resetFormValues();


    updateBasket();
    

}

function addOrderHTML(id){

    console.log("orderhtml");

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
                                '<i class="fa-solid fa-message" title="message"></i>'+
                                '<p>'+
                                    messageValue +
                                '</p>'+
                            '</div>'+
                        '</div>'+
                        '<div class="deletewrapper hideInfo" onclick="deleteOrder(this)">'+
                            '<i class="fa-solid fa-trash-can"></i>'+
                        '</div>' +
                        '<input type=hidden name=id value=' + id + '>';
                        
    tableRow.innerHTML = orderHTML;
    table.appendChild(tableRow);

    addedToBasket = true;

}

function resetFormValues(){

    deliveryName.value = "";
    deliveryAddress1.value = "";
    deliveryAddress2.value = "";
    deliveryAddress3.value = "";
    deliveryPostcode.value = "";
    deliveryTelephone.value = "";
    paymentOption.value = "";
    message.value = "";

    animalType.value = "";
    quantity.value = "";
    code.value = ""
}

function orderToJSON(){

    const orderJson = 
    "{" +
        '"id": ' + '"' + idBookmark + '"' + "," +
        '"animal_type": ' + '"' + animalType.value + '"' + "," +
        '"quantity": ' + '"' + quantity.value + '"' + "," +
        '"code": ' + '"' + code.value + '"' + "," +
        '"collection_name": ' + '"' + collectionName.value + '"' + "," +
        '"collection_postcode": ' + '"' + collectionPostcode.value + '"' + "," +
        '"collection_address1": ' + '"' + collectionAddress1.value + '"' + "," +
        '"collection_address2": ' + '"' + collectionAddress2.value + '"' + "," +
        '"collection_address3": ' + '"' + collectionAddress3.value + '"' + "," +
        '"collection_telephone": ' + '"' + collectionTelephone.value + '"' + "," +
        '"delivery_name": ' + '"' + deliveryName.value + '"' + "," +
        '"delivery_postcode": ' + '"' + deliveryPostcode.value + '"' + "," +
        '"delivery_address1": ' + '"' + deliveryAddress1.value + '"' + "," +
        '"delivery_address2": ' + '"' + deliveryAddress2.value + '"' + "," +
        '"delivery_address3": ' + '"' + deliveryAddress3.value + '"' + "," +
        '"delivery_telephone": ' + '"' + deliveryTelephone.value + '"' + "," +
        '"email": ' + '"' + email.value + '"' + "," +
        '"payment_option": ' + '"' + paymentOption.value + '"' + "," +
        '"message": ' + '"' + message.value + '"' +
    "}";

    

    return JSON.parse(orderJson);
}

function updateBasket(){

    console.log(addedToBasket);
   
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

function deleteOrder(element){

    console.log(element.parentElement);
    element.parentElement.parentElement.removeChild(element.parentElement);

    idToDelete = element.parentElement.children[3].value;

    console.log(element.parentElement.children[3].value);
    //delete order from localstorage

    basketJSON = JSON.parse(localStorage.getItem("basket"));
    orders = basketJSON["basket"];

    for(let i = 0; i < orders.length; i++){
        console.log(orders[i]['id']);
        if(orders[i]['id'] == idToDelete.toString()){
            console.log("found order to delete");
            orders.splice(i, 1);
        }
    }

    basketJSON['basket'] = orders;

    console.log(basketJSON);

    localStorage.setItem("basket", JSON.stringify(basketJSON));
    console.log(JSON.parse(localStorage.getItem('basket')));


    updateBasket();

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

        console.log(orderWrapper);

        
        form.appendChild(orderWrapper);
    }
    console.log(profileEmail);
    //add profile email
    form.appendChild(profileEmail);

    //submit form


    //clear localstorage basket 
    localStorage.clear();

    form.submit();
}