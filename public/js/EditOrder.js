import { db, getDocuments, auth } from "/js/Firebase.js";
import { where, query, collection } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const ID = parseInt(new URLSearchParams(document.location.search).get("id"));
const q = query(collection(db, "Orders"), where("ID", "==", ID));

let role;
let username;

onAuthStateChanged(auth, (user) => {

  if (user) {

    auth.currentUser.getIdTokenResult().then(async (getIdTokenResult) => {
        console.log(getIdTokenResult.claims.role);   
        role = getIdTokenResult.claims.role;
        username = auth.currentUser.email.replace("@placeholder.com", "");
        fetchDocuments();
      
    });


  } else {

  }
  
});

function fetchDocuments(){

    getDocuments(q).then((documentSnapshots) => {

        if(documentSnapshots.docs.length == 0){
            alert("Error fetching order");
            exit();
        }
    
        const table = document.getElementById("orderdata");
        const orderData = documentSnapshots.docs[0].data();
    
        //check if should have access
        if(role == "staff"){
    
            if(username != orderData['addedBy']){
                alert("you dont have permission to edit this order");
                return;
            }
    
        }
    
    
        const sortedOrderData = sortOrderData(orderData);
    
        console.log(table.children[0].children);
        let index = 0;
    
        for(var fields in sortedOrderData){
    
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
    
                case "username":
                {
            
                    const input = document.createElement('input');
                    input.type = "text";
                    input.value = sortedOrderData[fields];
                    input.name = fields;
                    data.appendChild(input);
    
                    break;
                }
    
                case "deliveryWeek":
                {
                    const input = document.createElement('input');
                    input.value = sortedOrderData[fields];
    
                    if(role == "admin"){
                        input.type = "number";
                    }else{
                        input.type = "hidden";
                    }
    
                    input.name = fields;
                    data.appendChild(input);
                    break;
                }
    
                case "quantity":
    
                    const input = document.createElement('input');
                    input.type = "number";
                    input.value = sortedOrderData[fields];
                    input.name = fields;
                    data.appendChild(input);
    
                    break;
    
                case "email":
                {
                    const input = document.createElement('input');
                    input.type = "email";
                    input.value = sortedOrderData[fields];
                    input.name = fields;
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
    
            table.children[0].children[index].appendChild(data);
    
            index++;
        }
    
        console.log(orderData);
        // for()
    
        const docRef = document.createElement('input');
        docRef.type = "hidden";
        docRef.value = documentSnapshots.docs[0].id;
        docRef.name = "docRef";
    
        table.appendChild(docRef);
    });
    

}


function sortOrderData(orderFields){

    const sortedOrderData = {

        ID: orderFields['ID'],
        animalType: orderFields['animalType'],
        quantity: orderFields['quantity'],
        email: orderFields['email'],
        username: orderFields['account'],
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

