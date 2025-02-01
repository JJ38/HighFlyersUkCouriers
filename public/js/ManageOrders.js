
const orderElements = document.querySelectorAll('tr');
const printButtons = document.querySelectorAll('.print');
const selectAllButton = document.getElementById('selectall');
const deletedSelectedButton = document.getElementById('deleteselected');
const printSelectedButton = document.getElementById('printselected');
const allCheckBoxes = document.querySelectorAll('input[type=checkbox]');
const body = document.querySelectorAll('body');

let orderIDs = [];
let hasPrinted = [];
let printType = "";
let orderID = -1;
let isPrinted = "";

for(let i = 0; i < printButtons.length; i++){
    printButtons[i].addEventListener('click', e => {
        // orderElements[i + 1].children[21].textContent
        printType = "SINGULARPRINT";
        orderID = orderElements[i + 1].children[1].innerHTML;
        isPrinted = orderElements[i + 1].children[23].textContent;
        printOrder(orderElements[i + 1].children[1].innerHTML);
        
    });
}

function highlightorder(orderCheckBox){

  console.log("highlighorder");

  orderCheckBox.parentElement.parentElement.classList.toggle("highlightorder");

}

function singularPrint(){

  if(confirm("Would you like the selected orders as printed?")){
    if(isPrinted == "Not Printed"){
      markOrdersAsPrinted([orderID]);
    }else{
      alert('Order already marked printed');
    }
  }
}


function selectAll(){
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
  for(let i = 0; i < selectedCheckBoxes.length; i++){
    orderIDs.push(selectedCheckBoxes[i].value);
    hasPrinted.push(selectedCheckBoxes[i].parentElement.parentElement.children[23].textContent);
  }

  print(generateForms(orderIDs));

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

function printOrder(orderNumber) {

  const form = generateForms([orderNumber]);
  print(form);

}


function confirmPrint() {

  if(confirm("Would you like the selected orders as printed?")){
  
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

function markOrdersAsPrinted(notPrintedOrders){
  
  const form = document.createElement('form');
  form.action = "/mark-orders-as-printed";
  form.method = "post";
  form.name = "printedordersform";
  form.id = "printedordersform";    
  //add ids as inputs

  console.log("markOrdersAsPrinted");

  for(let i = 0; i < notPrintedOrders.length; i++){
    const input = document.createElement('input');
    input.name = i;
    input.id = i;
    input.type = "hidden";
    input.value = notPrintedOrders[i];
    form.appendChild(input);
  }

  document.body.appendChild(form);

  form.submit();
}


function print(form){

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

function generateForms(orderIDs){

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

  orderData = [];

  for(let i = 1; i < orderElements.length; i++){
    if(orderIDs.includes(orderElements[i].children[1].innerHTML)){
      orderData.push(orderElements[i]);
    }
  }


  for(let i = 0; i < orderIDs.length; i++){
    const orderHTML = getOrderHTML(orderData[i].getElementsByTagName('td'));
    html = html + orderHTML;
  }

  html = html + boilerplateBottom;
  
  return html;
    
}

function getOrderHTML(tableData){

  console.log(tableData);

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
      '<p>' + tableData[1].innerHTML + '</p>'+
      ''+
      '<label class="bold">Animal Type: </label>'+
      '<p>' + tableData[2].innerHTML + '</p>'+
      ''+
      '<label class="bold">Quantity: </label>'+
      '<p>' + tableData[3].innerHTML + '</p>'+
      ''+
      '<label class="bold">Payment Method: </label>'+
      '<p> Cash On ' + tableData[19].innerHTML + '</p>'+
      ''+
      '<label class="bold">Code: </label>'+
      '<p>' + tableData[21].innerHTML + '</p>'+
      '<label class="bold">Notes: </label>'+
      '<p>' + tableData[20].innerHTML + '</p>'+
    '</div>'+
     
    '<div class="formwrapper">'+
      '<div class="wrapper grid delivery">'+
        '<h3>'+
          'Pick up from:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + tableData[7].innerHTML + '</p>'+

          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + tableData[8].innerHTML + '</p>'+
            '<p>' + tableData[9].innerHTML + '</p>'+
            '<p>' + tableData[10].innerHTML + '</p>'+
            '<p>' + tableData[11].innerHTML + '</p>'+
          '</address>' +
      
          '<label>Telephone:</label>'+
          '<p>' + tableData[12].innerHTML + '</p>'+          
      
        '</div>'+
      '</div>'+
      '<div class="wrapper grid deliverytextcolour">'+
        '<h3>'+
          'Deliver to:'+
        '</h3>'+
          '<div class="infowrapper">'+
            '<label>Name:</label>'+
            '<p>' + tableData[13].innerHTML + '</p>'+
        
            '<label>Address:</label>'+
            '<address>' + 
              '<p>' + tableData[14].innerHTML + '</p>'+
              '<p>' + tableData[15].innerHTML + '</p>'+
              '<p>' + tableData[16].innerHTML + '</p>'+
              '<p>' + tableData[17].innerHTML + '</p>'+
            '</address>' +
                          
            '<label>Telephone:</label>'+
            '<p>' + tableData[18].innerHTML + '</p>'+
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
      '<p>' + tableData[1].innerHTML + '</p>'+
      ''+
      '<label class="bold">Animal Type: </label>'+
      '<p>' + tableData[2].innerHTML + '</p>'+
      ''+
      '<label class="bold">Quantity: </label>'+
      '<p>' + tableData[3].innerHTML + '</p>'+
      ''+
      '<label class="bold">Payment Method: </label>'+
      '<p> Cash On ' + tableData[19].innerHTML + '</p>'+
      ''+
      '<label class="bold">Code: </label>'+
      '<p>' + tableData[21].innerHTML + '</p>'+
      ''+
      '<label class="bold">Notes: </label>'+
      '<p>' + tableData[20].innerHTML + '</p>'+
    '</div>'+
    '<div class="formwrapper">'+
      '<div class="wrapper grid collectiontextcolour">'+
        '<h3>'+
          'Pick up from:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + tableData[7].innerHTML +'</p>'+
  
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + tableData[8].innerHTML + '</p>'+
            '<p>' + tableData[9].innerHTML + '</p>'+
            '<p>' + tableData[10].innerHTML + '</p>'+
            '<p>' + tableData[11].innerHTML + '</p>'+
          '</address>' +
        
          '<label>Telephone:</label>'+
          '<p>' + tableData[12].innerHTML + '</p>'+
      
        '</div>'+ 
      '</div>'+
      '<div class="wrapper grid collection collection">'+
        '<h3>'+
        'Deliver to:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + tableData[13].innerHTML + ' </p>'+
         
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + tableData[14].innerHTML + '</p>'+
            '<p>' + tableData[15].innerHTML + '</p>'+
            '<p>' + tableData[16].innerHTML + '</p>'+
            '<p>' + tableData[17].innerHTML + '</p>'+
          '</address>' +
          
          '<label>Telephone:</label>'+
          '<p>' + tableData[18].innerHTML + '</p>'+
        '</div>'+
      '</div>'+
      '<br>'+
    '</div>'+
    '<div class="grideven "><b>Signature:</b><b>Time:</b></div>'+
    '<br>'+
 '</div>'    

return order;

}