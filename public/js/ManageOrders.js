
const printButtons = document.querySelectorAll('.print');
const orderData = document.querySelectorAll('tr');
const selectAllButton = document.getElementById('selectall');
const deletedSelectedButton = document.getElementById('deleteselected');
const printSelectedButton = document.getElementById('printselected');
const allCheckBoxes = document.querySelectorAll('input[type=checkbox]');


for(let i = 0; i < printButtons.length; i++){
    printButtons[i].addEventListener('click', e => {
        printPage(i + 1);
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

  console.log(orderIDs);

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

  async function printPage(orderNumber) {
    const hideFrame = document.createElement("iframe");
    hideFrame.onload = setPrint;
    hideFrame.style.position = "fixed";
    hideFrame.style.right = "0";
    hideFrame.style.bottom = "0";
    hideFrame.style.width = "0";
    hideFrame.style.height = "0";
    hideFrame.style.border = "0";
    const form =  await generateForm(orderNumber);
    //hideFrame.src = "../private/app/templates/PrintableForm.html";
    hideFrame.srcdoc = form;
    document.body.appendChild(hideFrame);
  }

  async function generateForm(orderNumber){

    const tableData = orderData[orderNumber].getElementsByTagName('td');
    console.log(tableData);

    let form = '<!DOCTYPE html>'+
                '<html lang="en">'+
                '<head>'+
                  '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
                  '<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
                  '<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'+
                  '<link rel="stylesheet" href="css/PrintableForm.css" type="text/css">'+
                  ''+
                '</head>'+
                  '<body>'+
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
                            '<p>' + tableData[4].innerHTML + '</p>'+
                  

                            '<label>Address:</label>'+
                            '<address>' + 
                              '<p>' + tableData[5].innerHTML + '</p>'+
                              '<p>' + tableData[6].innerHTML + '</p>'+
                              '<p>' + tableData[7].innerHTML + '</p>'+
                              '<p>' + tableData[8].innerHTML + '</p>'+
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
                              '<p>' + tableData[10].innerHTML + '</p>'+
                      
                      
                              '<label>Address:</label>'+
                              '<address>' + 
                                '<p>' + tableData[11].innerHTML + '</p>'+
                                '<p>' + tableData[12].innerHTML + '</p>'+
                                '<p>' + tableData[13].innerHTML + '</p>'+
                                '<p>' + tableData[14].innerHTML + '</p>'+
                              '</address>' +
                                            
                              '<label>Telephone:</label>'+
                              '<p>' + tableData[15].innerHTML + '</p>'+
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
                          '<p>' + tableData[4].innerHTML +'</p>'+
                  

                          '<label>Address:</label>'+
                          '<address>' + 
                            '<p>' + tableData[5].innerHTML + '</p>'+
                            '<p>' + tableData[6].innerHTML + '</p>'+
                            '<p>' + tableData[7].innerHTML + '</p>'+
                            '<p>' + tableData[8].innerHTML + '</p>'+
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
                          '<p>' + tableData[10].innerHTML + ' </p>'+
                      
                      
                          '<label>Address:</label>'+
                          '<address>' + 
                            '<p>' + tableData[11].innerHTML + '</p>'+
                            '<p>' + tableData[12].innerHTML + '</p>'+
                            '<p>' + tableData[13].innerHTML + '</p>'+
                            '<p>' + tableData[14].innerHTML + '</p>'+
                          '</address>' +
                                        
                          '<label>Telephone:</label>'+
                          '<p>' + tableData[15].innerHTML + '</p>'+
                        '</div>'+
                      '</div>'+
                  '</div>'+
                '</div>'+
              ''+
              '</body>'+
            '</html>'
      return form;
    
  }