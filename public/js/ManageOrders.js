import { markOrdersAsPrinted, getInitialData, loadAdditionalOrders, sortOrderData, getFilterOrders } from "/js/FirebaseManageOrders.js";
import { auth, filterSearch } from "/js/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";

const massActionButtons = document.getElementById('massActionButtons');

const selectAllButton = document.getElementById('selectall');
const deletedSelectedButton = document.getElementById('deleteselected');
const printSelectedButton = document.getElementById('printselected');

const searchButton = document.getElementById('searchButton');
const searchValue = document.getElementById('searchValue');
const searchOption = document.getElementById('searchOption');

const adminLinks = document.querySelectorAll(".adminLink");
const orderDataWrapper = document.getElementById('orderDataWrapper');

const orderTable = document.getElementById('tableBody');
const loadingSymbol = document.getElementById('loadingsymbol');
const loaderWrapper = document.getElementById('loaderWrapper');


let orderDataWrapperHeight;

let orderIDs = [];
let hasPrinted = [];
let printType = "";
let orderID = -1;
let isPrinted = "";
let role;
let initialQuery = true;
let fetchingOrders = false;

addListeners();

onAuthStateChanged(auth, (user) => {

  if (user) {

    auth.currentUser.getIdTokenResult().then(async (getIdTokenResult) => {
      console.log(getIdTokenResult.claims.role);   
      role = getIdTokenResult.claims.role;
    
      loadOrders();
      loadingSymbol.classList.add('hidden');
      loaderWrapper.classList.remove('hidden');
      orderDataWrapperHeight = orderDataWrapper.getBoundingClientRect().height;
      
    });


  } else {

  }
  
});

orderDataWrapper.addEventListener('scroll', (event) => {
  
  const scrollHeight = event.target.scrollHeight;
  const scrollTop = event.target.scrollTop; 

  if(scrollHeight - scrollTop - orderDataWrapperHeight < 100){
    console.log("loadorders");
    loadOrders();
  }

});



searchButton.addEventListener('click', async () => {

  const searchOptionInput = searchOption.value;
  let searchValueInput = searchValue.value;

  if(searchOptionInput == "price"){

    searchValueInput = searchValueInput.replaceAll("£", "");

  }

  const query = filterSearch(searchOptionInput, searchValueInput);
  console.log(query);

  const orderData = await getFilterOrders(query);

  console.log(orderData);

  //clear table of current orders
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = "";

  //append order data to table
  addOrdersToTable(orderData, false);

});


async function loadOrders(){

  let orderData = null;

  if(fetchingOrders){
    return;
  }

  fetchingOrders = true;

  if(initialQuery){

      initialQuery = false;
      orderData = await getInitialData();

  }else{
     
      orderData = await loadAdditionalOrders();

  }

  //append order data to table
  addOrdersToTable(orderData, false);

  fetchingOrders = false;

}



function roleBasedAccess(){

  if(role == "admin"){

    if(deletedSelectedButton != null){
      deletedSelectedButton.classList.remove("hidden");
    }

    //show individual delete buttons
    const deleteButtons = document.querySelectorAll(".deleteButton");

    if(deleteButtons != null){
    
      for(let i = 0 ; i < deleteButtons.length; i++){

        deleteButtons[i].classList.remove("hidden");
        
      }
    }

    const editButton = document.querySelectorAll(".editButton");
    
    if(editButton != null){
    
      for(let i = 0 ; i < editButton.length; i++){

        editButton[i].classList.remove("hidden");
        
      }
    }

    if(adminLinks != null){

      for(const link of adminLinks){
        
        link.classList.remove("hidden");

      }

    }

  }

  if(role == "staff"){

    //show delete buttons on public orders only
    const editButton = document.querySelectorAll(".publicEditOrderButton");
    
    if(editButton != null){
    
      for(let i = 0 ; i < editButton.length; i++){

        editButton[i].classList.remove("hidden");
        
      }
    }

  }

  massActionButtons.classList.remove("hidden");

}

