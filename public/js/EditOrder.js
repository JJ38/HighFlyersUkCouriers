import { db, getDocuments } from "/js/Firebase.js";
import { where, query, collection } from "firebase/firestore";
import { fetchBirdSpecies, createAnimalTypeSelectOptions, createDescriptionTable, initInternalOrderForm } from "/js/FormModel.js";


const ID = parseInt(new URLSearchParams(document.location.search).get("id"));
const q = query(collection(db, "Orders"), where("ID", "==", ID));

const saveButton = document.getElementById('save_button');
const form = document.getElementById('edit_order_form');

const validPaymentOptions = ['Account', 'Collection', 'Delivery', 'Pickup'];
const validAnimalTypes = ['Pigeons - Young Birds', 'Pigeons - Old Birds', 'Aviary & Cage Birds', 'Birds Of Prey', 'Reptiles', 'Small Mammals', 'Small Rodents', 'Poultry & Gamebirds'];


const fieldsMap = {
    ID: "ID:",
    animalType: "Animal Type:",
    email: "Email:",
    quantity: "Quantity:",
    boxes: "Boxes:",
    account: "Account:",
    deliveryWeek: "Delivery Week:",
    
    collectionName: "Collection Name:",
    collectionAddress1: "Collection Address 1:",  
    collectionAddress2: "Collection Address 2:",
    collectionAddress3: "Collection Address 3:",
    collectionPostcode: "Collection Postcode:",
    collectionPhoneNumber: "Collection Phonenumber:",
    
    deliveryName: "Delivery Name:",
    deliveryAddress1: "Delivery Address 1:",
    deliveryAddress2: "Delivery Address 2:",
    deliveryAddress3: "Delivery Address 3:",
    deliveryPostcode: "Delivery Postcode:",
    deliveryPhoneNumber: "Delivery Phonenumber:",

    payment: "Payment:",
    price: "Price:",
    message: "Message:",
    code: "Code:",
    addedBy: "Added By:",
    printed: "Printed:",
    timestamp: "Timestamp:",
}

let options;

init();
addEventListeners();


async function init(){

    const formDataMap = await initInternalOrderForm();

    const birdSpecies = formDataMap.get('Settings/birdSpecies');
    const customerAccounts = formDataMap.get('Users');


    options = createAnimalTypeSelectOptions(birdSpecies);
    console.log(options);

    getDocuments(q).then((documentSnapshots) => {

        if(documentSnapshots.docs.length == 0){
            alert("Error fetching order");
            exit();
        }

        const table = document.getElementById("orderdata");
        const orderData = documentSnapshots.docs[0].data();

        const sortedOrderData = sortOrderData(orderData);

        for(var fields in sortedOrderData){

            const tableRow = document.createElement('tr');

            const field = document.createElement('td');
            field.innerText = fieldsMap[fields];

            const data = document.createElement('td');

            switch (fields){

                case "ID":
                case "timestamp":
                case "addedBy":
                {
                    data.innerText = sortedOrderData[fields];
                
                    break;
                }
                case "printed":
                {
                    const input = document.createElement('select');
                    input.name = "printed"
                    input.id = "printed";

                    const printedOpt = document.createElement('option');
                    printedOpt.value = "Printed";
                    printedOpt.innerText = "Printed";

                    const notPrintedOpt = document.createElement('option');
                    notPrintedOpt.value = "Not Printed";
                    notPrintedOpt.innerText = "Not Printed";

                    if(sortedOrderData[fields]){//printed
                        printedOpt.selected = true;
                    }else{
                        notPrintedOpt.selected = false;
                    }


                    input.appendChild(notPrintedOpt);
                    input.appendChild(printedOpt);

                    data.appendChild(input);

                    break;
                }
                case "animalType":
                {

                    const select = document.createElement('select');
                    select.id = "animal_type";
                    select.name = "animal_type";
                    
                    let setSelected = false;

                    for(let i = 0; i < options.length; i++){

                        if(options[i].value == sortedOrderData[fields]){
                            options[i].selected = true;
                            setSelected = true;
                        }

                        select.appendChild(options[i]);

                    }

                    if(!setSelected){
                        const option = document.createElement('option');
                        option.value = sortedOrderData[fields];
                        option.text = sortedOrderData[fields];
                        option.selected = true;

                        select.append(option);

                    }

                    data.appendChild(select);
                    break;

                }
                case "deliveryWeek":
                case "quantity":
                case "boxes":
                case "price":
                {
                    const input = document.createElement('input');
                    input.id = fields;
                    input.type = "number";
                    input.value = sortedOrderData[fields];
                    input.name = fields;
                    data.appendChild(input);
                    break;
                }
                default:
                {
                    const input = document.createElement('input');
                    input.id = fields;
                    input.type = "text";
                    input.value = sortedOrderData[fields];
                    input.name = fields;
                    data.appendChild(input);
                }
            }

            tableRow.appendChild(field);
            tableRow.appendChild(data);    
            
            table.appendChild(tableRow);

        }

        const docRef = document.createElement('input');
        docRef.type = "hidden";
        docRef.value = documentSnapshots.docs[0].id;
        docRef.name = "docRef";

        table.appendChild(docRef);
    });
}


