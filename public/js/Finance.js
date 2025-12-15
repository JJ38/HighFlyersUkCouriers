// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const generateInvoiceButton = document.getElementById('generate_invoice_button');

const menu = document.getElementById('floating_options_menu');
const deleteOptionsMenuButton = document.getElementById('delete_options_menu_button');
const addOptionsMenuButton = document.getElementById('add_options_menu_button');
const selectableElementGroups = document.querySelectorAll('.metadataGroup');
const selectableElements = [...document.querySelectorAll('[contenteditable]')];
const invoiceOrdersTable = document.getElementById('invoice_orders_table')
const addInvoiceOrderButton = document.getElementById('add_invoice_order_button');
const invoiceForm = document.getElementById('invoice_form');
const invoicePreview = document.getElementById('invoice_preview');
const invoiceTotal = document.getElementById('total');


console.log(selectableElements);

const PAGE_HEIGHT_MM = 297;
const MARGIN = 15;
const invoiceOrders = [];

let selectedElement;
let isItemSelected;

// Default export is a4 paper, portrait, using millimeters for units

addEventListeners();

updateInvoicePreview();


function addEventListeners(){

    if(generateInvoiceButton != null){
        
        generateInvoiceButton.addEventListener('click', () => {
            // const invoiceHTMLString = getInvoiceHTMLString();
            // generatePdfFromHtmlString(invoiceHTMLString);
            downloadPDF();
        });
    }

    if(deleteOptionsMenuButton != null){

        deleteOptionsMenuButton.addEventListener('click', () => {

            if(selectedElement != null && isItemSelected){
                selectedElement.remove();
                hideOptionsMenu();
                updateInvoicePreview(); 
            }

        });

    }

    if(addOptionsMenuButton != null){

        addOptionsMenuButton.addEventListener('click', () => {

            if(selectedElement != null && isItemSelected){
                const element = document.createElement('p');
                element.contentEditable = true;

                addStopPropagationListener(element)
                selectableElements.push(element);
                selectedElement.appendChild(element);

                selectEditableElement(element);
                hideOptionsMenu();
                updateInvoicePreview();

            }

        });

    }

    if(addInvoiceOrderButton != null){

        addInvoiceOrderButton.addEventListener('click', () => {

            const tableRow = createInputDataRow();
        
            invoiceOrdersTable.appendChild(tableRow);
            updateInvoicePreview();

        });

    }


    document.addEventListener('focusin', (e) => {
        const editable = e.target.closest('[contenteditable]');
        if (!editable) return;
        hideAddOptionsButton();
        showDeleteOptionsButton();
        selectEditableElement(editable);
    });

    document.addEventListener('click', (e) => {

        //if clicks away from selectable element or menu
        if (!e.target.closest('[contenteditable]') && !e.target.closest('#floating_options_menu')) {

            isItemSelected = false;

            if(selectedElement != undefined){
                selectedElement.classList.remove('selectedElement');  
            }

            hideOptionsMenu();
        }
    });

    document.addEventListener('input', e => {

        const el = e.target;
        console.log(el.classList.contains("activeInput"));


        if (!el.isContentEditable && !el.classList.contains("activeInput")){
            console.log('!el.isContentEditable');
            return;
        }

        if (el.textContent.trim() === '') {
            el.innerHTML = '';
        }
        updateInvoicePreview();
    });

    selectableElementGroups.forEach((element) => {

        element.addEventListener('click', (e) => {
            showAddOptionsButton();
            hideDeleteOptionsButton();
            e.stopPropagation();
            const title = e.target;
            const groupElement = title.parentNode;
            selectEditableElement(groupElement);
        });

    });

    
    selectableElements.forEach((element) => {

        addStopPropagationListener(element);

    });

}

function addStopPropagationListener(element){

    element.addEventListener('click', (e) => {
        e.stopPropagation();
    });

}

function showAddOptionsButton(){
    addOptionsMenuButton.classList.remove('hidden');
}

function hideAddOptionsButton(){
    addOptionsMenuButton.classList.add('hidden');
}

function showDeleteOptionsButton(){
    deleteOptionsMenuButton.classList.remove('hidden');
}

function hideDeleteOptionsButton(){
    deleteOptionsMenuButton.classList.add('hidden');
}

function hideOptionsMenu(){
    menu.style.zIndex = '-1';
}

function showOptionsMenu(){
    menu.style.zIndex = '1000';
}

function selectEditableElement(element){

    console.log(element);

    if(element == null){
        return;
    }

    if(selectedElement != null){
        selectedElement.classList.remove('selectedElement');
    }

    selectedElement = element;
    isItemSelected = true;

    element.classList.add('selectedElement');

    const rect = element.getBoundingClientRect();

    const menuDimensions = menu.getBoundingClientRect();
    const menuHeight = menuDimensions.height;
    const menuWidth = menuDimensions.width;

    console.log(menuHeight);

    menu.style.top = `${window.scrollY + rect.top - menuHeight - 5}px`;
    menu.style.left = `${window.scrollX + rect.right - menuWidth}px`;

    showOptionsMenu();

}

function updateInvoicePreview(){

    console.log('updateInvoicePreview');
    const invoice = removeControlUI(invoiceForm);
    invoicePreview.innerHTML = invoice.innerHTML;

}


async function downloadPDF() {
    
    const opt = {
        margin:       MARGIN,
        filename:     'invoice.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 2 },   // Higher = better quality
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['tr']
        },
    };


    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
    // await new Promise(resolve => setTimeout(resolve, 1000));

    await html2pdf().set(opt).from(invoicePreview).save();

    // invoice.remove();
}


