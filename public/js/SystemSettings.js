import { db, getDocument, updateDocument } from '/js/firebase';
import { query, doc, collection } from 'firebase/firestore';
import { showNotification } from '/js/Notification';

const birdSpeciesWrapper = document.getElementById('bird_species_wrapper');

fetchBirdSpecies();
addEventListeners();

function addEventListeners(){


}

async function fetchBirdSpecies(){

    const birdSpeciesDocument = await getDocument(query(doc(db, 'Settings', 'birdSpecies')));

    if(birdSpeciesDocument == false){
        showNotification("Error!", "Error fetching bird species");
        return;
    }

    const birdSpecies = birdSpeciesDocument.data();
    
    if(birdSpecies == null){
        showNotification("Error!", "Error fetching bird species");
        return;
    }

    parseBirdSpecies(birdSpecies);

}

function parseBirdSpecies(birdSpecies){

    for(let i = 0; i < birdSpecies.species.length; i++){

        const card = createBirdSpeciesCard(birdSpecies.species[i]);
        birdSpeciesWrapper.appendChild(card);

    }
    
}


function createBirdSpeciesCard(bird){

    const card = document.createElement('div');
    card.classList = "birdSpeciesCard";


    const nameInputWrapper = document.createElement('div');
    nameInputWrapper.classList = "inputWrapper";

    const nameLabel = document.createElement('label');
    nameLabel.classList = "inputLabel";
    nameLabel.innerText = "Name";
    nameLabel.htmlFor = bird.name + "_name"

    const name = document.createElement('input');
    name.classList = "input shortInput";
    name.value = bird.name;
    name.id = bird.name + "_name";

    nameInputWrapper.appendChild(nameLabel);
    nameInputWrapper.appendChild(name);



    const includedQuantityWrapper = document.createElement('div');
    includedQuantityWrapper.classList = "inputWrapper";

    const includedQuantityLabel = document.createElement('label');
    includedQuantityLabel.classList = "inputLabel";
    includedQuantityLabel.innerText = "Included Quantity";
    includedQuantityLabel.htmlFor = bird.name + "_quantity"

    const includedQuantity = document.createElement('input');
    includedQuantity.classList = "input shortInput";
    includedQuantity.value = bird.prices.includedQuantity;
    includedQuantity.id = bird.name + "_quantity";
    includedQuantity.type = "number";

    includedQuantityWrapper.appendChild(includedQuantityLabel);
    includedQuantityWrapper.appendChild(includedQuantity);

    

    const descriptionInputWrapper = document.createElement('div');
    descriptionInputWrapper.classList = "inputWrapper";

    const descriptionLabel = document.createElement('label');
    descriptionLabel.classList = "inputLabel";
    descriptionLabel.innerText = "Description";
    descriptionLabel.htmlFor = bird.name + "_description"

    const description = document.createElement('textarea');
    description.classList = "input";
    description.value = bird.description;
    description.id = bird.name + "_description";

    descriptionInputWrapper.appendChild(descriptionLabel);
    descriptionInputWrapper.appendChild(description);



    const pricesWrapper = document.createElement('div');
    pricesWrapper.classList = "pricesWrapper";  
    pricesWrapper.appendChild(createPriceTable(bird));
    

    card.appendChild(nameInputWrapper);
    card.appendChild(includedQuantityWrapper);
    card.appendChild(descriptionInputWrapper);
    card.appendChild(pricesWrapper);

    return card;

}


function createPriceTable(bird){

    const priceCard = document.createElement('div');
    priceCard.classList = "priceCard";

    const table = document.createElement('div');
    table.classList = "hidden";

    const headers = document.createElement('div');
    headers.classList = "row header";

    const area = document.createElement('p');
    area.innerText = "Area";

    const standardPrice = document.createElement('p');
    standardPrice.innerText = "Standard Price (£)";

    const additionalPrice = document.createElement('p');
    additionalPrice.innerText = "Additional Price (£)";

    headers.appendChild(area);
    headers.appendChild(standardPrice);
    headers.appendChild(additionalPrice);

    table.appendChild(headers);

    for(let i = 0; i < bird.prices.areaPrices.length; i++){

       table.appendChild(createAreaPriceCard(bird.prices.areaPrices[i]));

    }

    const toggle = createToggle(table);

    priceCard.appendChild(toggle);
    priceCard.appendChild(table);

    return priceCard;

}

function createAreaPriceCard(areaPrice){

    const row = document.createElement('div');
    row.classList = "row";

    const areaName = document.createElement('p');
    areaName.innerText = areaPrice.area;

    const standardPrice = document.createElement('input');
    standardPrice.classList = "input";
    standardPrice.value = areaPrice.standardPrice;
    standardPrice.type = "number";
    standardPrice.id = areaPrice.area + "_" + "standard";

    const additionalPrice = document.createElement('input');
    additionalPrice.classList = "input";
    additionalPrice.value = areaPrice.additionalPrice;
    additionalPrice.type = "number";
    additionalPrice.id = areaPrice.area + "_" + "additional";


    row.appendChild(areaName);
    row.appendChild(standardPrice);
    row.appendChild(additionalPrice);

    return row;

}

function createToggle(table){

    const toggleWrapper = document.createElement('div');
    toggleWrapper.classList = "toggleWrapper";

    const label = document.createElement('p');
    label.innerText = "Prices";

    const toggle = document.createElement('div');
    toggle.classList = "toggle";
    toggle.innerText = "V";
    
    toggle.addEventListener('click', () => {

        console.log(table.classList);

        if(table.classList.contains('hidden')){

            table.classList.remove('hidden');          
            toggle.classList.add('toggled');

        }else{

            table.classList.add('hidden');
            toggle.classList.remove('toggled');

        }   

    });

    toggleWrapper.appendChild(label);
    toggleWrapper.appendChild(toggle);

    return toggleWrapper;

}