function getDeliveryWeekColour(week){

  const weekNumber = parseInt(week);
  let weekColour;

  switch (weekNumber % 8) {
    case 0:
      weekColour = "red";
      break;

    case 1:
      weekColour = "green";
      break;

    case 2:
      weekColour = "yellow";
      break;

    case 3:
      weekColour = "blue";
      break;

    case 4:
      weekColour = "#B5651D";
      break;

    case 5:
      weekColour = "#CBC3E3";
      break;

    case 6:
      weekColour = "pink";
      break;

    case 7:
      weekColour = "orange";
      break;

    default:
      weekColour = "white";
  }

  return weekColour;

}

function getAnimalTypeColour(animalType){

  
  let animalTypeColour;

  switch (animalType) {
    case "Pigeons - Young Birds":
      animalTypeColour = "red";
      break;

    case "Pigeons - Old Birds":
      animalTypeColour = "green";
      break;

    case "Aviary & Cage Birds":
      animalTypeColour = "yellow";
      break;

    case "Birds Of Prey":
      animalTypeColour = "blue";
      break;

    case "Reptiles":
      animalTypeColour = "#B5651D";
      break;

    case "Small Mammals":
      animalTypeColour = "#CBC3E3";
      break;

    case "Small Rodents":
      animalTypeColour = "pink";
      break;

    case "Poultry & Gamebirds":
      animalTypeColour = "orange";
      break;

    default:
      animalTypeColour = "white";
  }

  return animalTypeColour;

}

export function addOrdersToTable(orderArray, prepend){

  console.log(orderArray);

  for(let i = 0; i < orderArray.length; i++){

      const orderFields = orderArray[i].data();
      const tableRow = document.createElement('tr');
     
      //translate printed field
      if(orderFields['printed'] == 1){
          orderFields['printed'] = "Printed";
      }else{
          orderFields['printed'] = "Not Printed";
      }
          
      const sortedOrderData = sortOrderData(orderFields);

    

      for(var field in sortedOrderData){

          const tableData = document.createElement('td');

          if(field == "price"){
            tableData.innerHTML = sortedOrderData[field] == undefined || sortedOrderData[field] == "" || sortedOrderData[field] == null || sortedOrderData[field] == "N/A" ? "N/A" : "£" + sortedOrderData[field]; 
          }else if(field == "boxes"){
            tableData.innerHTML = sortedOrderData[field] == undefined || sortedOrderData[field] == "" || sortedOrderData[field] == null || sortedOrderData[field] == "N/A" ? "N/A" : sortedOrderData[field];
          }else{
            tableData.innerHTML = sortedOrderData[field];
          }

          tableData.classList.add(field);

          if(field == "deliveryWeek"){
            tableData.style.background = getDeliveryWeekColour(sortedOrderData['deliveryWeek'])
          }

          if(field == "animalType"){
            tableData.style.background = getAnimalTypeColour(sortedOrderData['animalType'])
          }
          
          tableRow.append(tableData);
      
      }

      //add order checkbox
      const tableData = document.createElement('td');
      const orderCheckBox = document.createElement('input');
      orderCheckBox.type = "checkbox";
      orderCheckBox.id = orderFields['ID'];
      orderCheckBox.name = "ID";
      orderCheckBox.value = orderArray[i].id;
      orderCheckBox.setAttribute('onclick', 'highlightorder(this)');

      tableData.appendChild(orderCheckBox);

      tableRow.prepend(tableData);
      if(prepend){
          orderTable.prepend(tableRow);
      }else{
          orderTable.appendChild(tableRow);
      }

      const orderButtons = getOrderButtons(orderFields);

      tableRow.appendChild(orderButtons);
      console.log("added delete buttons");

      //add print button to orderFields so listener can be added to it
      orderFields['printButton'] = orderButtons.children[0].firstChild;
    
      addPrintListener(orderFields, orderArray[i].id);
  }


  roleBasedAccess();

}

