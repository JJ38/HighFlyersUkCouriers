import { where, query, orderBy, collection} from "firebase/firestore";
import { fetchCustomerAccounts } from "/js/FormModel.js";
import { showNotification } from "/js/Notification.js";
import { getDocuments, db } from "/js/Firebase.js";
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
const invoiceNotesInput = document.getElementById('invoice_notes_input');
const invoicePayableToName = document.getElementById('invoice_payable_to_name');
const invoicePayableToCompany = document.getElementById('invoice_payable_to_company');
const invoiceHeading = document.getElementById('invoice_heading');


const accountSelect = document.getElementById('account_select');
const deliveryWeekInput = document.getElementById('delivery_week_input');
const fileNameInput = document.getElementById('file_name_input');

const autoFillInvoiceButton = document.getElementById('autofill_invoice_button');
const clearInvoiceButton = document.getElementById('clear_invoice_button');


console.log(selectableElements);

const PAGE_HEIGHT_PX = 1009; // 276mm * 3.78 (px per mm)


let invoiceOrders = [];
let pageBreaks = [];
const customerAccounts = new Map();

let selectedElement;
let isItemSelected;
let deliveryWeekValue;
let fileNameValue;
let accountSelectValue;


// Default export is a4 paper, portrait, using millimeters for units

init()
addEventListeners();
updateInvoicePreview();

async function init(){

    await getCustomerAccounts();
    console.log(customerAccounts);
}

