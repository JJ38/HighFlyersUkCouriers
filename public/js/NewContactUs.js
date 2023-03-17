
const submitOrdersButton = document.getElementById('submitButton');
const loadingSymbol = document.getElementById('loadingsymbol');

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
        
        submitOrdersButton.classList = 'hidden';
        loadingSymbol.classList = 'loader';
        
    }

}