// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

import { jsPDF } from "jspdf";


const generateInvoiceButton = document.getElementById('generate_invoice_button');

// Default export is a4 paper, portrait, using millimeters for units

addEventListeners();

function addEventListeners(){

    if(generateInvoiceButton != null){
        
        generateInvoiceButton.addEventListener('click', () => {
            // const invoiceHTMLString = getInvoiceHTMLString();
            // generatePdfFromHtmlString(invoiceHTMLString);
            downloadPDF();
        });
    }

}


function getInvoiceHTMLString(){

    const htmlString = invoiceBoilerPlate;

    return htmlString;

}

function downloadPDF() {
    const element = document.getElementById('invoice_preview');

    const opt = {
        margin:       15,
        filename:     'invoice.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2, dpi: 300 },   // Higher = better quality
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
            mode: ['css', 'legacy']
        },
    };

    html2pdf().set(opt).from(element).save();
}



async function generatePdfFromHtmlString(htmlString) {



    // 1. Build container
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "0";
    container.style.top = "0";
    container.style.background = "white";
    container.style.color = "black";
    container.innerHTML = htmlString;


    // 2. Force layout & wait for fonts
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(r));

    const doc = new jsPDF("p", "px", "a4");

    await doc.html(container, {
        x: 0,
        y: 0,
        // width: 210, // mm a4 width
        html2canvas: { 
            scale: 9/16, //to compensate for the pdf being portrait
            useCORS: true,
            backgroundColor: null
        }
    });

    doc.save("invoice.pdf");

}


const invoiceStyles = 

'*{'+
'margin: 0px;'+
'padding: 0px;'+
'box-sizing: border-box;'+
'word-break: normal;'+
'}'+

'html,'+
'body {'+

'font-family: \'inter\', sans-serif;'+
'font-style: normal;'+
'font-weight: 300;'+
'font-size: 1em;'+
'line-height: 2em;'+
'padding: 25px;'+

'}'+

'p, td{'+
'color: #525252;'+
'font-weight: 300;'+
'}'+

'td:first-child{'+
'font-weight: 400;'+
'color: black;'+
'}'+

'.row{'+
'display: flex;'+
'}'+

'.submittedOnWrapper, .total{'+
'color: #ef459c;'+
'}'+

'.creationDate{'+
'padding-left: 5px;'+
'}'+

'.alignItemsCenter{'+
'align-items: center;'+
'}'+

'.spaceBetween{'+
'justify-content: space-between;'+
'}'+

'.headerrow{'+
'text-align: left;'+
'padding: 5px;'+
'}'+

'.invoiceDetailsTable{'+
'border-spacing: 0px;'+
'border-collapse: separate;'+
'width: 100%;'+
'}'+

'tbody{'+
'padding: 0px;'+
'margin: 0px;'+
'}'+

'.invoiceDetailsWrapper{'+
'width: fit-content;'+
'}'+

'.total{'+
'margin-right: 0;'+
'}'+

'th{'+
'margin-right: 10px;'+
'font-weight: 600;'+
'font-size: 1.1em;'+
'}'+

'h1, h2, th, .orderLabel{'+
'color: #3333a1;'+
'}'+

'h4{'+
'color: black;'+
'}'+

'td, th{'+
'padding-top: 10px;'+
'padding-bottom: 10px;'+
'}'+

'tr{'+
'margin-top: 5px;'+
'}'+

'.dataRow:nth-child(even){'+
'background-color: #eeeeee;'+
'}'+

'hr{'+
'background-color: #8f8f8f;'+
'border-style: none;'+
'height: 1px;'+
'}'+

'.bold{'+
'font-weight: 600;'+

'}'+

'.margin-bottom-20px{'+
'margin-bottom: 20px;'+
'}'

const invoiceBoilerPlate = 
'<html lang="en">'+
'<head>'+
'<meta charset="UTF-8">'+
'<meta name="viewport" content="width=device-width, initial-scale=1.0">'+
'<link rel="stylesheet" href="css\Invoice.css" type="text/css">'+
'<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">'+
'<title>Invoice</title>'+
'<style>'+
    invoiceStyles +