function addEventListeners(){

    if(generateInvoiceButton != null){
        
        generateInvoiceButton.addEventListener('click', () => {
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

            const tableRow = createInputDataRow("", 0);
        
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

        if (!el.isContentEditable && !el.classList.contains("activeInput")){
            return;
        }

        if (el.textContent.trim() === '') {
            el.innerHTML = '';
        }
        console.log("rjoiufppijipfoes");
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

    if(deliveryWeekInput != null){

        deliveryWeekInput.addEventListener('input', (e) => {
            deliveryWeekValue = e.target.value;
            console.log(deliveryWeekValue);
        });

    }

    if(fileNameInput != null){

        fileNameInput.addEventListener('input', (e) => {
            fileNameValue = e.target.value;
            console.log(fileNameValue)
        });

    }

    if(accountSelect != null){

        accountSelect.addEventListener('change', (e) => {
            accountSelectValue = e.target.value;
            console.log(e.target.value)

        });

    }

    if(autoFillInvoiceButton != null){

        autoFillInvoiceButton.addEventListener('click', async () => {

            console.log("click");
            validateAutofillInputs();
            const orders = await fetchOrdersByAccountAndDeliveryWeek();

            if(orders === false){
                showNotification("Error!", "Error fetching orders");
                return;
            }

            addInvoiceOrders(orders);

        });

    }

    if(clearInvoiceButton != null){

        clearInvoiceButton.addEventListener('click', () => {

            const orderInputs = [...document.querySelectorAll('.inputRow')];

            invoiceOrders = [];

            selectableElements.forEach((element) => {
                element.innerText = "";
            });

            orderInputs.forEach((element) => {
                element.remove();
            });

            invoiceNotesInput.value = "";

            invoicePayableToName.innerText = "Kevin Brough";
            invoicePayableToCompany.innerText = "Highflyers U.K. Couriers";

            updateInvoiceTotal();
            updateInvoicePreview();

        });

    }

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

function validateAutofillInputs(){

    if(accountSelectValue == "" || accountSelectValue == null || accountSelectValue == undefined){
        showNotification("Error!", "Please select an account");
        return;
    }

    if(Number.isNaN(deliveryWeekValue)) {
        showNotification("Error!", "Delivery week is not a number");
        return;
    }

    if(deliveryWeekValue < 1 || deliveryWeekValue > 54){
        showNotification("Error!", "Delivery week must be greater than 0 and less than 54");
        return;
    }

    if(deliveryWeekValue == "" || deliveryWeekValue == null || deliveryWeekValue == undefined){
        showNotification("Error!", "Please enter a delivery week");
        return;
    }

    
}

async function fetchOrdersByAccountAndDeliveryWeek(){

    let username = customerAccounts.get(accountSelectValue)['username'];

    username = username.replaceAll('@placeholder.com', "");

    const q = query(
        collection(db, "Orders"), 
        orderBy('ID', 'desc'), 
        where("account", "in", [accountSelectValue, username]), 
        where("deliveryWeek", "==", parseInt(deliveryWeekValue)), 
        where("payment", "==", "Account")
    );

    const documents = await getDocuments(q);

    if(documents === false){
        return false;
    }

    return documents.docs;

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

    menu.style.top = `${window.scrollY + rect.top - menuHeight - 5}px`;
    menu.style.left = `${window.scrollX + rect.right - menuWidth}px`;

    showOptionsMenu();

}

function updateInvoicePreview(){

    const invoice = removeControlUI(invoiceForm);
    invoicePreview.innerHTML = invoice.innerHTML;

}


async function downloadPDF() {

    let filename = "invoice";

    if(fileNameValue != "" && fileNameValue != undefined && fileNameValue != null){
        filename = fileNameValue.replaceAll(".pdf", "");
    }


    
    const renderRoot = document.createElement('div');

    renderRoot.style.position = 'fixed';
    renderRoot.style.left = '0';
    renderRoot.style.top = '0';
    renderRoot.style.width = '210mm';
    renderRoot.style.visibility = 'hidden';
    renderRoot.style.background = 'white';

    document.body.appendChild(renderRoot);

    
    const opt = {
        margin:       15,
        filename:     filename + '.pdf',
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  {  
            scale: 2,
            scrollX: 0,
            scrollY: 0,
        },   // Higher = better quality
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['tr']
        },
    };


    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => requestAnimationFrame(r));



    const invoicePreviewClone = invoicePreview.cloneNode(true);

    renderRoot.appendChild(invoicePreviewClone);

    // Force layout
    renderRoot.offsetHeight;

    // Insert page breaks AFTER layout
    insertInvoicePageBreaks(invoicePreviewClone);

    // Render
    html2pdf().set(opt).from(invoicePreviewClone).save();

    // Cleanup
    document.body.removeChild(renderRoot);

    // await html2pdf().set(opt).from(invoicePreview).save();

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


    // const inputs = invoice.querySelectorAll('input');
    // inputs.forEach((input) => {
    //     const p = document.createElement('p');
    //     p.innerText = input.value || '\u00A0';
    //     input.parentNode.appendChild(p);
    //     input.remove();
    // });

    // const textareas = invoice.querySelectorAll('textarea');
    // textareas.forEach((textarea) => {
    //     const p = document.createElement('p');
    //     p.innerText = textarea.value || '\u00A0';
    //     textarea.parentNode.appendChild(p);

    //     textarea.remove();
    // });

    invoice.querySelectorAll('input, textarea').forEach(el => {
        const p = document.createElement('p');
        const style = window.getComputedStyle(el);

        p.innerText = el.value || '\u00A0';
        p.style.font = style.font;
        p.style.lineHeight = style.lineHeight;
        p.style.whiteSpace = 'pre-wrap';

        el.parentNode.insertBefore(p, el);
        el.remove();
    });

    invoice.querySelectorAll('.tableRow').forEach(row => {
        row.style.height = `${row.offsetHeight}px`;
    });



    return invoice;

}

function createInputDataRow(description, unitPrice){

    const tableRow = document.createElement('div');
    tableRow.classList = "tableRow inputRow";

    const descriptionInput = document.createElement('input');
    descriptionInput.type = "text";
    descriptionInput.classList = "activeInput";
    descriptionInput.value = description;

    
    const quantityInput = document.createElement('input');
    quantityInput.type = "number";
    quantityInput.classList = "activeInput";
    quantityInput.value = 1;



    const priceContainer = document.createElement('div');
    priceContainer.classList = "inputLabelWrapper";

    const priceInput = document.createElement('input');
    priceInput.type = "number";
    priceInput.classList = "activeInput";
    priceInput.value = unitPrice;

    const poundSymbol = document.createElement('p');
    poundSymbol.textContent = "£";

    priceContainer.appendChild(poundSymbol);
    priceContainer.appendChild(priceInput);

    
    const totalPrice = document.createElement('p');
    totalPrice.textContent = "£";
    totalPrice.classList = "relative"

    tableRow.appendChild(createWrapper(descriptionInput));
    tableRow.appendChild(createWrapper(quantityInput));
    tableRow.appendChild(priceContainer);

    // tableRow.appendChild(descriptionInput);
    // tableRow.appendChild(quantityInput);
    // tableRow.appendChild(priceContainer);

    const order = {
        quantity: 1,
        unitPrice: unitPrice
    }

    invoiceOrders.push(order);

    addPriceCalculationListeners(quantityInput, priceInput, totalPrice, order);


    const totalPriceWrapper= createWrapper(totalPrice);
    totalPriceWrapper.classList = "relative";

    const deleteInvoiceOrderButton = createDeleteInvoiceOrderButton();
    addEventListenerToDeleteInvoiceOrderButton(deleteInvoiceOrderButton, order);

    totalPriceWrapper.appendChild(deleteInvoiceOrderButton);

    tableRow.appendChild(totalPriceWrapper);

    deleteInvoiceOrderButton.classList = "deleteInvoiceOrderButton";

    // tableRow.appendChild(deleteInvoiceOrderButton);

    updateInvoicePricing(quantityInput, priceInput, totalPrice, order);

    return tableRow;

}   

function createWrapper(element){

    const wrapper = document.createElement('div');
    wrapper.appendChild(element);

    return wrapper;

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

}

async function getCustomerAccounts(){

  const customerAccountDocuments = await fetchCustomerAccounts(); //returns list of docs

  if(customerAccountDocuments == false){
    return;
  }

  for(let i = 0; i < customerAccountDocuments.length; i++){

    const customerDocData = customerAccountDocuments[i].data();
    console.log(customerDocData);

    let customerUsername = customerDocData['username'] == undefined ? "" : customerDocData['username'];

    if(customerUsername != ""){
        customerUsername = customerUsername.replaceAll("@placeholder.com", "");
    }

    customerAccounts.set(customerAccountDocuments[i].id, customerDocData);
    accountSelect.appendChild(createOption(customerAccountDocuments[i].id, customerUsername));

  }


}

function createOption(value, text){

    const option = document.createElement('option');
    option.value = value;
    option.innerText = text;

    return option;

}

function addInvoiceOrders(orders){
   
    for(let i = 0; i < orders.length; i++){

        const orderData = orders[i].data();
        console.log(orderData);
        const description = "#" + orderData['ID'] + " - " + orderData['quantity'] + "x " + orderData['animalType'];
        const quantity = 1;
        const unitPrice = parseInt(orderData['price']);

        invoiceOrdersTable.appendChild(createInputDataRow(description, unitPrice));
    }

    updateInvoiceTotal();
    updateInvoicePreview();

}

function insertInvoicePageBreaks(){

    const invoiceHeading = invoicePreview.querySelector('#invoice_heading');
    const tableHeader = invoicePreview.querySelector('#table_header');

    const invoiceOrders = [...invoicePreview.querySelectorAll('.inputRow')];

    let currentPageHeight = 0;

    currentPageHeight = invoiceHeading.offsetHeight + 1;
    currentPageHeight += tableHeader.offsetHeight;

    console.log(invoiceHeading.offsetHeight);
    console.log(tableHeader.offsetHeight);

    console.log(currentPageHeight);

    console.log(invoiceOrders);
    console.log(invoiceOrders.length);


    for(let i = 0; i < invoiceOrders.length; i++){

        const orderHeight = invoiceOrders[i].offsetHeight;

        console.log(orderHeight);
        console.log(invoiceOrders[i]);
        console.log(currentPageHeight);

        if((currentPageHeight + orderHeight) < PAGE_HEIGHT_PX){

            currentPageHeight += orderHeight;

        }else{

            const pageBreak = document.createElement('div');
            pageBreak.classList = "pageBreak";
            currentPageHeight = orderHeight;
            
            invoiceOrders[i].parentNode.insertBefore(
                pageBreak,
                invoiceOrders[i]
            );
            console.log("inserted page break");
            pageBreaks.push(pageBreak);
        }

    }

}

function removePageBreaks(){

    pageBreaks.forEach(element => {
        element.remove();
    });

    pageBreaks = [];

}