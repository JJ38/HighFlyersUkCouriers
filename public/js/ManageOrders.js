
const printButtons = document.querySelectorAll('.print');
const orderData = document.querySelectorAll('tr');

for(let i = 0; i < printButtons.length; i++){
    printButtons[i].addEventListener('click', e => {
        printPage(i + 1);
    });
}

// const scrollableArea = document.querySelector('.orderdata');

// scrollableArea.scrollTo({top: 0, left: -scrollableArea.scrollWidth});


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

  function printPage(orderNumber) {
    const hideFrame = document.createElement("iframe");
    hideFrame.onload = setPrint;
    hideFrame.style.position = "fixed";
    hideFrame.style.right = "0";
    hideFrame.style.bottom = "0";
    hideFrame.style.width = "0";
    hideFrame.style.height = "0";
    hideFrame.style.border = "0";
    const form = generateForm(orderNumber);
    //hideFrame.src = "../private/app/templates/PrintableForm.html";
    hideFrame.srcdoc = form;
    document.body.appendChild(hideFrame);
  }

  function generateForm(orderNumber){
    console.log();
    console.log(orderData[orderNumber]);

    const tableData = orderData[orderNumber].getElementsByTagName('td');

    console.log(tableData[0].innerHTML);


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
                            '<p> TODO </p>'+
                  

                            '<label>Address:</label>'+
                            '<address>' + 
                              '<p>' + tableData[5].innerHTML + '</p>'+
                              '<p>' + tableData[6].innerHTML + '</p>'+
                              '<p>' + tableData[7].innerHTML + '</p>'+
                              '<p>' + tableData[8].innerHTML + '</p>'+
                            '</address>' +
                        
                        
                          '<label>Telephone:</label>'+
                          '<p>' + tableData[4].innerHTML + '</p>'+
                          
                        
                          '</div>'+
                        '</div>'+
                        '<div class="wrapper">'+
                          '<h3>'+
                           'Deliver to:'+
                          '</h3>'+
                            '<div class="infowrapper">'+
                              '<label>Name:</label>'+
                              '<p> TODO </p>'+
                      
                      
                              '<label>Address:</label>'+
                              '<address>' + 
                                '<p>' + tableData[10].innerHTML + '</p>'+
                                '<p>' + tableData[11].innerHTML + '</p>'+
                                '<p>' + tableData[12].innerHTML + '</p>'+
                                '<p>' + tableData[13].innerHTML + '</p>'+
                              '</address>' +
                                            
                              '<label>Telephone:</label>'+
                              '<p>' + tableData[14].innerHTML + '</p>'+
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
                          '<p> TODO </p>'+
                  

                          '<label>Address:</label>'+
                          '<address>' + 
                            '<p>' + tableData[5].innerHTML + '</p>'+
                            '<p>' + tableData[6].innerHTML + '</p>'+
                            '<p>' + tableData[7].innerHTML + '</p>'+
                            '<p>' + tableData[8].innerHTML + '</p>'+
                          '</address>' +
                    
                    
                          '<label>Telephone:</label>'+
                          '<p>' + tableData[4].innerHTML + '</p>'+
                      
                        '</div>'+ 
                      '</div>'+
                      '<div class="wrapper">'+
                        '<h3>'+
                        'Deliver to:'+
                        '</h3>'+
                        '<div class="infowrapper">'+
                          '<label>Name:</label>'+
                          '<p> TODO </p>'+
                      
                      
                          '<label>Address:</label>'+
                          '<address>' + 
                            '<p>' + tableData[10].innerHTML + '</p>'+
                            '<p>' + tableData[11].innerHTML + '</p>'+
                            '<p>' + tableData[12].innerHTML + '</p>'+
                            '<p>' + tableData[13].innerHTML + '</p>'+
                          '</address>' +
                                        
                          '<label>Telephone:</label>'+
                          '<p>' + tableData[14].innerHTML + '</p>'+
                        '</div>'+
                      '</div>'+
                  '</div>'+
                '</div>'+
              ''+
              '</body>'+
            '</html>'
      return form;
    
  }