function getOrderButtons(orderData){

  const buttonWrapper = document.createElement('td');

  const printLink = document.createElement('a');
  printLink.classList = "print";
  const printButton = document.createElement('button');
  printButton.innerText = "Print";
  printButton.type= "button";
  printLink.appendChild(printButton);
  //add print button to array

  const viewLink = document.createElement('a');
  viewLink.href="/view-order?id=" + orderData["ID"];
  const viewButton = document.createElement('button');
  viewButton.innerText = "View";
  viewButton.type= "button";
  viewLink.appendChild(viewButton);

  const editLink = document.createElement('a');
  editLink.href = "/edit-order?id=" + orderData["ID"];
  const editButton = document.createElement('button');
  editButton.innerText = "Edit";
  editButton.type= "button";
  editButton.classList.add("editButton");
  editButton.classList.add("hidden");
  editLink.appendChild(editButton);

  //mark as public order
  if(orderData['account'] == ""){
    editButton.classList.add("publicEditOrderButton");
  }

  const deleteLink = document.createElement('a');
  deleteLink.href = "/delete-order?id=" + orderData["ID"];

  const deleteButton = document.createElement('button');
  deleteButton.innerText = "Delete";
  deleteButton.type= "button";
  deleteButton.classList.add("hidden");
  deleteButton.classList.add("deleteButton");
  deleteLink.appendChild(deleteButton);


  buttonWrapper.appendChild(printLink);
  buttonWrapper.appendChild(viewLink);
  buttonWrapper.appendChild(editLink);
  buttonWrapper.appendChild(deleteLink);
  buttonWrapper.classList = "orderbuttons";

  return buttonWrapper;
}

function addPrintListener(orderFields, localOrderID){


  orderFields["printButton"].addEventListener('click', e => {
      console.log("print clicked");
      printType = "SINGULARPRINT";
      orderID = localOrderID;
      isPrinted = orderFields["printed"];
      
      orderFields['price'] = "£" + orderFields['price'];

      printOrder([orderFields]);
      
  });

}

function addListeners(){
  if(printSelectedButton != null){

    printSelectedButton.addEventListener('click', e => {
      printSelected();
    });
    
  }

  if(selectAllButton != null){

    selectAllButton.addEventListener('click', e => {
      selectAll();
    });
  }

  if(deletedSelectedButton != null){

    deletedSelectedButton.addEventListener('click', e => {
      deleteSelected();
    });

  }
  

}

function singularPrint(){

  if(confirm("Would you like the selected orders as printed?")){
    if(isPrinted == "Not Printed"){
      //import from FirebaseManageOrders.js
      markOrdersAsPrinted([orderID]);
    }else{
      alert('Order already marked printed');
    }
  }
}


function selectAll(){

  const allCheckBoxes = document.querySelectorAll('input[type=checkbox]');

  for(let i = 0; i < allCheckBoxes.length; i++){
    allCheckBoxes[i].checked = true;
    allCheckBoxes[i].parentElement.parentElement.classList.add("highlightorder");

  }
  
}

function deleteSelected(){

  const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked');
  const deleteSelectedForm = document.getElementById("deleteselectedform");

  for(let i = 0; i < selectedCheckBoxes.length; i++){
    selectedCheckBoxes[i].type = "hidden"; //stops visual bug when checkbox is added to form
    deleteSelectedForm.appendChild(selectedCheckBoxes[i]);
  }

  if(selectedCheckBoxes.length > 0){
    deleteSelectedForm.submit();
  }

}

function printSelected(){

  printType = "MULTIPLEPRINT";

  const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked');
  orderIDs = [];
  hasPrinted = [];
  let orderFields = [];

  for(let i = 0; i < selectedCheckBoxes.length; i++){

    orderIDs.push(selectedCheckBoxes[i].value);
    hasPrinted.push(selectedCheckBoxes[i].parentElement.parentElement.children[25].textContent);
    const orderTableRow = selectedCheckBoxes[i].parentElement.parentElement
    orderFields.push(getOrderFields(orderTableRow));

  }

  print(generateForms(orderFields));

}

function getOrderFields(orderTableRow){

  let orderMap = [];

  const fields = orderTableRow.children;

  for (let i = 0; i < fields.length; i++){
   
    //if field
    if (fields[i].className && fields[i].className != "orderbuttons"){ 
      
      orderMap[fields[i].className] = fields[i].textContent;
      
    }
   
  }

  return orderMap;

}

