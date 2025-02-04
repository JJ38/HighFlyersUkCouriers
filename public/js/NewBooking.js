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

const deliveryAddressAutocomplete = document.getElementById('deliveryAddressAutocomplete');
const collectionAddressAutocomplete = document.getElementById('collectionAddressAutocomplete');



const requiredFields = [collectionName, collectionAddress1, collectionPostcode, collectionTelephone, email, deliveryName, deliveryAddress1, 
    deliveryPostcode, deliveryTelephone, paymentOption, quantity, animalType];


let titleCollection;
let resultsCollection;
let inputCollection;
let tokenCollection;

let titleDelivery;
let resultsDelivery;
let inputDelivery;
let tokenDelivery;
// Add an initial request body.
let requestDelivery = {
   
    language: "en-UK",
   
};

let requestCollection = {
    
    language: "en-UK",
    
};

async function initAC() {
    tokenCollection = new google.maps.places.AutocompleteSessionToken();
    titleCollection = document.getElementById("autocompleteTitleCollection");
    resultsCollection = document.getElementById("autocompleteResultsCollection");
    inputCollection = document.getElementById("collectionAddressAutocompleteInput");
    inputCollection.addEventListener("input", (input) => makeAcRequest(input, collectionAddress1, collectionAddress2, collectionAddress3, collectionPostcode, requestCollection, resultsCollection, titleCollection, inputCollection));
    requestCollection = refreshToken(requestCollection);

    tokenDelivery = new google.maps.places.AutocompleteSessionToken();
    titleDelivery = document.getElementById("autocompleteTitleDelivery");
    resultsDelivery = document.getElementById("autocompleteResultsDelivery");
    inputDelivery = document.getElementById("deliveryAddressAutocompleteInput");
    inputDelivery.addEventListener("input", (input) => makeAcRequest(input, deliveryAddress1, deliveryAddress2, deliveryAddress3, deliveryPostcode, requestDelivery, resultsDelivery, titleDelivery, inputDelivery));
    requestDelivery = refreshToken(requestDelivery);

}

async function makeAcRequest(input, streetAddressInput, cityInput, countyInput, postcodeInput, request, results, title, inputField) {
    // Reset elements and exit if an empty string is received.
    if (input.target.value == "") {
        title.innerText = "";
        results.replaceChildren();
        return;
    }

    // Add the latest char sequence to the request.
    request.input = input.target.value;
    request.includedPrimaryTypes = ["street_address", "premise", "establishment"];
    request.includedRegionCodes = ["uk", "ie"];

    console.log(request);
    console.log(request.input);

    // Fetch autocomplete suggestions and show them in a list.
    // @ts-ignore
    const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    title.innerText = 'Query predictions for "' + request.input + '"';
    // Clear the list first.
    results.replaceChildren();

    for (const suggestion of suggestions) {
        const placePrediction = suggestion.placePrediction;
        // Create a link for the place, add an event handler to fetch the place.
        const a = document.createElement("p");

        a.addEventListener("click", () => {
            onPlaceSelected(placePrediction.toPlace(), streetAddressInput, cityInput, countyInput, postcodeInput, results, title, inputField);
        });
        a.innerText = placePrediction.text.toString();

        // Create a new list element.
        const li = document.createElement("li");

        li.appendChild(a);
        results.appendChild(li);
    }
}

// Event handler for clicking on a suggested place.
async function onPlaceSelected(place, streetAddressInput, cityInput, countyInput, postcodeInput, results, title, inputField) {
    await place.fetchFields({fields: ["addressComponents"]});


    //loop through address components and find the address type. Based on address type use switch statement to assign address components needed.

    let streetAddress = "";
    let city;
    let county;
    let postcode;

    console.log(place.addressComponents);


    for (let i = 0; i < place.addressComponents.length; i++){

        const addressComponent = place.addressComponents[i];

        for(let j = 0; j < place.addressComponents[i].types.length; j++){
            
            const addressComponentType = place.addressComponents[i].types[j]

            switch(addressComponentType){

                case "street_number":
                    streetAddress = addressComponent.longText + " " + streetAddress;
                    break; 
                
                case "route":
                    streetAddress = streetAddress + addressComponent.longText;
                    break; 

                case "premise":
                    streetAddress = streetAddress + addressComponent.longText;
                    break;

                case "postal_town":
                    city = addressComponent.longText;
                    break; 

                case "administrative_area_level_2":
                    county = addressComponent.longText;
                    break; 

                case "postal_code":
                    postcode = addressComponent.longText;
                    break; 

                default:
                    break;
            }

        }
    }

    streetAddressInput.value = streetAddress;
    cityInput.value = city;
    countyInput.value = county;
    postcodeInput.value = postcode;

    //clear suggested addresses
    title.innerHTML = "";
    results.innerHTML = "";

    //clear input field
    inputField.value = "";

    refreshToken(requestDelivery);
}

// Helper function to refresh the session token.
async function refreshToken(request) {
    // Create a new session token and add it to the request.
    token = new google.maps.places.AutocompleteSessionToken();
    request.sessionToken = token;
    return request;
}

window.init = initAC;


function submitorders(){
    
    //if form fields are filled

    let requiredFieldsMet = true;

    for(let i = 0; i < requiredFields.length; i++){
        
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