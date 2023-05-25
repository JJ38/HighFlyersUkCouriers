const submitOrdersButton = document.getElementById('submitButton');
const loadingSymbol = document.getElementById('loadingsymbol');

const collectionName = document.getElementById('collectionName');
const collectionAddress1 = document.getElementById('collectionAddress1');
const collectionAddress2 = document.getElementById('collectionAddress2');
const collectionAddress3 = document.getElementById('collectionAddress3');
const collectionPostcode= document.getElementById('collectionPostcode');
const collectionTelephone = document.getElementById('collectionTelephone');
const email = document.getElementById('email');


const deliveryName = document.getElementById('deliveryName');
const deliveryAddress1 = document.getElementById('deliveryAddress1');
const deliveryAddress2 = document.getElementById('deliveryAddress2');
const deliveryAddress3 = document.getElementById('deliveryAddress3');
const deliveryPostcode= document.getElementById('deliveryPostcode');
const deliveryTelephone = document.getElementById('deliveryTelephone');
const paymentOption = document.getElementById('payment');

const animalType = document.getElementById('animalType');
const quantity = document.getElementById('quantity');


const requiredFields = [collectionName, collectionAddress1, collectionPostcode, collectionTelephone, email, deliveryName, deliveryAddress1, 
    deliveryPostcode, deliveryTelephone, paymentOption, quantity, animalType];

    


function submitorders(){
    
    //if form fields are filled

    let requiredFieldsMet = true;

    for(let i = 0; i < requiredFields.length; i++){
        console.log(requiredFields[i]);
        if(requiredFields[i].value == ""){
            requiredFieldsMet = false;
        }
    }

    if(collectionTelephone.value.length < 11 && collectionTelephone.value.length > 12){

        requiredFieldsMet = false;

    }else if(deliveryTelephone.value.length < 11 && deliveryTelephone.value.length > 12){

        requiredFieldsMet = false;

    }

    if(requiredFieldsMet){
        
        submitOrdersButton.classList = 'hidden';
        loadingSymbol.classList = 'loader';
        
    }

}