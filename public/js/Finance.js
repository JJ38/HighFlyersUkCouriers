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

console.log(selectableElements);

let selectedElement;
let isItemSelected;


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

    if(deleteOptionsMenuButton != null){

        deleteOptionsMenuButton.addEventListener('click', () => {

            if(selectedElement != null && isItemSelected){
                selectedElement.remove();
                hideOptionsMenu();
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
            }

        });

    }

    if(addInvoiceOrderButton != null){

        addInvoiceOrderButton.addEventListener('click', () => {

            const tableRow = createInputDataRow();
            invoiceOrdersTable.appendChild(tableRow);

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

function getInvoiceHTMLString(){

    const htmlString = invoiceBoilerPlateTop + invoiceOrdersHTML + invoiceBoilerPlateBottom;

    return htmlString;

}

function downloadPDF() {
    
    const element = document.getElementById('invoice_preview');

    const opt = {
        margin:       15,
        filename:     'invoice.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 5, dpi: 300 },   // Higher = better quality
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

function createInputDataRow(){

    const tableRow = document.createElement('tr');
    tableRow.classList = "dataRow inputRow";

    const descriptionInput = document.createElement('input');
    descriptionInput.type = "text";

    
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";



    const priceContainer = document.createElement('div');
    priceContainer.classList = "inputLabelWrapper";

    const priceInput = document.createElement('input');
    priceInput.type = "number";

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



    // const deleteInvoiceOrderButtonTableData = createTableData(deleteInvoiceOrderButton);
    deleteInvoiceOrderButton.classList = "deleteInvoiceOrderButtonTableData";

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