function removeControlUI(invoicePreview){

    const invoice = invoicePreview.cloneNode(true);

    const deleteInvoiceOrderButtons = invoice.querySelectorAll('.deleteInvoiceOrderButton');
    deleteInvoiceOrderButtons.forEach((button) => {
        button.remove();
    });


    const addInvoiceOrderButtonRow = invoice.querySelector('#add_invoice_order_button');
    addInvoiceOrderButtonRow.remove();


    const addInvoiceOrderInputs = invoice.querySelectorAll('.activeInput');
    addInvoiceOrderInputs.forEach((input) => {
        input.classList.remove('activeInput');
    });


    const selectableElements = invoice.querySelectorAll('[contenteditable]');
    selectableElements.forEach((element) => {
        element.contentEditable = "false";
        element.removeAttribute('data-placeholder');
    });


    const metadataGroups = invoice.querySelectorAll('.metadataGroup');
    metadataGroups.forEach((element) => {
        element.classList.remove('metadataGroup');
    });


    const inputs = invoice.querySelectorAll('input');
    inputs.forEach((input) => {
        const p = document.createElement('p');
        p.innerText = input.value
        input.parentNode.appendChild(p);

        input.remove();
    });

    const textareas = invoice.querySelectorAll('textarea');
    textareas.forEach((textarea) => {
        const p = document.createElement('p');
        p.innerText = textarea.value
        textarea.parentNode.appendChild(p);

        textarea.remove();
    });


    return invoice;

}

function createInputDataRow(){

    const tableRow = document.createElement('tr');
    tableRow.classList = "dataRow inputRow";

    const descriptionInput = document.createElement('input');
    descriptionInput.type = "text";
    descriptionInput.classList = "activeInput";

    
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";
    quantityInput.classList = "activeInput";
    quantityInput.value = 1;



    const priceContainer = document.createElement('div');
    priceContainer.classList = "inputLabelWrapper";

    const priceInput = document.createElement('input');
    priceInput.type = "number";
    priceInput.classList = "activeInput";

    const poundSymbol = document.createElement('p');
    poundSymbol.textContent = "£";

    priceContainer.appendChild(poundSymbol);
    priceContainer.appendChild(priceInput);

    
    const totalPrice = document.createElement('p');
    totalPrice.textContent = "£";

    tableRow.appendChild(createTableData(descriptionInput));
    tableRow.appendChild(createTableData(quantityInput));
    tableRow.appendChild(createTableData(priceContainer));

    const order = {
        quantity: 0,
        unitPrice: 0
    }

    invoiceOrders.push(order);
    console.log(invoiceOrders);

    addPriceCalculationListeners(quantityInput, priceInput, totalPrice, order);


    const totalPriceTableData = createTableData(totalPrice);
    totalPriceTableData.classList = "relative";

    const deleteInvoiceOrderButton = createDeleteInvoiceOrderButton();
    addEventListenerToDeleteInvoiceOrderButton(deleteInvoiceOrderButton, order);

    totalPriceTableData.appendChild(deleteInvoiceOrderButton);

    tableRow.appendChild(totalPriceTableData);

    deleteInvoiceOrderButton.classList = "deleteInvoiceOrderButton";

    // tableRow.appendChild(deleteInvoiceOrderButton);

    return tableRow;

}   

function createTableData(data){

    const tableData = document.createElement('td');
    tableData.appendChild(data);

    return tableData;

}

function createDeleteInvoiceOrderButton(){

    const deleteInvoiceOrderButton = document.createElement('div');
    deleteInvoiceOrderButton.classList = "deleteInvoiceOrderButton";

    const deleteIcon = document.createElement('span');
    deleteIcon.innerHTML = "delete"
    deleteIcon.classList = "material-symbols-outlined deleteIcon"

    deleteInvoiceOrderButton.appendChild(deleteIcon);

    return deleteInvoiceOrderButton;

}


function addEventListenerToDeleteInvoiceOrderButton(deleteInvoiceOrderButton, order){

    if(deleteInvoiceOrderButton != null){

        deleteInvoiceOrderButton.addEventListener('click', () => {

            deleteInvoiceOrderButton.parentNode.parentNode.remove();

            const index = invoiceOrders.indexOf(order);
            if (index !== -1) {
                invoiceOrders.splice(index, 1);
            }
            console.log(invoiceOrders);
            updateInvoiceTotal();
            updateInvoicePreview();
        });

    }

}

function addPriceCalculationListeners(quantityInput, priceInput, totalPriceElement, order){

    const events = ['change', 'input'];

    events.forEach((eventName) => {

        quantityInput.addEventListener(eventName, () => {

            updateInvoicePricing(quantityInput, priceInput, totalPriceElement, order);
            updateInvoicePreview();

        });

    });

    events.forEach((eventName) => {

        priceInput.addEventListener(eventName, () => {

            updateInvoicePricing(quantityInput, priceInput, totalPriceElement, order);
            updateInvoicePreview();

        });
        
    });
    

}


function updateInvoicePricing(quantityInput, priceInput, totalPriceElement, order){
    
    const quantity = parseInt(quantityInput.value);
    const unitPrice = parseInt(priceInput.value);

    order.quantity = quantity;
    order.unitPrice = unitPrice;

    updateInvoiceTotal();


    if(Number.isNaN(quantity) || Number.isNaN(unitPrice)){
        totalPriceElement.innerText = "N/A";
        return;
    }

    totalPriceElement.innerText = "£" + (quantity * unitPrice);

}

function updateInvoiceTotal(){

    let total = 0;

    for(let i = 0; i < invoiceOrders.length; i++){

        const orderTotal = invoiceOrders[i].quantity * invoiceOrders[i].unitPrice;

        if(!Number.isNaN(orderTotal)){
            total += orderTotal;
        }

    }

    invoiceTotal.innerText = total;
    console.log("set invoice total to: " + total);

}

