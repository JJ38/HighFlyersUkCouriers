import { db, getDocuments } from "/js/Firebase.js";
import { where, query, collection } from "firebase/firestore";

const ID = parseInt(new URLSearchParams(document.location.search).get("id"));
const q = query(collection(db, "Orders"), where("ID", "==", ID));

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
        field.innerText = fields;

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

            default:
            {
                const input = document.createElement('input');
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

function sortOrderData(orderFields){

    const sortedOrderData = {

        ID: orderFields['ID'],
        animalType: orderFields['animalType'],
        quantity: orderFields['quantity'],
        email: orderFields['email'],
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
        message: orderFields['message'],
        code: orderFields['code'],
        addedBy: orderFields['addedBy'],
        printed: orderFields['printed'],
        timestamp: orderFields['timestamp']
        
    }

    return sortedOrderData;
}