'</style>'+
'</head>'+

'<body>'+
'<div class="margin-bottom-20px">'+
'<h2>Highflyers U.K. Couriers</h2>'+
'<p>Unit 2, Thomas Street</p>'+
'<p>Congleton, CW12 1QU</p>'+
'<p>07887781089</p>'+
'</div>'+

'<h1>Invoice</h1>'+

'<div class="row margin-bottom-20px submittedOnWrapper">'+
'<h3>Submitted on &nbsp;</h3>'+
'<h3 id="submitted_on_date">20.11.2025</h3>'+
'</div>'+

'<div class="row spaceBetween margin-bottom-20px">'+

'<div id="invoice_for_wrapper">'+
'<h4>Invoice for</h4>'+
'<p id="name">Lee Chapman</p>'+
'<p id="address_line_1">90 Wiggs Farm Road</p>'+
'<p id="address_line_2">Ouston</p>'+
'<p id="address_line_3">Nothampton</p>'+
'<p id="postcode">NN56HZ</p>'+
'<p id="phonenumber">07123456789</p>'+
'<p id="email">lee@itsabirdthing.co.uk</p>'+
'</div>'+

'<div id="payable_to_wrapper">'+
'<h4>Payable to</h4>'+
'<p>Kevin Brough</p>'+
'<p>Highflyers U.K. Couriers</p>'+
'</div>'+

'<div id="invoice_metadata_wrapper">'+
'<h4>Invoice #</h4>'+
'<p id="reference">HF0051 - 84 Week 46</p>'+
'<div class="row alignItemsCenter">'+
'<h4>Date</h4>'+
'<p id="creation_date" class="creationDate">11/11/2025</p>'+
'</div>'+
'</div>'+

'</div>'+

'<hr>'+

'<table class="invoiceDetailsTable">'+

'<tr class="headerRow">'+

'<th>Description</th>'+
'<th>Qty</th>'+
'<th>Unit Price</th>'+
'<th>Total Price</th>'+

'</tr>'+

'<tr class="dataRow">'+

'<td>12x Pigeons - Young birds</td>'+
'<td>1</td>'+
'<td>£60</td>'+
'<td>£60</td>'+

'</tr>'+

'<tr class="dataRow">'+

'<td>12x Pigeons - Young birds</td>'+
'<td>1</td>'+
'<td>£60</td>'+
'<td>£60</td>'+

'</tr>'+

'<tr class="dataRow">'+

'<td>12x Pigeons - Young birds</td>'+
'<td>1</td>'+
'<td>£60</td>'+
'<td>£60</td>'+

'</tr>'+

'<tr class="dataRow">'+

'<td>12x Pigeons - Young birds</td>'+
'<td>1</td>'+
'<td>£60</td>'+
'<td>£60</td>'+

'</tr>'+

'<tr>'+
'<td><hr></td>'+
'<td><hr></td>'+
'<td><hr></td>'+
'<td><hr></td>'+
'</tr>'+

'<tr>'+

'<td>'+
'<div>'+
'<p>Notes:</p>'+
'<p id="invoice_notes"></p>'+
'</div>'+
'</td>'+
'<td></td>'+
'<td>'+
'<p class="orderLabel">Subtotal</p>'+
'</td>'+
'<td>'+
'<h4 id="subtotal">£240</h4>'+
'</td>'+

'</tr>'+

'<tr>'+

'<td></td>'+
'<td></td>'+
'<td>'+
'<p class="orderLabel">Adjustments</p>'+
'</td>'+
'<td >'+
'<h4 id="adjustments" class="">£0</h4>'+
'</td>'+

'</tr>'+

'<tr>'+

'<td></td>'+
'<td></td>'+
'<td></td>'+
'<td>'+
'<h3 id="total" class="total">'+
'£240'+
'</h3>'+
'</td>'+

'</tr>'+

'</table>'+



'</body>'+
'</html>'