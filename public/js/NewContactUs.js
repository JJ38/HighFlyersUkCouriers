
const submitOrdersButton = document.getElementById('submitButton');
const submitOrderWrapper = document.getElementById('submitbuttonwrapper');
const loadingSymbol = document.getElementById('loadingsymbol');

const form = document.getElementById('contactUsForm');

const email = document.getElementById('email');
const customerName = document.getElementById('name');
const phone = document.getElementById('phone');
const message = document.getElementById('message');

const requiredFields = [email, customerName, phone, message];

function submitorders(){
    
    //if form fields are filled

    let requiredFieldsMet = true;

    for(let i = 0; i < requiredFields.length; i++){
        console.log(requiredFields[i]);
        if(requiredFields[i].value == ""){
            requiredFieldsMet = false;
        }
    }

    if(requiredFieldsMet){

        let validateResult = validateForm();

        

        //Validate fields 
        if(validateResult == null){
            submitOrderWrapper.onclick = "";
            submitOrdersButton.classList = 'hidden';
            loadingSymbol.classList = 'loader';
            form.submit();
        }else{
            alert(validateResult);
        }
    
        
    }

}

function validateForm(){ 

    var isNumber = /^\d+$/;
    var isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    //validate phone numbers
    
    if(!phone.value.match(isNumber) || phone.value.length != 11){
        return "Telephone is not a valid phone number";
    }

    //validate email

    if(!email.value.match(isEmail)){
        return "Email is not valid";
    }

    if(!message.value.length > 0){
        return "Please enter a message";
    }

    return null;

}