import { db, getDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";


export async function validatePostcodes(deliveryPostcode, collectionPostcode){

    let postcodeExceptions

    try{

        postcodeExceptions = await getDocument(doc(db, "Settings", "postcodeExceptions"));
    
    }catch(e){

        console.log(e);
        return false;

    }

    const deliveryException = checkPostcodeForException(deliveryPostcode, postcodeExceptions, "DELIVERY");

    if(deliveryException){  
        return deliveryException;
    }

    const collectionException = checkPostcodeForException(collectionPostcode, postcodeExceptions, "COLLECTION");

    if(collectionException){

        return collectionException;

    }

    return false;

}

export function checkPostcodeForException(postcodeInput, postcodeExceptions, postcodeType){

    const postcode = postcodeInput.toUpperCase().replaceAll(" ", "");
    const exceptions = postcodeExceptions.data()['exceptions'];

    const outwardPostcode = getOutwardPostcode(postcode);

    for(let i = 0; i < exceptions.length; i++){

        if(exceptions[i]['exceptionTypes'].includes(postcodeType)){

            if(exceptions[i]['postcodes'].includes(outwardPostcode)){
                const message = exceptions[i]['message'].replace("{$postcode}", postcode)
                return message;

            }
    
        }

    }

    return false;

}

function getOutwardPostcode(postcode){

    if(postcode.length == 7){
        return postcode.substring(0, 4);
    }

    if(postcode.length == 6){
        return postcode.substring(0, 3);
    }

    if(postcode.length == 5){
        return postcode.substring(0, 2);
    }

    //assume it is an outward postcode
    return postcode;

}