function closePrint() {
  document.body.removeChild(this.__container__);
}

function setPrint() {
  this.contentWindow.__container__ = this;
  this.contentWindow.onbeforeunload = closePrint;
  if(printType == "MULTIPLEPRINT"){
    this.contentWindow.onafterprint = confirmPrint;
  }else if(printType == "SINGULARPRINT"){
    this.contentWindow.onafterprint = singularPrint;
  }
  
  this.contentWindow.focus(); // Required for IE
  this.contentWindow.print();
}

function printOrder(orderFields) {

  const form = generateForms(orderFields);
  print(form);

}


function confirmPrint() {

  if(confirm("Would you like to mark the selected orders as printed?")){
  
    //check if already marked as printed

    let notPrintedOrders = [];
    
    for(let i = 0; i < orderIDs.length; i++){

      //loop through orders in the orderIDs list
      if(hasPrinted[i] == "Not Printed"){
        notPrintedOrders.push(orderIDs[i]);
      }
      
    }

    if(notPrintedOrders.length > 0){

      markOrdersAsPrinted(notPrintedOrders);  

    }else{
      alert('Orders already marked printed');
    }

  }
  
}




function print(form){

  console.log("print");

  const hideFrame = document.createElement("iframe");
  hideFrame.onload = setPrint;
  hideFrame.style.position = "fixed";
  hideFrame.style.right = "0";
  hideFrame.style.bottom = "0";
  hideFrame.style.width = "0";
  hideFrame.style.height = "0";
  hideFrame.style.border = "0";

  hideFrame.srcdoc = form;
  document.body.appendChild(hideFrame);
}

function generateForms(orderFields){

  let html;

  let boilerplateTop = '<!DOCTYPE html>'+
    '<html lang="en">'+
      '<head>'+
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
        '<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'+
        '<link rel="stylesheet" href="css/PrintableForm.css" type="text/css">'+
        ''+
      '</head>'+
        '<body>';
         
        

  let boilerplateBottom = '</body>'+  
  '</html>';

  
  html = boilerplateTop;

  for(let i = 0; i < orderFields.length; i++){

    const orderHTML = getOrderHTML(orderFields[i]);
    html = html + orderHTML;

  }

 

  html = html + boilerplateBottom;
  
  return html;
    
}

