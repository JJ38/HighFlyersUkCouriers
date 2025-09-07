import { db, getDocument } from '/js/firebase';
import { query, doc } from 'firebase/firestore';
import { showNotification } from '/js/Notification.js';


export async function fetchBirdSpecies(){

    const birdSpeciesDocument = await getDocument(query(doc(db, 'Settings', 'birdSpecies')));

    if(birdSpeciesDocument == false){
        console.log("waddawd");
        showNotification("Error!", "Error loading form. Please try again later");
        return;
    }

    const birdSpecies = birdSpeciesDocument.data();
    
    if(birdSpecies == null){
        showNotification("Error!", "Error fetching bird species");
        return;
    }

    return birdSpecies;

}

export async function fetchPricePostcodeDefinitions(){

    const priceDefinitionsDocument = await getDocument(query(doc(db, 'Settings', 'priceDefinitions')));

    if(priceDefinitionsDocument == false){
        showNotification("Error!", "Error initialising prices. You can still order but wont have a basket price");
        return;
    }

    const priceDefinitions = priceDefinitionsDocument.data();
    
    if(priceDefinitions == null){
        showNotification("Error!", "Error initialising prices. You can still order but wont have a basket price");
        return;
    }

    return priceDefinitions;

}

export function calculateOrderPrice(collectionPostcodeInput, deliveryPostcodeInput, quantityInput, boxesInput, animalTypeInput, birdSpecies, pricePostcodeDefinitions, birdSpeciesSet){
    
    const animalType = validateAnimalType(animalTypeInput, birdSpeciesSet);
    if(animalType == false){
        return false;
    }

    const quantity = validatePositiveInteger(quantityInput);
    if(quantity == false){
        return false;
    }

    const boxes = validatePositiveInteger(boxesInput);
    if(boxes == false){
        return false;
    }

    const collectionPostcode = validatePostcode(collectionPostcodeInput, pricePostcodeDefinitions);
    if(collectionPostcode == false){
        return false;
    }

    const deliveryPostcode = validatePostcode(deliveryPostcodeInput, pricePostcodeDefinitions);
    if(deliveryPostcode == false){
        return false;
    }

    const pricingForOrder = getPricingForOrder(collectionPostcode, deliveryPostcode, animalType, birdSpecies, pricePostcodeDefinitions);

    let tally = pricingForOrder.pricing.standardPrice;

    let excess = 0;
    
    if(pricingForOrder.surchargeType == "Bird"){
        excess = quantity - pricingForOrder.includedQuantity ;
    }

    if(pricingForOrder.surchargeType == "Box"){
        excess = boxes - pricingForOrder.includedQuantity ;
    }

    if(excess > 0){
        tally += (excess * pricingForOrder.pricing.additionalPrice);
    }

    return tally;

}

function validatePositiveInteger(quantity){

    const quantityInt = parseInt(quantity);
    if(quantityInt > 0){
        return quantityInt;
    }

    return false;
}

function validateAnimalType(animalType, validAnimalTypes){
    
    if(validAnimalTypes.has(animalType)){
        return animalType;
    }

    return false;

}

function validatePostcode(postcode, pricePostcodeDefinitions){

    const outwardPostcode = getOutwardPostcode(postcode);

    if(outwardPostcode == false){
        return false;
    }

    //check if valid postcode in system
    if(pricePostcodeDefinitions[outwardPostcode]){
        return outwardPostcode;
    }

    return false;
    
}

function getOutwardPostcode(postcode){

    const trimmedPostcode = postcode.toString().replaceAll(" ", "").toUpperCase();

    if(trimmedPostcode.length == 7){
        return trimmedPostcode.substring(0, 4);
    }

    if(trimmedPostcode.length == 6){
        return trimmedPostcode.substring(0, 3);
    }

    if(trimmedPostcode.length == 5){
        return trimmedPostcode.substring(0, 2);
    }

    if(trimmedPostcode.length <= 4 && trimmedPostcode.length >= 2){
        return trimmedPostcode;
    }

    return false;

}

function getPricingForOrder(collectionPostcode, deliveryPostcode, animalType, birdSpecies, pricePostcodeDefinitions){

    const pricingForAnimal = getPricingForAnimal(animalType, birdSpecies);

    const collectionAreaName = getAreaName(collectionPostcode, pricePostcodeDefinitions);
    const deliveryAreaName = getAreaName(deliveryPostcode, pricePostcodeDefinitions);

    const collectionPricing = getAreaPricing(collectionAreaName, pricingForAnimal);
    const deliveryPricing = getAreaPricing(deliveryAreaName, pricingForAnimal);

    if(collectionPricing.pricing.standardPrice > deliveryPricing.pricing.standardPrice){
        return collectionPricing;
    }

    return deliveryPricing;
}

function getPricingForAnimal(animalType, birdSpecies){

    for(let i = 0; i < birdSpecies.species.length; i++){
        if(birdSpecies.species[i].name == animalType){
            return birdSpecies.species[i].prices;
        }
    }

}

function getAreaName(postcode, pricePostcodeDefinitions){

    return pricePostcodeDefinitions[postcode];

}

function getAreaPricing(areaName, pricingForAnimal){
    
    for(let i = 0; i < pricingForAnimal.areaPrices.length; i++){

        if(pricingForAnimal.areaPrices[i].area == areaName){

            return {pricing: pricingForAnimal.areaPrices[i], includedQuantity: pricingForAnimal.includedQuantity, surchargeType: pricingForAnimal.surchargeType};

        }

    }

}

export function createAnimalTypeSelectOptions(birdSpecies){

    const options = [];

    console.log(birdSpecies);
    console.log(typeof(birdSpecies));
    console.log(birdSpecies.species);


    for(let i = 0; i < birdSpecies.species.length; i++){

        const option = document.createElement('option');
        option.value = birdSpecies.species[i].name;
        option.text = birdSpecies.species[i].name;

        options.push(option);

    }
    
    return options;

}

export function createDescriptionTable(birdSpecies){

    const tableWrapper = document.createElement('div');
    tableWrapper.classList = "animalDescriptionTableWrapper hidden";

    const table = document.createElement('div');
    table.classList = "animalDescriptionTable";

    for(let i = 0; i < birdSpecies.species.length; i++){

        const wrapper = document.createElement('div');
        wrapper.classList = "descriptionTableRow";

        const label = document.createElement('label');
        label.value = birdSpecies.species[i].name;
        label.innerText = birdSpecies.species[i].name;
        label.htmlFor = birdSpecies.species[i].name + "_description";
        
        const description = document.createElement('p');
        description.innerText = birdSpecies.species[i].description;
        description.id = birdSpecies.species[i].name + "_description";

        wrapper.appendChild(label);
        wrapper.appendChild(description);

        table.appendChild(wrapper);

    }

    tableWrapper.appendChild(table)

    return tableWrapper;

}