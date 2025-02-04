const deliveryAddressAutocomplete = document.getElementById('deliveryAddressAutocomplete');
const collectionAddressAutocomplete = document.getElementById('collectionAddressAutocomplete');


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
    inputDelivery.addEventListener("input", async (input) => makeAcRequest(input, deliveryAddress1, deliveryAddress2, deliveryAddress3, deliveryPostcode, requestDelivery, resultsDelivery, titleDelivery, inputDelivery));
    
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