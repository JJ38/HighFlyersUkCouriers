const deliveryAddressAutocomplete = document.getElementById('deliveryAddressAutocomplete');
const collectionAddressAutocomplete = document.getElementById('collectionAddressAutocomplete');

const collectionAddressAutocompleteInput = document.getElementById('collectionAddressAutocompleteInput');
const deliveryAddressAutocompleteInput = document.getElementById('deliveryAddressAutocompleteInput');


const collectionAddress1 = document.getElementById('collectionAddress1');
const collectionAddress2 = document.getElementById('collectionAddress2');
const collectionAddress3 = document.getElementById('collectionAddress3');
const collectionPostcode= document.getElementById('collectionPostcode');

const deliveryAddress1 = document.getElementById('deliveryAddress1');
const deliveryAddress2 = document.getElementById('deliveryAddress2');
const deliveryAddress3 = document.getElementById('deliveryAddress3');
const deliveryPostcode= document.getElementById('deliveryPostcode');

//jolly brook
//its a bird thing
//tumley lofts

let activeCollectionAutoCompleteSession = false;
let activeDeliveryAutoCompleteSession = false;

let titleCollection;
let resultsCollection;
let inputCollection;
let tokenCollection;

let titleDelivery;
let resultsDelivery;
let inputDelivery;
let tokenDelivery;
let resultsWrapperCollection;
let resultsWrapperDelivery;


setUpListeners();


function setUpListeners(){

    if(collectionAddressAutocompleteInput != null){

        collectionAddressAutocompleteInput.addEventListener("focus", () => {
            console.log("in focus");
            //is session currently active
            if(activeCollectionAutoCompleteSession){
                return;
            }
            
            activeCollectionAutoCompleteSession = true;

            initCollectionAddressAutocomplete();

        })

    }


    if(deliveryAddressAutocompleteInput != null){

        deliveryAddressAutocompleteInput.addEventListener('focus', () => {

            if(activeDeliveryAutoCompleteSession){
                return;
            }

            activeDeliveryAutoCompleteSession = true;

            initDeliveryAddressAutocomplete();
        })

    }

}

function initCollectionAddressAutocomplete(){

    console.log("initCollectionAddressAutocomplete");

    titleCollection = document.getElementById("autocompleteTitleCollection");
    resultsCollection = document.getElementById("autocompleteResultsCollection");
    inputCollection = document.getElementById("collectionAddressAutocompleteInput");
    resultsWrapperCollection = document.getElementById("autocompleteResultsWrapperCollection");

    const request = getRequest();

    inputCollection.addEventListener("input", (input) => makeAcRequest(input, collectionAddress1, collectionAddress2, collectionAddress3, collectionPostcode, request, resultsCollection, titleCollection, inputCollection, resultsWrapperCollection, "COLLECTION"));


}

function initDeliveryAddressAutocomplete(){

    console.log("initDeliveryAddressAutocomplete");

    titleDelivery = document.getElementById("autocompleteTitleDelivery");
    resultsDelivery = document.getElementById("autocompleteResultsDelivery");
    inputDelivery = document.getElementById("deliveryAddressAutocompleteInput");
    resultsWrapperDelivery = document.getElementById("autocompleteResultsWrapperDelivery");

    const request = getRequest();

    inputDelivery.addEventListener("input", async (input) => makeAcRequest(input, deliveryAddress1, deliveryAddress2, deliveryAddress3, deliveryPostcode, request, resultsDelivery, titleDelivery, inputDelivery, resultsWrapperDelivery, "DELIVERY"));
    

}


async function makeAcRequest(input, streetAddressInput, cityInput, countyInput, postcodeInput, request, results, title, inputField, resultsWrapper, autoCompleteType) {
    // Reset elements and exit if an empty string is received.
    if (input.target.value == "") {
        title.innerText = "";
        results.replaceChildren();
        resultsWrapper.classList.add('hidden');
        return;
    }


    resultsWrapper.classList.remove('hidden');


    // Add the latest char sequence to the request.
    request.input = input.target.value;
    request.includedPrimaryTypes = ["street_address", "premise", "establishment"];
    request.includedRegionCodes = ["uk", "ie"];
    
    title.innerText = 'Query predictions for "' + request.input + '"';

    console.log(request);

    // Fetch autocomplete suggestions and show them in a list.
    // @ts-ignore
    const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    //check if input has change or not. If input has changed dont display results as this could lead to incorrect results being shown

    if(request.input != inputField.value){
        
        return;
    }

    
    // Clear the list first.
    results.replaceChildren();

    

    for (const suggestion of suggestions) {
        const placePrediction = suggestion.placePrediction;
        // Create a link for the place, add an event handler to fetch the place.
        const a = document.createElement("p");

        a.addEventListener("click", () => {
            onPlaceSelected(placePrediction.toPlace(), streetAddressInput, cityInput, countyInput, postcodeInput, results, title, inputField, autoCompleteType);
            resultsWrapper.classList.add('hidden');

        });
        a.innerText = placePrediction.text.toString();

        // Create a new list element.
        const li = document.createElement("li");

        li.appendChild(a);
        results.appendChild(li);
    }
}

// Event handler for clicking on a suggested place.
async function onPlaceSelected(place, streetAddressInput, cityInput, countyInput, postcodeInput, results, title, inputField, autoCompleteType) {

    await place.fetchFields({fields: ["addressComponents"]});

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

    if(autoCompleteType == "COLLECTION"){

        activeCollectionAutoCompleteSession = false;

    }else if(autoCompleteType == "DELIVERY"){

        activeDeliveryAutoCompleteSession = false;
    }


}

// Helper function to refresh the session token.
function getRequest() {

    console.log("getting new session token");

    // Create a new session token and add it to the request.
    const token = new google.maps.places.AutocompleteSessionToken();

    const request = {

        language: "en-UK",
        sessionToken: token,

    }
    
    return request;
}

function init(event){
    console.log(event);
}