// const transportinfowrapper = document.querySelector('.transportinfowrapper');
// const addressDataRow = transportinfowrapper.querySelectorAll('.columns');
const quickCollectionAddress = document.querySelector('.quickcollectionaddresswrapper');
const collectionAddressInfo = document.getElementById('collectioninfo');
var transporticons;
// var exandButtons = document.querySelectorAll('.expand');
const headers = document.querySelector('.headerrow');
const basket = document.getElementById('basket');

//inputform elements
const animalType = document.getElementById('animal');
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
const collectionAddress1 = document.getElementById('collectionaddress1');
const collectionAddress2 = document.getElementById('collectionaddress2');
const collectionAddress3 = document.getElementById('collectionaddress3');
const collectionPostcode= document.getElementById('collectionpostcode');
const collectionTelephone = document.getElementById('collectiontelephone');
const email = document.getElementById('email');


const deliveryName = document.getElementById('deliveryname');
const deliveryAddress1 = document.getElementById('deliveryaddress1');
const deliveryAddress2 = document.getElementById('deliveryaddress2');
const deliveryAddress3 = document.getElementById('deliveryaddress3');
const deliveryPostcode= document.getElementById('deliverypostcode');
const deliveryTelephone = document.getElementById('deliverytelephone');
const paymentOption = document.getElementById('payment');
const message = document.getElementById('message');

const requiredFields = [collectionName, collectionAddress1, collectionAddress2, 
    collectionAddress3, collectionPostcode, collectionTelephone, email, deliveryName, deliveryAddress1,
    deliveryAddress2, deliveryAddress3, deliveryPostcode, deliveryTelephone, paymentOption, quantity, 
    animalType];

const table = document.getElementById('table');


setProfileData();


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
    // updateTransportIconsPositon(transporticons); //reworking for multiple expanded orders
}

quickCollectionAddress.addEventListener('click', (e) => {

    quickCollectionAddress.children[0].classList.toggle('rotate90anticlockwise');
    collectionAddressInfo.classList.toggle('hidden');

});


function updateTransportIconsPositon(transporticons, transportinfowrapper){
    transporticons.style.height = transportinfowrapper.offsetHeight -20 + 'px';
    transporticons.style.top = '26px';
    transporticons.style.right = headers.children[headers.children.length-1].offsetWidth + headers.children[headers.children.length-2].offsetWidth + 20 - 30 + 50 + 'px';
}

function toggleExpand(element){
    
    const transportinfowrapper = element.parentElement.parentElement;
    const tablerow = transportinfowrapper.parentElement;

    transportinfowrapper.children[0].classList.toggle('hidden'); //transport icons 
    transportinfowrapper.children[1].classList.toggle('hidden'); //collection info
    transportinfowrapper.children[2].classList.toggle('deliveryinfomargin');
    transportinfowrapper.children[2].children[5].classList.toggle('hidden'); //payment info

    tablerow.children[1].classList.toggle('hidden'); //extra info
    tablerow.children[2].classList.toggle('hidden'); //delete button
    
    element.parentElement.children[0].classList.toggle('hidefont'); //animal name
    element.parentElement.children[1].classList.toggle('hidefont'); //animal name
    element.parentElement.children[5].classList.toggle('hidefont'); //payment type
    element.classList.toggle('hide')// button animation

    transporticons = transportinfowrapper.children[0];
    updateTransportIconsPositon(transporticons, transportinfowrapper);

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
    quickAddressEmail.innerHTML = collectionEmail.value;

}


