
const orderElements = document.querySelectorAll('tr');
const printButtons = document.querySelectorAll('.print');
const selectAllButton = document.getElementById('selectall');
const deletedSelectedButton = document.getElementById('deleteselected');
const printSelectedButton = document.getElementById('printselected');
const allCheckBoxes = document.querySelectorAll('input[type=checkbox]');


for(let i = 0; i < printButtons.length; i++){
    printButtons[i].addEventListener('click', e => {
        printOrder(orderElements[i + 1].children[1].innerHTML);
    });
}


function selectAll(){
  for(let i = 0; i < allCheckBoxes.length; i++){
    allCheckBoxes[i].checked = true;
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
  const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked');
  var orderIDs = [];
  for(let i = 0; i < selectedCheckBoxes.length; i++){
    orderIDs.push(selectedCheckBoxes[i].value);
  }

  print(generateForms(orderIDs));

}

function closePrint() {
  document.body.removeChild(this.__container__);
}

function setPrint() {
  this.contentWindow.__container__ = this;
  this.contentWindow.onbeforeunload = closePrint;
  this.contentWindow.onafterprint = closePrint;
  this.contentWindow.focus(); // Required for IE
  this.contentWindow.print();
}

function printOrder(orderNumber) {

  const form = generateForms([orderNumber]);
  print(form);

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

  let order =  
  '<div class="page">'+
    '<h1>'+
      'High Flyers'+
    '</h1>'+
    '<h2>'+
      'Telephone: 07887 781089'+
    '</h2>'+
      '<div class="formwrapper">'+
        '<div class="wrapper">'+
          '<h3>'+
            'Pick up from:'+
          '</h3>'+
          '<div class="infowrapper">'+
            '<label>Name:</label>'+
            '<p>' + tableData[5].innerHTML + '</p>'+

            '<label>Address:</label>'+
            '<address>' + 
              '<p>' + tableData[6].innerHTML + '</p>'+
              '<p>' + tableData[7].innerHTML + '</p>'+
              '<p>' + tableData[8].innerHTML + '</p>'+
              '<p>' + tableData[9].innerHTML + '</p>'+
            '</address>' +
        
          '<label>Telephone:</label>'+
          '<p>' + tableData[10].innerHTML + '</p>'+          
        
          '</div>'+
        '</div>'+
        '<div class="wrapper">'+
          '<h3>'+
           'Deliver to:'+
          '</h3>'+
            '<div class="infowrapper">'+
              '<label>Name:</label>'+
              '<p>' + tableData[11].innerHTML + '</p>'+
          
              '<label>Address:</label>'+
              '<address>' + 
                '<p>' + tableData[12].innerHTML + '</p>'+
                '<p>' + tableData[13].innerHTML + '</p>'+
                '<p>' + tableData[14].innerHTML + '</p>'+
                '<p>' + tableData[15].innerHTML + '</p>'+
              '</address>' +
                            
              '<label>Telephone:</label>'+
              '<p>' + tableData[16].innerHTML + '</p>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '<div class="page">'+
    '<h1>'+
      'High Flyers'+
    '</h1>'+
    '<h2>'+
      'Telephone: 07887 781089'+
    '</h2>'+
    '<div class="formwrapper">'+
      '<div class="wrapper">'+
        '<h3>'+
          'Pick up from:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + tableData[5].innerHTML +'</p>'+
  
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + tableData[6].innerHTML + '</p>'+
            '<p>' + tableData[7].innerHTML + '</p>'+
            '<p>' + tableData[8].innerHTML + '</p>'+
            '<p>' + tableData[9].innerHTML + '</p>'+
          '</address>' +
        
          '<label>Telephone:</label>'+
          '<p>' + tableData[9].innerHTML + '</p>'+
      
        '</div>'+ 
      '</div>'+
      '<div class="wrapper">'+
        '<h3>'+
        'Deliver to:'+
        '</h3>'+
        '<div class="infowrapper">'+
          '<label>Name:</label>'+
          '<p>' + tableData[11].innerHTML + ' </p>'+
         
          '<label>Address:</label>'+
          '<address>' + 
            '<p>' + tableData[12].innerHTML + '</p>'+
            '<p>' + tableData[13].innerHTML + '</p>'+
            '<p>' + tableData[14].innerHTML + '</p>'+
            '<p>' + tableData[15].innerHTML + '</p>'+
          '</address>' +
                        
          '<label>Telephone:</label>'+
          '<p>' + tableData[16].innerHTML + '</p>'+
        '</div>'+
      '</div>'+
  '</div>'+
'</div>'    

return order;

}