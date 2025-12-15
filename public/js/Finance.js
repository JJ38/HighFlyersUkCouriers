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



console.log(selectableElements);

const PAGE_HEIGHT_MM = 297;
const MARGIN = 15;

const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - (MARGIN * 2); //(MARGIN * 2) for both top and bottom margin


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
        if (!el.isContentEditable) return;

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

    //paginateInvoiceRows(invoice);

    invoice.id = "invoice_clone";
    // invoice.style.zIndex = "2";
    // invoice.style.position = "absolute";
    // invoice.style.top = "15mm";
    // invoice.style.left = "15mm";

    // invoice.classList.add('pdf-render-target');

    const invoiceFormWrapper = document.getElementById('invoice_preview_wrapper');


    invoiceFormWrapper.appendChild(invoice);

    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));
    // await new Promise(resolve => setTimeout(resolve, 1000));

    await html2pdf().set(opt).from(invoice).save();

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

    const totalPriceTableData = createTableData(totalPrice);
    totalPriceTableData.classList = "relative";

    const deleteInvoiceOrderButton = createDeleteInvoiceOrderButton();
    addEventListenerToDeleteInvoiceOrderButton(deleteInvoiceOrderButton);

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


function addEventListenerToDeleteInvoiceOrderButton(deleteInvoiceOrderButton){

    if(deleteInvoiceOrderButton != null){

        deleteInvoiceOrderButton.addEventListener('click', () => {

            deleteInvoiceOrderButton.parentNode.parentNode.remove();
        });

    }

}