function getOrderHTML(orderFields){

  let order =  
  '<div class="page">'+
    '<h1>'+
      'High Flyers'+
    '</h1>'+
    '<h2>'+
      'Telephone: 07887 781089'+
    '</h2>'+
    '<div class="grid">'+
      '<label class="bold">Order ID: </label>'+
      '<p>' + orderFields['ID'] + '</p>'+
      ''+
      '<label class="bold">Animal Type: </label>'+
      '<p>' + orderFields['animalType'] + '</p>'+
      ''+
      '<label class="bold">Quantity: </label>'+
      '<p>' + orderFields['quantity'] + '</p>'+
      ''+
      '<label class="bold">Payment Method: </label>'+
      '<p> Cash On ' + orderFields['payment'] + '</p>'+
      ''+
      '<label class="bold">Boxes: </label>'+
      '<p>' + orderFields['boxes'] + '</p>'+
      ''+
      '<label class="bold">Price: </label>'+
      '<p>' + orderFields['price'] + '</p>'+
      ''+
      '<label class="bold">Code: </label>'+
      '<p>' + orderFields['code'] + '</p>'+
      '<label class="bold">Notes: </label>'+
      '<p>' + orderFields['message'] + '</p>'+
    '</div>'+
     
    '<div class="formwrapper">'+
      '<div class="wrapper grid delivery">'+
        '<h3>'+
          'Pick up from:'+
        '</h3>'+
        '<div class="infowrapper">'+

          '<label>Name:</label>'+
          '<p>' + orderFields['collectionName']  + '</p>'+
      
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + orderFields['collectionAddress1'] + '</p>'+
            '<p>' + orderFields['collectionAddress2'] + '</p>'+
            '<p>' + orderFields['collectionAddress3'] + '</p>'+
            '<p>' + orderFields['collectionPostcode'] + '</p>'+
          '</address>' +
                        
          '<label>Telephone:</label>'+
          '<p>' + orderFields['collectionPhoneNumber'] + '</p>'+

      '</div>'+
      '</div>'+
      '<div class="wrapper grid deliverytextcolour">'+
        '<h3>'+
          'Deliver to:'+
        '</h3>'+
          '<div class="infowrapper">'+

            '<label>Name:</label>'+
            '<p>' + orderFields['deliveryName'] + '</p>'+

            '<label>Address:</label>'+
            '<address>' + 
              '<p>' + orderFields['deliveryAddress1']+ '</p>'+
              '<p>' + orderFields['deliveryAddress2'] + '</p>'+
              '<p>' + orderFields['deliveryAddress3'] + '</p>'+
              '<p>' + orderFields['deliveryPostcode'] + '</p>'+
            '</address>' +
        
            '<label>Telephone:</label>'+
            '<p>' + orderFields['deliveryPhoneNumber']  + '</p>'+          
      
          '</div>'+
      '</div>'+
    '</div>'+
    '<div class="grideven "><b>Signature:</b><b>Time:</b></div>'+
    '<br>'+
  '</div>'+
  '<div class="page">'+
    '<h1>'+
      'High Flyers'+
    '</h1>'+
    '<h2>'+
      'Telephone: 07887 781089'+
    '</h2>'+
    '<div class="grid">'+
      '<label class="bold">Order ID: </label>'+
      '<p>' + orderFields['ID'] + '</p>'+
      ''+
      '<label class="bold">Animal Type: </label>'+
      '<p>' + orderFields['animalType'] + '</p>'+
      ''+
      '<label class="bold">Quantity: </label>'+
      '<p>' + orderFields['quantity'] + '</p>'+
      ''+
      '<label class="bold">Payment Method: </label>'+
      '<p> Cash On ' + orderFields['payment'] + '</p>'+
      ''+
      '<label class="bold">Boxes: </label>'+
      '<p>' + orderFields['boxes'] + '</p>'+
      ''+
      '<label class="bold">Price: </label>'+
      '<p>' + orderFields['price'] + '</p>'+
      ''+
      '<label class="bold">Code: </label>'+
      '<p>' + orderFields['code'] + '</p>'+
      ''+
      '<label class="bold">Notes: </label>'+
      '<p>' + orderFields['message'] + '</p>'+
    '</div>'+
    '<div class="formwrapper">'+
      '<div class="wrapper grid collectiontextcolour">'+
        '<h3>'+
          'Pick up from:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + orderFields['collectionName']  + '</p>'+
      
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + orderFields['collectionAddress1'] + '</p>'+
            '<p>' + orderFields['collectionAddress2'] + '</p>'+
            '<p>' + orderFields['collectionAddress3'] + '</p>'+
            '<p>' + orderFields['collectionPostcode'] + '</p>'+
          '</address>' +
                        
          '<label>Telephone:</label>'+
          '<p>' + orderFields['collectionPhoneNumber'] + '</p>'+
      
        '</div>'+ 
      '</div>'+
      '<div class="wrapper grid collection collection">'+
        '<h3>'+
        'Deliver to:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
            '<p>' + orderFields['deliveryName'] + '</p>'+

            '<label>Address:</label>'+
            '<address>' + 
              '<p>' + orderFields['deliveryAddress1']+ '</p>'+
              '<p>' + orderFields['deliveryAddress2'] + '</p>'+
              '<p>' + orderFields['deliveryAddress3'] + '</p>'+
              '<p>' + orderFields['deliveryPostcode'] + '</p>'+
            '</address>' +
        
            '<label>Telephone:</label>'+
            '<p>' + orderFields['deliveryPhoneNumber']  + '</p>'+      
        '</div>'+
      '</div>'+
      '<br>'+
    '</div>'+
    '<div class="grideven "><b>Signature:</b><b>Time:</b></div>'+
    '<br>'+
 '</div>'    

return order;

}