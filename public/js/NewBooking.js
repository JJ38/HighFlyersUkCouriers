const submitOrdersButton = document.getElementById('submitButton');


const loadingSymbol = document.getElementById('loadingsymbol');
const form = document.getElementById('bookingForm');

const collectionName = document.getElementById('collectionName');
const collectionAddress1 = document.getElementById('collectionAddress1');
const collectionAddress2 = document.getElementById('collectionAddress2');
const collectionAddress3 = document.getElementById('collectionAddress3');
const collectionPostcode= document.getElementById('collectionPostcode');
const collectionTelephone = document.getElementById('collectionTelephone');
const email = document.getElementById('email');
const confirmEmail = document.getElementById('confirmEmail');


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
        requiredFields[i].style.border = "1px solid black";

        

        if(requiredFields[i].value == ""){
            requiredFields[i].style.border = "1px solid red";
            requiredFieldsMet = false;
        }
    }


    if(requiredFieldsMet){

        let validateResult = validateForm();

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


function validateForm(){ 

    //var isNumber = /^\d+$/;
    const isNumber = new RegExp('^[0-9]*$');
    var isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

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


    return null;

}