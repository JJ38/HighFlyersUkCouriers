const transportinfowrapper = document.querySelector('.transportinfowrapper');
const addressDataRow = transportinfowrapper.querySelectorAll('.columns');
const quickCollectionAddress = document.querySelector('.quickcollectionaddresswrapper');
const collectionAddressInfo = document.getElementById('collectioninfo');
var transporticons;
// var exandButtons = document.querySelectorAll('.expand');
const headers = document.querySelector('.headerrow');

//inputform elements
const collectionName = document.getElementById('deliveryname');
const collectionAddress1 = document.getElementById('deliveryaddress1');
const collectionAddress2 = document.getElementById('deliveryaddress2');
const collectionAddress3 = document.getElementById('deliveryaddress3');
const collectionPostcode= document.getElementById('deliverypostcode');
const collectionTelephone = document.getElementById('deliverytelephone');

const deliveryName = document.getElementById('deliveryname');
const deliveryAddress1 = document.getElementById('deliveryaddress1');
const deliveryAddress2 = document.getElementById('deliveryaddress2');
const deliveryAddress3 = document.getElementById('deliveryaddress3');
const deliveryPostcode= document.getElementById('deliverypostcode');
const deliveryTelephone = document.getElementById('deliverytelephone');
const paymentOption = document.getElementById('payment');
const message = document.getElementById('message');



// updateTransportIconsPositon();

onresize = (event) => {
    updateTransportIconsPositon(transporticons); //reworking for multiple expanded orders
}

quickCollectionAddress.addEventListener('click', (e) => {

    console.log('quickCollectionAddress');
    quickCollectionAddress.children[0].classList.toggle('rotate90anticlockwise');
    collectionAddressInfo.classList.toggle('hidden');

});


function updateTransportIconsPositon(transporticons){
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
    element.parentElement.children[5].classList.toggle('hidefont'); //payment type
    element.classList.toggle('hide')// button animation

    transporticons = transportinfowrapper.children[0];
    updateTransportIconsPositon(transporticons);

}


function addToBasket(){

    //get all inputs

    //create dom elements

    //add dom elements

    //save to client storage

}