function addToBasket(){
    
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


    //if required fields enetered add dom elements

    if(requiredFieldsMet){

        const tableRow = document.createElement('div');
        tableRow.classList = "tablerow";

        const orderHTML =   
                            '<div class="transportinfowrapper">'+
                                '<div class="hidden collectiondeliveryicons transporticons">'+
                                    '<i class="fa-solid fa-box-open" title="collection"></i>'+
                                    '<i class="fa-solid fa-ellipsis-vertical"></i>'+
                                    '<i class="fa-solid fa-truck" title="delivery"></i>'+
                                '</div>'+
                                '<div class="columns hidden collectioninfomargin">'+
                                    '<p>' + animalType.value + '</p>'+
                                    '<p>' + quantity.value + '</p>'+
                                    '<p>' + collectionName.value + '</p>'+
                                    '<p>' + collectionAddress1.value + ', ' + collectionAddress2.value + ', ' + collectionAddress3.value + ', ' + collectionPostcode.value + '</p>'+
                                    '<p>' + collectionTelephone.value + '</p>'+
                                    '<p></p>'+
                                '</div>'+
                                '<div class="columns deliveryinfomargin">'+
                                    '<p class="">' + animalType.value + '</p>'+
                                    '<p>' + quantity.value + '</p>'+
                                    '<p>' + deliveryName.value + '</p>'+
                                    '<p>' + deliveryAddress1.value + ', ' + deliveryAddress2.value + ', ' + deliveryAddress3.value + ', ' + deliveryPostcode.value + '</p>'+
                                    '<p>' + deliveryTelephone.value + '</p>'+
                                    '<p class="">' + paymentOption.value + '</p>'+
                                    '<div class="expand" onclick="toggleExpand(this)"><p>V</p></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="extrainfo hidden">'+
                                '<div>'+
                                    '<i class="fa-solid fa-at" title="email"></i>'+
                                    '<p>'+
                                        'jamesbrass@ymail.com' +
                                    '</p>'+
                                '</div>'+
                                '<div class="paymentinfo">'+
                                    '<i class="fa-solid fa-credit-card" title="payment on delivery or collection"></i>'+
                                    '<p>'+
                                    paymentOption.value +
                                    '</p>'+
                                '</div>'+
                                '<div>'+
                                    '<i class="fa-solid fa-message" title="message"></i>'+
                                    '<p>'+
                                    message.value +
                                    '</p>'+
                                '</div>'+
                            '</div>'+
                            '<div class="deletewrapper hidden" onclick="deleteOrder(this)">'+
                                '<i class="fa-solid fa-trash-can"></i>'+
                            '</div>';
                        
        tableRow.innerHTML = orderHTML;

        table.appendChild(tableRow);

        //save to client storage

        //reset deliverinfo form values

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




        updateBasket();
    }

}

function updateBasket(){

    if(basket.children[1].children[1].children.length == 1){
        basket.classList= "hidden";
    }else{
        basket.classList = "";
    }

}

function deleteOrder(element){

    element.parentElement.parentElement.removeChild(element.parentElement);

    updateBasket();

}

function submitOrders(){

    //get all orders

    // var orders = Array.from(document.querySelectorAll('.tablerow'));
    const form = document.querySelector('form');
    var orders = document.querySelectorAll('.tablerow');

    //create input elements and then  add to DOM

    console.log(orders);

    for(let i = 1; i < orders.length; i++){
        const orderWrapper = document.createElement('div');

        console.log(orders[i].children[0].children[1]);

        for(let j = 0; j < orders[i].children[0].children[1].children.length; j++){ //collection info
            const input = document.createElement('input');
            input.name="collection" + "[" + i + "][]";// + i + "_" + j;
            input.type = "hidden";
            input.value = orders[i].children[0].children[1].children[j].textContent;
            orderWrapper.appendChild(input);
        }

        console.log(orders[i].children[0].children[2].children);

        for(let j = 0; j < orders[i].children[0].children[2].children.length - 1; j++){ //delivery info
            const input = document.createElement('input');
            input.name="delivery" + "[" + i + "][]";// + i + "_" + j;
            input.type = "hidden";
            input.value = orders[i].children[0].children[2].children[j].textContent;
            orderWrapper.appendChild(input);
        }

        for(let j = 0; j < orders[i].children[1].children.length; j++){
            const input = document.createElement('input');
            input.name ="extra" + "[" + i + "][]"; //+ i + "_" + j;
            input.type = "hidden";
            input.value = orders[i].children[1].children[j].children[1].textContent;
            orderWrapper.appendChild(input);
        }

        console.log(orderWrapper);
        form.appendChild(orderWrapper);
    }

    console.log(form);
    //submit form

    form.submit();
}