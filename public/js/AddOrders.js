const email = document.getElementById('email');
const submitButton = document.getElementById('submitButton');
const addOrderForm = document.getElementById('addOrderForm');
const loadingSymbol = document.getElementById('loadingsymbol');

addEventListeners()

    
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

    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(!email.value.match(isEmail)){
        
        return "Email is not valid";
    }

    return null;

}