function addEventListeners(){

    if(saveButton != null){

        saveButton.addEventListener('click', () => {

            const validateResult = validateForm();

            if(validateResult != null){
                alert(validateResult);
                return;
            }

            form.submit();

        });

    }

}


function sortOrderData(orderFields){

    const sortedOrderData = {

        ID: orderFields['ID'],
        animalType: orderFields['animalType'],
        quantity: orderFields['quantity'],
        email: orderFields['email'],
        boxes: orderFields['boxes'],
        account: orderFields['account'],
        deliveryWeek: orderFields['deliveryWeek'],
        
        collectionName: orderFields['collectionName'],
        collectionAddress1: orderFields['collectionAddress1'],
        collectionAddress2: orderFields['collectionAddress2'],
        collectionAddress3: orderFields['collectionAddress3'],
        collectionPostcode: orderFields['collectionPostcode'],
        collectionPhoneNumber: orderFields['collectionPhoneNumber'],
        
        deliveryName: orderFields['deliveryName'],
        deliveryAddress1: orderFields['deliveryAddress1'],
        deliveryAddress2: orderFields['deliveryAddress2'],
        deliveryAddress3: orderFields['deliveryAddress3'],
        deliveryPostcode: orderFields['deliveryPostcode'],
        deliveryPhoneNumber: orderFields['deliveryPhoneNumber'],

        payment: orderFields['payment'],
        price: orderFields['price'],
        message: orderFields['message'],
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

function validateForm(){ 

    const deliveryPhoneNumber = document.getElementById('deliveryPhoneNumber');
    const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');

    const animalTypeSelect = document.getElementById('animal_type');
    const payment = document.getElementById('payment');

    const boxes = document.getElementById('boxes');
    const quantity = document.getElementById('quantity');



    const isNumber = new RegExp('^[0-9]*$');
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const deliveryTelephoneNumber = deliveryPhoneNumber.value.replace(" ", "");
    const collectionTelephoneNumber = collectionPhoneNumber.value.replace(" ", "");

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

    if(!validPaymentOptions.includes(payment.value)){
        return "Please select a valid payment option";
    }

    if(!validAnimalTypes.includes(animalTypeSelect.value)){
        return "Please select a valid animal type";
    }

    if(!isNumber.test(quantity.value) || parseInt(quantity.value) < 1 || quantity.value == ""){
        return "Quantity is not a valid number. Please enter a number greater than 0";
    }

    if(!isNumber.test(boxes.value) || parseInt(boxes.value) < 1 || boxes.value == ""){
        return "Boxes is not a valid number. Please enter a number greater than 0";
    }


    return null;

}

