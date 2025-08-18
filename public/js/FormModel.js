import { db, getDocument, updateDocument } from '/js/firebase';
import { query, doc, collection } from 'firebase/firestore';
import { showNotification } from '/js/Notification';


export async function fetchBirdSpecies(){

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

    return birdSpecies;

}


export function createAnimalTypeSelectOptions(birdSpecies){


    const options = [];

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