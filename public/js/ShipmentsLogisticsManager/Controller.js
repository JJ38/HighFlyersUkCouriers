import { db, getDocuments, filterSearch } from "/js/Firebase.js";
import { query, collection, limit, orderBy } from "firebase/firestore";
import { showNotification } from "/js/Notification.js"
import { createStopsWrapper, createStopAddress, createOption, createAddStopButton, createStopCard, createUnassignedOrdersTableCard, createUnassignedOrdersButton, createTableOrderCard, createRunCard } from "/js/ShipmentsLogisticsManager/Components.js"
import { createLoader, createEditButton, createUnassignedStopCardClickableElement, createAddRunButton, createButtonWrapper, createDeleteStopButton, createShipmentOptions, createOpenLockIcon, createLockIcon, createDragDetectionZone, createStopLockButton, createStopMetaData, createAddressSuggestionCard, createStopLabel } from "./Components";
import { splitRun, fetchCoordinatesForUpdatedRunSettings, updateRunSettings, calculateFuelCost, fetchFuelSettings, convertStopNumberToLetter, updateStopAddress, parseAddress, fetchStopCoordinates, fetchSuggestionPlace, fetchAutocompleteAddress, doesStopHaveCoordinates, calculateRoute, addRunToShipment, removeStopsFromShipment, selectRun, fetchRunsInShipment, toggleStopLock, updateStopNumberInRun, removeStopDataFromStop, mergeStopsWithOrderData, getRunStopsOrderData, generateShipment, parseRunInfo, updateRun, assignStopsToRun, sortAlphabetically, deleteShipmentDocument, fetchShipment, removeRunFromShipment, assignStopsToShipment, fetchRun } from "./Model";
import { MarkerClusterer } from "@googlemaps/markerclusterer";


let GoogleAdvancedMarkerElement;
let GooglePinElement;
let GoogleAutocomplete;
let GoogleMap;
let GoogleGeometry;


const ADDRESS_TYPE = {

  ACTIVE: true,
  OPPOSING: false,

}


const unassignedOrdersContainer = document.getElementById('unassigned_orders_details');
const unassignedOrdersCardWrapper = document.getElementById('unassigned_orders_card_wrapper');
const unassignedOrderTableBody = document.getElementById('unassigned_orders_table_body');

const addStopButtonWrapper = document.getElementById('add_stop_button_wrapper');

const createShipmentWidget = document.getElementById("create_shipment_widget");
const shipmentDeliveryWeekInput = document.getElementById('shipment_delivery_week');
const shipmentTypeInput = document.getElementById('shipment_run_type');
const shipmentNameInput = document.getElementById('shipment_name');
const cancelCreateShipmentButton = document.getElementById("cancel_create_shipment");
const saveCreateShipmentButton = document.getElementById("save_create_shipment");

const deleteShipmentWidget = document.getElementById("delete_shipment_widget");
const cancelDeleteShipmentButton = document.getElementById("cancel_delete_shipment");
const confirmDeleteShipmentButton = document.getElementById("confirm_delete_shipment");
const selectDeleteShipment = document.getElementById('select_delete_shipment');

const assignStopsWidget = document.getElementById('assign_stops_widget');
const selectAssignStopsRun = document.getElementById('select_assign_stops_run');
const cancelAssignStopsWidgetButton = document.getElementById('cancel_assign_stops_button');
const assignStopsWidgetButton = document.getElementById('assign_stops_widget_button');

const addStopsWidget = document.getElementById('add_stops_widget');
const selectAddStopsRun = document.getElementById('select_add_stops_run');
const cancelAddStopsWidgetButton = document.getElementById('cancel_add_stops_button');
const addStopsWidgetButton = document.getElementById('add_stops_widget_button');

const removeStopsWidget = document.getElementById('remove_stops_widget');
const cancelRemoveStopsWidgetButton = document.getElementById('cancel_remove_stops_button');
const removeStopsWidgetButton = document.getElementById('remove_stops_widget_button');

const addRunWidget = document.getElementById('add_run_widget');
const cancelAddRunWidgetButton = document.getElementById('cancel_add_run_button');
const addRunWidgetButton = document.getElementById('add_run_widget_button');
const addRunNameInput = document.getElementById('add_run_name_input');

const runCardList = document.getElementById("runCardList");
const selectedShipment = document.getElementById('select_shipment');

const selectedRunView = document.getElementById('selected_run_view');
const runStopsContainer = document.getElementById('run_stops_container');
const runOptionsContainer = document.getElementById('run_options_container');
const addRunDetailsContainer = document.getElementById('add_run_details');
const runInfoWrapper = document.getElementById('run_info_wrapper');

const manageTabButton = document.getElementById('manage_tab_button');
const optionTabButton = document.getElementById('option_tab_button');

const removeRunButton = document.getElementById('remove_run_button');
const removeRunWidget = document.getElementById('remove_run_widget');
const calculateRouteButton = document.getElementById('calculate_route_button');
const calculateRouteButtonWrapper = document.getElementById('calculate_route_button_wrapper');
const updateRunSettingsButton = document.getElementById('update_run_settings_button');
const splitRunSelect = document.getElementById('split_run_select');
const splitRunSettingsButton = document.getElementById('split_run_settings_button');

const validateAddressWidget = document.getElementById('validate_address_widget');
const validateAddressAutocompleteInput = document.getElementById('validate_address_autocomplete_input');
const validateAddressCancelButton = document.getElementById('cancel_validate_address_button');
const validateAddressButton = document.getElementById('validate_address_button');
const autocompleteLoader = document.getElementById('autocomplete_loader');
const autocompleteResults = document.getElementById('autocomplete_results');
const autocompleteAnchor = document.getElementById('autocomplete_results_anchor');

const validateAddressLine1 = document.getElementById('validate_address_line_1');
const validateAddressLine2 = document.getElementById('validate_address_line_2');
const validateAddressLine3 = document.getElementById('validate_address_line_3');
const validateAddressPostcode = document.getElementById('validate_address_postcode');
const addressSuggestionWrapper = document.getElementById('address_suggestion_wrapper');
const updateAddressButton = document.getElementById('confirm_update_address_button');

const searchButton = document.getElementById('search_button');
const addOrderTable = document.getElementById('table_body');
const addOrderSearchInput = document.getElementById('add_order_search_input');
const addOrderSearchFilter = document.getElementById('add_order_search_filter');
const assignStopButton = document.getElementById('assign_stop_button');
const removeStopButton = document.getElementById('remove_stop_button');
const addStopButton = document.getElementById('add_stop_button');

const runOriginAddress1 = document.getElementById('run_origin_address_line_1');
const runOriginAddress2 = document.getElementById('run_origin_address_line_2');
const runOriginAddress3 = document.getElementById('run_origin_address_line_3');
const runOriginPostcode = document.getElementById('run_origin_postcode');
const runOriginHour = document.getElementById('run_origin_hour');
const runOriginMinute = document.getElementById('run_origin_minute');

const runDestinationAddress1 = document.getElementById('run_destination_address_line_1');
const runDestinationAddress2 = document.getElementById('run_destination_address_line_2');
const runDestinationAddress3 = document.getElementById('run_destination_address_line_3');
const runDestinationPostcode = document.getElementById('run_destination_postcode');



const mapWrapper = document.getElementById("map");

const stopCardLongClickTime = 1000;

const autocompleteDebounce = 2000;


let autocompleteSessionActive = false;
let lastAutoCompleteInput;
let currentSessionToken;

let currentShipmentUnassignedOrders;
let currentSelectedRunCard = null;
let currentSelectedRun = null;
let currentSelectedShipmentName = null;

let currentStopMetaData = null;
let currentStopButtonWrapper = null;
let currentOpposingStopAddress = null;

let lastMouseDown = 0;
let lastMouseUp = 0;
let mouseDown = false;

let isCardBeingDragged = false;
let cardBeingDragged;
let mouseMoveCallback;

let mimicCard;
let dragZones = [];

let mainMap;
let mainMapMarkers = [];
let mainMapMarkerClusters;

let validateAddressMap;
let validateAddressMapMarkers = [];
let currentlySelectedAddressSuggestionCard;
let currentlySelectedSuggestionAddress;
let currentlySelectedStop;

let routePaths = [];


addEventListeners();
init();


function init(){

  initAutocomplete();
  initMap();
  updateSelectShipment();
  getOrders(query(collection(db, 'Orders'), orderBy('ID', 'desc'), limit(20)));

}


async function initAutocomplete(){

  const Autocomplete = await google.maps.importLibrary("places");
  GoogleAutocomplete = Autocomplete;

}


function addEventListeners(){

  window.addEventListener('mousedown', () => {

    mouseDown = true;
    lastMouseDown = Date.now();

  });

  window.addEventListener('mouseup', async () => {

    mouseDown = false;
    lastMouseUp = Date.now();

    if(isCardBeingDragged){

      await dropStopCard();
      showUnoptimisedRunState();

    }

  });

  if(selectedShipment != null){

    selectedShipment.addEventListener('input', () => {

      // removePolylines();
      currentSelectedRun = null;
  
      if(selectedShipment.value == "CREATE_SHIPMENT"){

        showUI(createShipmentWidget);
        return;
      }

      if(selectedShipment.value == "DELETE_SHIPMENT"){

        generateDeleteWidget();
        showUI(deleteShipmentWidget);
        return;
      }

      if(selectedShipment.value == "SELECT_SHIPMENT"){
        return;
      }


      currentSelectedShipmentName = selectedShipment.value;

      selectedRunView.classList.add('hidden');
      updateRunsList(currentSelectedShipmentName);

      removePolylines();

    });

  }

  if(cancelCreateShipmentButton != null){

    cancelCreateShipmentButton.addEventListener('click', () => {

        hideSelectUI(createShipmentWidget);

    });

  }

  if(saveCreateShipmentButton != null){

    saveCreateShipmentButton.addEventListener('click', async () => {

      if(shipmentNameInput.value == "default"){
        alert('"default" is an invalid name for a shipment. Please choose a different name')
        return;
      }
      
      const generateShipmentResult = await generateShipment(shipmentNameInput.value, shipmentTypeInput.value, shipmentDeliveryWeekInput.value);

      console.log(generateShipmentResult);

      if(!generateShipmentResult){

        showNotification("Error!", "Error creating shipment");
        return;

      }

      updateSelectShipment(shipmentNameInput.value);
      updateRunsList(shipmentNameInput.value);
      clearAndHideRunStopsUI();

      showNotification("Success!", "Successfully created shipment");
      hideSelectUI(createShipmentWidget);

    });

  }

  if(cancelDeleteShipmentButton != null){

    cancelDeleteShipmentButton.addEventListener('click', () => {

      hideSelectUI(deleteShipmentWidget);

    });

  }

  if(confirmDeleteShipmentButton != null){

    confirmDeleteShipmentButton.addEventListener('click', async () => {

      if(selectDeleteShipment.value != "default"){

        const deleteShipmentDocumentResult = await deleteShipmentDocument(selectDeleteShipment.value);
        
        console.log(deleteShipmentDocumentResult);

        if(!deleteShipmentDocumentResult){

          showNotification("Error!", "Error deleting shipment");

          return;
        }
        
        clearShipmentUI();
        clearAndHideRunStopsUI();
        updateSelectShipment();

        showNotification("Success!", "Successfully deleted shipment");
        hideSelectUI(deleteShipmentWidget);

      }else{
        alert("Please select a shipment to delete");
      }

    });

  }

  if(searchButton != null){

    searchButton.addEventListener('click', () => {
    
      if(addOrderSearchInput.value == ""){

        alert("enter a search value to fitler orders by");

      }

      if(addOrderSearchFilter.value == ""){

        alert("enter a field to filter orders by");

      }

      getOrders(filterSearch(addOrderSearchFilter.value, addOrderSearchInput.value));


    });

  }
  
  if(assignStopButton != null){

    assignStopButton.addEventListener('click', async () => {

      const shipmentData = await fetchShipment(selectedShipment.value);
      const runData = await fetchRunsInShipment(shipmentData.data()['runs']);
      const fuelSettings = await fetchFuelSettings();

      updateSelectRunAssignStops(runData, fuelSettings.data());

      showUI(assignStopsWidget);

    });

  }

  if(addStopButton != null){

    addStopButton.addEventListener('click', () => {

      showUI(addStopsWidget);

    });

  }

  if(assignStopsWidgetButton != null){

    assignStopsWidgetButton.addEventListener('click', async () => {

      //check for selected order
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=assignStopCheckbox]');

      const orderIDs = [];

      selectedCheckBoxes.forEach((x) => {

        orderIDs.push(x.value);

      });

      console.log(currentSelectedRun);

      for(let i = 0; i < orderIDs.length; i++){

        const stopWithoutCoordinates = doesStopHaveCoordinates(currentSelectedRun.stops, orderIDs[i]);

        if(stopWithoutCoordinates){
          console.log(stopWithoutCoordinates);
          showNotification("Error!", "Stop " + stopWithoutCoordinates.stopData.ID + " " + stopWithoutCoordinates.stopType + " has invalid coordinates. Please validate the address before assigning the run");
          return;
        }

      }

      const result = await assignStopsToRun(selectAssignStopsRun.value, orderIDs, currentShipmentUnassignedOrders);

      
      if(result){

        showNotification("Success!", "Stop(s) successfully assigned to run");

      }else{

        showNotification("Error!", "Error assigning stop(s) to run");

      }


      const runObject = await selectRun(currentSelectedRun.documentId);
      currentSelectedRun = runObject;
      updateUnassignedOrdersTable(runObject);

      hideUI(assignStopsWidget);

    });

  }

  if(cancelAssignStopsWidgetButton != null){

    cancelAssignStopsWidgetButton.addEventListener('click', () => {

      hideUI(assignStopsWidget);
      
    });

  }

  if(addStopsWidgetButton != null){

    addStopsWidgetButton.addEventListener('click', async () => {

      //check for selected order
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=addStopCheckbox]');

      const orderIDs = [];

      selectedCheckBoxes.forEach((x) => {

        orderIDs.push(x.value);

      });

      const stopType = selectAddStopsRun.value

      //returns true or a string
      const result = await assignStopsToShipment(orderIDs, stopType, selectedShipment.value);

      if(result !== true){

        showNotification("Error!", result);
        return;

      }else{
        
        showNotification("Success!", "Successfully added stop(s) to " + selectedShipment.value);

      }

      hideUI(addStopsWidget);
      await updateRunsList(selectedShipment.value);
      hideUI(mapWrapper);
      showUI(addRunDetailsContainer);
      deselectCheckboxes(selectedCheckBoxes);

    });

  }

  if(cancelAddStopsWidgetButton != null){

    cancelAddStopsWidgetButton.addEventListener('click', () => {

      hideUI(addStopsWidget);
      
    });

  }

  if(removeStopButton != null){

    removeStopButton.addEventListener('click', () => {

      showUI(removeStopsWidget);

    });

  }

  if(cancelRemoveStopsWidgetButton != null){

    cancelRemoveStopsWidgetButton.addEventListener('click', () => {

      hideUI(removeStopsWidget);

    });

  }

  if(removeStopsWidgetButton != null){

    removeStopsWidgetButton.addEventListener('click', async () => {

      //get stops that have been selected
    
      const selectedCheckBoxes = document.querySelectorAll('input[type=checkbox]:checked[class=assignStopCheckbox]');

      const stopIDs = [];

      selectedCheckBoxes.forEach((x) => {

        stopIDs.push(x.value);

      });

      const result = await removeStopsFromShipment(stopIDs, currentShipmentUnassignedOrders);
      
      hideUI(removeStopsWidget);
      
      updateUnassignedOrdersTable(currentSelectedRun);

      if(result){
        showNotification("Success!", "Successfully removed stops from shipment");
        return;
      }
      
      showNotification("Error!", "Error removing stops from shipment");

    });

  }

  if(addRunWidgetButton != null){

    addRunWidgetButton.addEventListener('click', async () => {

      if(addRunNameInput.value != null){

        const runDefaultSettings = null;
        const result = await addRunToShipment(addRunNameInput.value, runDefaultSettings, currentSelectedShipmentName);

        if(result === false){

          showNotification("Error!", "Error adding run to shipment");
          return;

        }

        updateRunsList(currentSelectedShipmentName);
        removePolylines();
        showNotification("Success!", "Successfully added run to shipment");
    
        hideUI(addRunWidget);
        return;

      } 

      showNotification("Error!", "Please enter a name for the run you want to add");

    });
  }

  if(cancelAddRunWidgetButton != null){

    cancelAddRunWidgetButton.addEventListener('click', () => {

      hideUI(addRunWidget);

    });

  }

  if(manageTabButton != null){

    manageTabButton.addEventListener('click', () => {

      selectTab("Manage");

    });

  }

  if(optionTabButton != null){

    optionTabButton.addEventListener('click', () => {
      
      selectTab("Option");

    });

  }

  if(removeRunButton != null){

    removeRunButton.addEventListener('click', async () => {
      //get primary keys of stops to remove
      const stopPrimaryKeys = currentSelectedRun.stops.map((stop) => {

        return stop.orderID + "_" + stop.stopType;

      });

      let assignStopsResult = true;

      if(stopPrimaryKeys.length != 0){
        //remove all stops from run
        assignStopsResult = await assignStopsToRun(currentShipmentUnassignedOrders, stopPrimaryKeys, currentSelectedRun.documentId);
      }

      //remove run document
      if(assignStopsResult){

        if(currentShipmentUnassignedOrders == currentSelectedRun.documentId){
          showNotification("Error!", "Cannot remove unassigned stops document from shipment");
          return; 
        }

        const removeRunFromShipmentResult = await removeRunFromShipment(currentSelectedRun.documentId, currentSelectedShipmentName);
        if(removeRunFromShipmentResult){

          showNotification("Success!", "Removed run from shipment. All stops in run have been marked as unassigned");

        }else{

          showNotification("Error!", "Error removing run from shipment. All stops in run have been market as unassigned");

        }

        await updateRunsList(currentSelectedShipmentName);
        hideUI(selectedRunView);
   
      }else{

        showNotification("Error!", "Error removing run from shipment");

      }

    });

  }

  if(calculateRouteButton != null){

    calculateRouteButton.addEventListener('click', async () => {

      //show loader
      const loader = createLoader();
      calculateRouteButtonWrapper.appendChild(loader);
      hideUI(calculateRouteButton);

      const routeJSON = await calculateRoute(currentSelectedRun);

      if(routeJSON === false){

        showNotification("Error!", "Error calculating route");   
        showUI(calculateRouteButton);
        loader.remove();
    
        return;
      }

      console.log(routeJSON);

      try{

        const fuelSettings = await fetchFuelSettings();
        currentSelectedRun.fuelCost = calculateFuelCost(routeJSON['metrics']['aggregatedRouteMetrics']['travelDistanceMeters'], fuelSettings.data());
        
      }catch(e){

        console.log(e);

      }

      showUI(calculateRouteButton);
      loader.remove();
    
      const transitions = routeJSON['routes'][0]['transitions'];
     
      removePolylines();

      for(let i = 0; i < transitions.length; i++){
        
        drawPolyline(transitions[i]['routePolyline']['points']);

      }

      updateMapMarkers(currentSelectedRun);
      updateStopList(currentSelectedRun);
      updateCurrentSelectedRunCard(currentSelectedRunCard, currentSelectedRun);

    });

  }

  if(validateAddressCancelButton != null){

    validateAddressCancelButton.addEventListener('click', () => {

      clearAndHideValidateAddressWidget();

    });

  }

  if(validateAddressAutocompleteInput != null){

    validateAddressAutocompleteInput.addEventListener('focus', () => {
    

      if(!autocompleteSessionActive){

        autocompleteSessionActive = true;
        
        currentSessionToken = new google.maps.places.AutocompleteSessionToken();

        console.log(currentSessionToken);

        validateAddressAutocompleteInput.addEventListener('input', async () => {

          if(validateAddressAutocompleteInput.value == ""){

            hideUI(autocompleteAnchor);
            hideUI(autocompleteLoader);
            return;

          }

          showUI(autocompleteLoader);
          showUI(autocompleteAnchor);
          removeAutocompleteSuggestions();


          lastAutoCompleteInput = Date.now();

          setTimeout(async () => {

            if((Date.now() - lastAutoCompleteInput) >= autocompleteDebounce){

              if(validateAddressAutocompleteInput.value == ""){
                return;
              }

              const suggestions = await fetchAutocompleteAddress(validateAddressAutocompleteInput.value, currentSessionToken, GoogleAutocomplete.AutocompleteSuggestion);  

              setAutocompleteResults(suggestions);

              hideUI(autocompleteLoader);

            }

          }, 2000);


        });

      }

    });

  

  }

  if(validateAddressButton != null){

    validateAddressButton.addEventListener('click', async () => {

      console.log("before");
      removeMapMarkers(validateAddressMapMarkers);
      addressSuggestionWrapper.innerHTML = "";

      //create address string
      const addressString = validateAddressLine1.value + "," + validateAddressLine2.value + "," +validateAddressLine3.value + "," + validateAddressPostcode.value;
      const coordinates = await fetchStopCoordinates(addressString);


      if(coordinates === false){
        showNotification("Error!", "Error fetching coordinates for address");
        return;
      }

      if(coordinates.status == "ZERO_RESULTS"){
        showNotification("Invalid address", "Couldnt find coordinates for this address");
        return;
      }

      addSuggestions(coordinates.results);

    });

  }

  if(updateAddressButton != null){

    updateAddressButton.addEventListener('click', async () => {


      if(currentlySelectedAddressSuggestionCard != null){

        const result = await updateStopAddress(currentlySelectedSuggestionAddress, currentSelectedRun, currentlySelectedStop);
        
        if(result === false){
          showNotification("Error!", "Error updating stop address");
          return;
        }

        showNotification("Success!", "Updated stop address");
        clearAndHideValidateAddressWidget();

        const runObject = await selectRun(currentSelectedRun.documentId);
        console.log(runObject);

        currentSelectedRun = runObject;

        if(currentSelectedRun.runName == null){
          updateUnassignedOrdersTable(runObject);
        }else{

          showUnoptimisedRunState();

        }
        
      }

    });

  }

  if(updateRunSettingsButton != null){

    updateRunSettingsButton.addEventListener('click', async () => {

      await updateRunSettingsController();
    
    });

  }

  if(splitRunSelect != null){

    splitRunSelect.addEventListener('change', (e) => {

      console.log(e.target.value);
      if(e.target.value == ""){

        hideUI(splitRunSettingsButton);
        return;
      }

      showUI(splitRunSettingsButton);

    });

  }

  if(splitRunSettingsButton != null){

    splitRunSettingsButton.addEventListener('click', async () => {

      const result = await splitRun(currentSelectedRun, splitRunSelect.value, selectedShipment.value);

      if(result){

        updateRunsList(selectedShipment.value);
        clearAndHideRunStopsUI();
        removePolylines();
        showNotification("Success!", "Successfully split run");
        return;

      } 

      showNotification("Error!", "Error splitting run");

    });

  }

}


async function updateRunSettingsController(){

  const runSettings  = {

      start: {

        address:{

          address1: runOriginAddress1.value,
          address2: runOriginAddress2.value,
          address3: runOriginAddress3.value,
          postcode: runOriginPostcode.value

        },
        time:{

          hour: parseInt(runOriginHour.value),
          minute: parseInt(runOriginMinute.value),

        },
        location:{}

      },

      end: {

        address:{

          address1: runDestinationAddress1.value,
          address2: runDestinationAddress2.value,
          address3: runDestinationAddress3.value,
          postcode: runDestinationPostcode.value,

        },
        location:{}
      
      }

  }

  const coordinates = await fetchCoordinatesForUpdatedRunSettings(runSettings);
  console.log(coordinates);
  if(coordinates === false){

    showNotification("Error!", "Error finding address");
    return;

  }

  runSettings.start.location.lat = coordinates.originCoordinates.lat;
  runSettings.start.location.lng = coordinates.originCoordinates.lng;

  runSettings.end.location.lat = coordinates.destinationCoordinates.lat;
  runSettings.end.location.lng = coordinates.destinationCoordinates.lng;

  const hasUpdated = await updateRunSettings(runSettings, currentSelectedRun.documentId);

  currentSelectedRun.settings = runSettings;
  currentSelectedRun.isOptimised = false;

  showUnoptimisedRunState();

  if(hasUpdated){
    showNotification("Success!", "Successfully updated run settings");
    return
  } 

  showNotification("Error!", "Error updating run settings");

}


function drawPolyline(polylineString){

  //in case there is no route as there is a second delivery at the location
  if(polylineString != null){

    const decodedPath = GoogleGeometry.decodePath(polylineString);

    const routePath = new google.maps.Polyline({
        path: decodedPath,      // The array of LatLng coordinates
        geodesic: true,         // Set to true for accurate rendering on a globe
        strokeColor: '#2881FF', // Red color for the line (you can choose any hex color)
        strokeOpacity: 1.0,     // Fully opaque
        strokeWeight: 4         // Line thickness in pixels
    });

    routePath.setMap(mainMap)

    routePaths.push(routePath);

  }

}

function addSuggestions(results){

  for(let i = 0; i < results.length; i++){  

    console.log(results[i]);

    const addressObject = parseAddress(results[i]['address_components']);
    const addressSuggestionCard = createAddressSuggestionCard(addressObject, i + 1);

    addressSuggestionCard.addEventListener('click', () =>{

      validateAddressMap.setCenter(results[i]['geometry']['location']);

      const stop = {
        coordinates: results[i]['geometry']['location'], 
        address: parseAddress(results[i]['address_components'])
      }

      selectAddressSuggestionCard(addressSuggestionCard, stop);

    });

    addressSuggestionWrapper.appendChild(addressSuggestionCard);
    addMarkerToMap(validateAddressMap, i + 1, results[i]['geometry']['location']);

  }

  validateAddressMap.setCenter(results[0]['geometry']['location']);

}


function selectAddressSuggestionCard(selectedCard, suggestedAddress){

  if(currentlySelectedAddressSuggestionCard != null){
    currentlySelectedAddressSuggestionCard.classList.remove('selected');
  }

  selectedCard.classList.add('selected');
  currentlySelectedAddressSuggestionCard = selectedCard;
  currentlySelectedSuggestionAddress = suggestedAddress;

  updateAddressButton.classList.remove('nonClickable');

} 


function deselectCheckboxes(checkBoxes){

  for(let i = 0; i < checkBoxes.length; i++){

    checkBoxes[i].checked = false;

  }

}

function clearAndHideValidateAddressWidget(){

  hideUI(validateAddressWidget);
  removeMapMarkers(validateAddressMapMarkers);
  addressSuggestionWrapper.innerHTML = "";
  updateAddressButton.classList.add('nonClickable');
  currentlySelectedAddressSuggestionCard = null;

}


function selectTab(tabName){

  if(tabName == "Manage"){

    showUI(runStopsContainer);
    hideUI(runOptionsContainer);
    manageTabButton.classList.add('selectedTabButton');
    optionTabButton.classList.remove('selectedTabButton');

  }else if(tabName == "Option"){

    hideUI(runStopsContainer);
    showUI(runOptionsContainer);
    optionTabButton.classList.add('selectedTabButton');
    manageTabButton.classList.remove('selectedTabButton');

  }

}


function showRuns(){

  showUI(selectedRunView);
  showUI(runInfoWrapper);
  showUI(mapWrapper);
  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

  selectTab("Manage");

}

function showShipment(){

  clearShipmentUI();
  showUI(runStopsContainer);
  showUI(mapWrapper);

}


function showAddOrderTable(){

  showUI(addRunDetailsContainer);
  showUI(selectedRunView);
  hideUI(runStopsContainer);
  hideUI(unassignedOrdersContainer);
  hideUI(runInfoWrapper);
  hideUI(mapWrapper);

  selectedRunView.classList.remove('fit-content');

}


function showUnassignedOrdersTable(){

  hideUI(addRunDetailsContainer);
  hideUI(selectedRunView);
  hideUI(runStopsContainer);
  hideUI(mapWrapper);
  showUI(unassignedOrdersContainer);

  selectedRunView.classList.add('fit-content');

}


function showUI(element){

  element.classList.remove('hidden');

}


function hideUI(element){

  element.classList.add('hidden');

} 


function hideSelectUI(element){

  selectedShipment.value = "SELECT_SHIPMENT";
  hideUI(element);

}


function selectCard(runCard){

  if(currentSelectedRunCard != null){
    currentSelectedRunCard.classList.remove('selectedRunCard');
  }

  //deselect card without selecting a new one
  if(!runCard){

    currentSelectedRunCard = null;
    return;

  }

  runCard.classList.add('selectedRunCard');

  currentSelectedRunCard = runCard;

}

function clearShipmentUI(){

  runCardList.innerHTML = "";
  unassignedOrderTableBody.innerHTML = "";
  unassignedOrdersCardWrapper.innerHTML = "";
  addStopButtonWrapper.innerHTML = "";

  hideUI(addRunDetailsContainer);
  hideUI(unassignedOrdersContainer);

}


function clearAndHideRunStopsUI(){

  runStopsContainer.innerHTML = "";
  hideUI(runStopsContainer);
  hideUI(selectedRunView);

}


function showUnoptimisedRunState(){

  removePolylines();
  updateCurrentSelectedRunCard(currentSelectedRunCard, currentSelectedRun);
  updateMapMarkers(currentSelectedRun);
  updateStopList(currentSelectedRun);

}


//updates select options in assign run widget
function updateSelectRunAssignStops(runData, fuelSettings){

  const runs = [];

  for(let i = 0; i < runData.length; i++){

    runs.push(parseRunInfo(runData[i], fuelSettings));

  }

  runs.sort(sortAlphabetically);

  selectAssignStopsRun.innerHTML = "";

  for(let i = 0; i < runs.length; i++){

    if(runs[i].runName != null){
      selectAssignStopsRun.appendChild(createOption(runs[i].runName, runs[i].documentId));
    
    }

  }

}

function getRunCardEventListener(runStruct, runCard){

  const runCardEventListener = async () => {

    const run = await selectRun(runStruct.documentId);
    updateStopList(run);
    updateOptionsTab(run);
    showRuns();
    selectCard(runCard);

    //update map markers
    updateMapMarkers(run);
    updatePolylines(run);
    updateMapPosition(mainMap, run);

  }

  return runCardEventListener;

}



function parseRunData(runData, fuelSettings){

  const runStruct = parseRunInfo(runData, fuelSettings);

  if(runStruct.runName != null){
    
    const runCard = createRunCard(runStruct);

    runStruct.runCard = runCard;
    
    runCard.addEventListener('click', getRunCardEventListener(runStruct, runCard));

  }else{

    const unassignedOrdersButton = createUnassignedOrdersButton(runStruct);

    unassignedOrdersButton.addEventListener('click', async () => {

      const runObject = await selectRun(runStruct.documentId);
      await updateUnassignedOrdersTable(runObject);
      removeMapMarkers(mainMapMarkers, mainMapMarkerClusters);

    });

    runStruct.runCard = unassignedOrdersButton;

    //set unassigned stops doc id for current shipment
    currentShipmentUnassignedOrders = runStruct.documentId;
  }

  return runStruct;

}


function updateMapPosition(map, run){

  if(run.stops.length == 0){
    return;
  }

  const position = 
  {

    lat: run.stops[0]['coordinates']['lat'],
    lng: run.stops[0]['coordinates']['lng'],

  }

  map.setCenter(position);

}


async function updateUnassignedOrdersTable(runObject){

  currentSelectedRun = runObject;

  //rebuild ui
  await updateRunsList(selectedShipment.value);

  unassignedOrderTableBody.innerHTML = "";

  for(let i = 0; i < runObject.stops.length; i++){

    //clickable Element is either a checkbox or button

    const clickableElement = createUnassignedStopCardClickableElement(runObject.stops[i]);
    unassignedOrderTableBody.appendChild(createUnassignedOrdersTableCard(runObject.stops[i], clickableElement));

    if(runObject.stops[i]['coordinates'] == null){

      clickableElement.addEventListener('click', () => {

        console.log(runObject.stops[i]);
        currentlySelectedStop = runObject.stops[i];
        showUI(validateAddressWidget);

        validateAddressLine1.value = runObject.stops[i]['stopData']['address1'];
        validateAddressLine2.value = runObject.stops[i]['stopData']['address2'];
        validateAddressLine3.value = runObject.stops[i]['stopData']['address3'];
        validateAddressPostcode.value = runObject.stops[i]['stopData']['postcode'];

      });

    }

  }

  showUnassignedOrdersTable();

}


async function updateSelectShipment(shipmentName){

  let shipments;

  try{

    shipments = await getDocuments(query(collection(db, 'Shipments')));
 
  }catch(e){

    showNotification("Error!", "Error updating shipment options");
    return;
  }
  
  selectedShipment.innerHTML = "";

  const shipmentOptions = createShipmentOptions(shipmentName, shipments);

  for(let i = 0; i < shipmentOptions.length; i++){

    selectedShipment.appendChild(shipmentOptions[i]);

  }

}


async function generateDeleteWidget(){

  const docRef = query(collection(db, "Shipments"));
  const shipments = await getDocuments(docRef);

  selectDeleteShipment.innerHTML = "";

  for(let i = 0; i < shipments.docs.length; i++){

    const shipmentName = shipments.docs[i].data()['shipmentName'];
    selectDeleteShipment.appendChild(createOption(shipmentName, shipments.docs[i].id));

  }

}

function updateCurrentSelectedRunCard(runCard, run){

  const newRunCard = createRunCard(run);

  runCard.replaceWith(newRunCard);

  newRunCard.addEventListener('click', getRunCardEventListener(run, newRunCard));

  currentSelectedRunCard = newRunCard;

}

async function updateRunsList(shipmentName){

  if(shipmentName === "SELECT_SHIPMENT"){
    return;
  }

  const runsList = await selectShipment(shipmentName);

  if(runsList === false){
    showNotification("Error!", "Error fetching shipment");
    return;
  }

  runsList.sort(sortAlphabetically);

  showShipment();

  if(runsList.length == 0){
    runCardList.innerText = "No runs in shipment";
  }
  
  for(let i = 0; i < runsList.length; i++){

    if(runsList[i].runName != null){

      runCardList.appendChild(runsList[i].runCard);

    }else{

      //manage unassigned runs
      unassignedOrdersCardWrapper.appendChild(runsList[i].runCard);

    }

    if(currentSelectedRun != null){

      //find and reselect run that was selected before run card was rebuilt.
      if(currentSelectedRun.documentId == runsList[i].runCard.id){

        selectCard(runsList[i].runCard);

      }
    }

  }

  //append add stop button
  const addStopButton = createAddStopButton();

  addStopButton.addEventListener('click', () => {

    selectCard(false);
    showAddOrderTable();
    removeMapMarkers(mainMapMarkers, mainMapMarkerClusters);

  });

  addStopButtonWrapper.appendChild(addStopButton);


  //append add run button
  const addRunButton = createAddRunButton();

  addRunButton.addEventListener('click', () => {

    showUI(addRunWidget);

  });

  runCardList.appendChild(addRunButton);

}


async function selectShipment(shipmentName){

  removeMapMarkers(mainMapMarkers, mainMapMarkerClusters);

  const shipmentData = await fetchShipment(shipmentName);

  if(shipmentData === false){

    return false;

  }

  const runIDs = shipmentData.data()['runs'];

  const runData = await fetchRunsInShipment(runIDs);
  const fuelSettings = await fetchFuelSettings();

  if(fuelSettings === false){
    showNotification("Error!", "Error fetching fuel costs");
  } 

  const runsList = [];

  for(let i = 0; i < runData.length; i++){

    runsList.push(parseRunData(runData[i], fuelSettings.data()));

  }

  return runsList;

}

async function initMap() {
  
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const { encoding } = await google.maps.importLibrary("geometry");


  GoogleGeometry = encoding;
  GoogleAdvancedMarkerElement = AdvancedMarkerElement;
  GooglePinElement = PinElement;
  GoogleMap = Map;

  const position = { lat: 53.165573, lng: -2.204147 };
  
  mainMap = new GoogleMap(document.getElementById("map"), {
    zoom: 10,
    center: position,
    mapId: "298860eb89cd00b43e74dbd5",
  });

  initValidateAddressMap();

}

function initValidateAddressMap(){

  const position = { lat: 53.165573, lng: -2.204147 };
  
  validateAddressMap = new GoogleMap(document.getElementById("validate_address_map"), {
    zoom: 15,
    center: position,
    mapId: "298860eb89cd00b43e74dbd5",
  });

}

function addMarkerToMap(map, pinText, coordinates){

  
  const pinTextGlyph = new GooglePinElement({
    glyph: pinText.toString(),
    glyphColor: "white",
    background: '#0000FF',
    borderColor: '#CC0000'
  });

  validateAddressMapMarkers.push(new GoogleAdvancedMarkerElement({
    map: map,
    position: coordinates,
    content: pinTextGlyph.element,
    collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
  }));

  
}



function updateMapMarkers(run){ 

  removeMapMarkers(mainMapMarkers, mainMapMarkerClusters);

  const stops = run.stops;

  for(let i = 0; i < stops.length; i++){

    const position = 
    {

      lat: stops[i]['coordinates']['lat'],
      lng: stops[i]['coordinates']['lng'],

    }

    let backgroundColour = '#FF0000';
    let borderColour = '#CC0000';

    if(run.isOptimised){
      backgroundColour = '#0000FF';
      borderColour = '#0000CC';
    }

    const pinTextGlyph = new GooglePinElement({
      glyph: run.isOptimised ? stops[i].stopNumber.toString() : convertStopNumberToLetter(stops[i]['stopNumber']),
      glyphColor: "white",
      background: backgroundColour, // Red background
      borderColor: borderColour
    });

    mainMapMarkers.push(new GoogleAdvancedMarkerElement({
      map: mainMap,
      position: position,
      content: pinTextGlyph.element,
      collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
    }));

  }

  mainMapMarkerClusters = new MarkerClusterer({ markers: mainMapMarkers, map: mainMap });

  if(run.settings == null){
    return;
  }

  const startPosition = 
  {

    lat: run.settings.start.location.lat,
    lng: run.settings.start.location.lng,

  }

  const startIcon = document.createElement('span');
  startIcon.classList = "material-symbols-outlined startFlag";
  startIcon.innerText = "flag"

  const startPinTextGlyph = new GooglePinElement({
    glyph: startIcon,
    glyphColor: "black",
    background: '#FFFFFF',
    borderColor: '#000000'
  });

  mainMapMarkers.push(new GoogleAdvancedMarkerElement({
    map: mainMap,
    position: startPosition,
    content: startPinTextGlyph.element,
    collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
  }));


  const endPosition = 
  {

    lat: run.settings.end.location.lat,
    lng: run.settings.end.location.lng,

  }

  const endIcon = document.createElement('span');
  endIcon.classList = "material-symbols-outlined endFlag";
  endIcon.innerText = "sports_score";


  const endPinTextGlyph = new GooglePinElement({
    glyph: endIcon,
    glyphColor: "white",
    background: '#000000',
    borderColor: '#000000'
  });

  mainMapMarkers.push(new GoogleAdvancedMarkerElement({
    map: mainMap,
    position: endPosition,
    content: endPinTextGlyph.element,
    collisionBehavior: google.maps.CollisionBehavior.REQUIRED,
  }));

}

function removeMapMarkers(mapMarkers, clusters){

  for(let i = 0; i < mapMarkers.length; i++){

    console.log("map = null");
    mapMarkers[i].map = null;

  }

  //mapMarkers = [] cant be used as this would desctroy the reference and create a new array rather than alter the one passed in
  mapMarkers.splice(0, mapMarkers.length);

  if(clusters != null){
    clusters.clearMarkers();

  }

}

async function updatePolylines(run){

  removePolylines();

  //is order of stops optimised
  if(run.isOptimised){

    const transitions = run.optimisedRoute['routes'][0]['transitions'];
    
    for(let i = 0; i < transitions.length; i++){
      
      drawPolyline(transitions[i]['routePolyline']['points']);

    }

  }

}

function removePolylines(){

  for(let i = 0; i < routePaths.length; i++){

    routePaths[i].setMap(null);

  }

  routePaths = [];

}

function updateStopList(runObject){

  currentSelectedRun = runObject;

  const stops = runObject.stops
  runStopsContainer.innerHTML = "";

  for(let i = 0; i < stops.length; i++){

    for(let j = 0; j < stops.length; j++){

      if(stops[j].stopNumber == i + 1){

        let label = stops[j].stopNumber;

        if(!runObject.isOptimised){

          label = convertStopNumberToLetter(stops[j].stopNumber);
        }

        const stopNumber = createStopLabel(label, stops[j].isLocked);
        const stopCard = getStopCard(stops[j], runObject.documentId, stopNumber.firstChild);

        runStopsContainer.appendChild(stopNumber);
        runStopsContainer.appendChild(stopCard);

      }

    }

  }
 
  updateStopLockButtons();

  if(stops.length == 0){

    runStopsContainer.innerText = "No Stops in run";

  }

}


function updateOptionsTab(runObject){

  if(runObject.settings == null){
    clearRunOriginDestinationOptions();
    return;
  }

  let origin;
  let destination ;

  if(runObject.runType == "collection"){

    origin = runObject.settings.start;
    destination = runObject.settings.end;

  }else{

    origin = runObject.settings.start;
    destination = runObject.settings.end;

  }

  runOriginAddress1.value = origin.address.address1;    
  runOriginAddress2.value = origin.address.address2;  
  runOriginAddress3.value = origin.address.address3; 
  runOriginPostcode.value = origin.address.postcode;  
  runOriginHour.value = origin.time.hour;
  runOriginMinute.value = origin.time.minute;

  runDestinationAddress1.value = destination.address.address1;    
  runDestinationAddress2.value = destination.address.address2;  
  runDestinationAddress3.value = destination.address.address3; 
  runDestinationPostcode.value = destination.address.postcode;  

}

function clearRunOriginDestinationOptions(){

  runOriginAddress1.value = '';    
  runOriginAddress2.value = '';  
  runOriginAddress3.value = ''; 
  runOriginPostcode.value = '';  
  runOriginHour.value = '';
  runOriginMinute.value = '';

  runDestinationAddress1.value = '';   
  runDestinationAddress2.value = ''; 
  runDestinationAddress3.value = '';
  runDestinationPostcode.value = ''; 

}


function getDragDetectionZone(detectionZoneType){

  const dragDetectionZone = createDragDetectionZone(detectionZoneType);
  
  dragDetectionZone.addEventListener('mouseover', () => {

    if(isCardBeingDragged){

      if(dragDetectionZone.parentNode == cardBeingDragged){
        return;
      }

      if(mimicCard != null){
        mimicCard.remove();
      }

      //Creates direct copy of node including ID's
      mimicCard = getMimicCard(); 

      //the card thats being hovered over
      const stopCardWrapper = dragDetectionZone.parentNode;

      removeNumbersFromStopsList();

      if(detectionZoneType == "top"){

        stopCardWrapper.before(mimicCard);

      }else{

        stopCardWrapper.after(mimicCard);

      }

      addLabelsToStopsList();

    }

  });

  return dragDetectionZone;

}


function addLabelsToStopsList(){

  console.log("addLablesToStopList");

  const stopCards = runStopsContainer.querySelectorAll('.stopCardWrapper');
  const filteredStopCards = Array.from(stopCards).filter((stopCard) => {

    return stopCard != cardBeingDragged;
  });

  for(let i = 0; i < filteredStopCards.length; i++){

    const stopNumber = createStopLabel(convertStopNumberToLetter(i + 1));
    const stopCard = filteredStopCards[i].querySelector('.stopCard');

    const isLocked = stopCard.classList.contains('lockedCard');

    filteredStopCards[i].before(stopNumber);

    setStopNumberLock(isLocked, stopNumber.firstChild);

  }

}


function removeNumbersFromStopsList(){

  const stopNumbers = runStopsContainer.querySelectorAll('.stopNumberWrapper');

  for(let i = 0; i < stopNumbers.length; i++){

    stopNumbers[i].remove();

  }

}


function getMimicCard(){

  const mimicCard = cardBeingDragged.cloneNode(true);
  mimicCard.classList.remove('absolute');
  mimicCard.style.top = "";
  mimicCard.classList.add('invisible');
  mimicCard.classList.add('z-index-1');

  return mimicCard;

}


function getStopCard(stop, runDocumentID, stopNumber){
  
  const stopMetaData = createStopMetaData(stop);

  const lockIcon = createLockIcon();
  const lockOpenIcon = createOpenLockIcon();

  const stopLockButton = createStopLockButton(stop['isLocked'], lockIcon, lockOpenIcon);

  const editButton = createEditButton();
  const deleteButton = createDeleteStopButton();

  const buttonWrapper = createButtonWrapper(stopLockButton, editButton ,deleteButton);

  const stopAddress = createStopAddress(stop, ADDRESS_TYPE.ACTIVE); 
  const opposingStopAddress = createStopAddress(stop, ADDRESS_TYPE.OPPOSING);
  
  const stopsWrapper = createStopsWrapper(stopAddress, opposingStopAddress);

  const stopCardWrapper = createStopCard(stop, stopMetaData, stopsWrapper, buttonWrapper);

  const dragZoneTop = getDragDetectionZone("top");
  const dragZoneBottom= getDragDetectionZone("bottom");

  dragZones.push(dragZoneTop);
  dragZones.push(dragZoneBottom);

  stopCardWrapper.appendChild(dragZoneTop);
  stopCardWrapper.appendChild(dragZoneBottom);

  //set initial lock state
  setStopLock(stop['isLocked'], lockIcon, lockOpenIcon, stopNumber, stopCardWrapper.firstChild);

  stopLockButton.addEventListener('click', async () => {

    //loading symbol for lock
    if(stopLockButton.classList.contains("loading")){
      console.log("click blocked");
      return;
    }

    stopLockButton.classList.add('loading');

    const result = await toggleStopLock(stop, currentSelectedRun);

    stopLockButton.classList.remove('loading');

    if(!result){

      showNotification("Error!", "Error updating lock on stop");
      updateStopList(currentSelectedRun);

      return;

    }

    const stopNumber = stopCardWrapper.previousElementSibling.firstChild;

    setStopLock(stop['isLocked'], lockIcon, lockOpenIcon, stopNumber, stopCardWrapper.firstChild);

    if(currentSelectedRun.isOptimised){

      currentSelectedRun.isOptimised = false;
      currentSelectedRun.fuelCost = 0;

      showUnoptimisedRunState();


    }

  });


  editButton.addEventListener('click', () => {

    currentlySelectedStop = stop;

    showUI(validateAddressWidget);

    validateAddressLine1.value = stop['stopData']['address1'];
    validateAddressLine2.value = stop['stopData']['address2'];
    validateAddressLine3.value = stop['stopData']['address3'];
    validateAddressPostcode.value = stop['stopData']['postcode'];

  });


  deleteButton.addEventListener('click', async () => {

    const result = await assignStopsToRun(currentShipmentUnassignedOrders, [stop.orderID + "_" + stop.stopType], runDocumentID);

    if(result){

      showNotification("Success!", "Removed stop from run");

      const runObject = await selectRun(runDocumentID);
      currentSelectedRun = runObject;
      updateStopList(runObject);

      await updateRunsList(selectedShipment.value);

      showUnoptimisedRunState();

      return;
    } 

    showNotification("Error!", "Error removing stop from run");

  })


  stopCardWrapper.addEventListener('mousedown', (e) => {

    const mousedownTime = Date.now();

    setTimeout(() => {

      if(stop['isLocked']){
        return;
      }

      //has there been a mouseup within the timeout time
      if(mousedownTime - lastMouseUp > 0){

        const stopListYOffset = runStopsContainer.getBoundingClientRect().y;
        const stopCardYOffset = stopCardWrapper.getBoundingClientRect().y;
        
        const grabPositionOffset = e.clientY - stopCardYOffset;
        const top = e.clientY - stopListYOffset - grabPositionOffset;

        setTop(top ,stopCardWrapper)
        stopCardDragAndMove(stopCardWrapper, grabPositionOffset);

      }

    }, stopCardLongClickTime);

  });

  stopCardWrapper.addEventListener('mouseup', () => {

    const mouseupTime = Date.now();

    if(mouseupTime - lastMouseDown < stopCardLongClickTime){

      selectStop(stopMetaData, buttonWrapper, opposingStopAddress);

    }

  });


  stopLockButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  stopLockButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });


  editButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  editButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });

  deleteButton.addEventListener('mouseup', (e) => {

    e.stopPropagation();

  });

  deleteButton.addEventListener('mousedown', (e) => {

    e.stopPropagation();

  });

  return stopCardWrapper;

}




function setStopLock(isLocked, lockIcon, lockOpenIcon, stopNumber, stopCard){

  // console.log(stopCard);
  setLockIcon(isLocked, lockIcon, lockOpenIcon);
  setStopNumberLock(isLocked, stopNumber);
  setStopCardLock(isLocked, stopCard);

}

function setStopCardLock(isLocked, stopCard){

  if(isLocked){

    stopCard.classList.add('lockedCard');

  }else{

    stopCard.classList.remove('lockedCard');

  }

}

function setStopNumberLock(isLocked, stopNumber){

  if(isLocked){

    stopNumber.classList.add('lockedNumber');

  }else{

    stopNumber.classList.remove('lockedNumber');

  }

}


function setLockIcon(isLocked, lockIcon, lockOpenIcon){

  //the new state to set
  if(isLocked){

    hideUI(lockOpenIcon);
    showUI(lockIcon);

  }else{

    showUI(lockOpenIcon);
    hideUI(lockIcon);

  }

}


function stopCardDragAndMove(stopCard, grabPositionOffset){
 
  isCardBeingDragged = true;
  cardBeingDragged = stopCard;

  enableDragZones();

  mimicCard = getMimicCard();

  //initial mimic card position
  stopCard.before(mimicCard);
 
  stopCard.classList.add('absolute');
  stopCard.classList.add('ontop');

  mouseMoveCallback = (e) => { moveStopCard(e.clientY, stopCard, grabPositionOffset)} ;

  window.addEventListener('mousemove', mouseMoveCallback);

}


async function dropStopCard(){

  //get position of each stop in list 

  const stopCardList = Array.from(cardBeingDragged.parentNode.children).filter((element) => {

    if(element.classList.contains('stopNumberWrapper')){
      return false;
    }

    if(element === cardBeingDragged){
      return false;
    }

    return true;

  });


  //TODO: has the order changed



  const updatedStops = [];

  for(let i = 0; i < stopCardList.length; i++){

    const orderID = parseInt(stopCardList[i].querySelector('.orderID').innerText.replace('#', ''));
    const stopType = stopCardList[i].querySelector('.stopType').innerText.toLowerCase();

    updatedStops.push(updateStopNumberInRun(orderID, stopType, currentSelectedRun.stops, i + 1));

  }

  const updateDatabaseStops = removeStopDataFromStop(updatedStops);
  
  //update the database
  const result = await updateRun(currentSelectedRun.documentId, {stops: updateDatabaseStops, isOptimised: false});
 
  if(!result){

    showNotification("Error!", "Error updating stops orders");
    updateStopList(currentSelectedRun);

    return false;
  }


  //update client side order as database has updated successfully
  currentSelectedRun.stops = updatedStops;
  currentSelectedRun.isOptimised = false;
  currentSelectedRun.fuelCost = 0;


  if(cardBeingDragged != null){

      cardBeingDragged.classList.remove('absolute');
      cardBeingDragged.classList.remove('ontop');
      cardBeingDragged.style.top = "";

  }

  if(mimicCard != null){

    mimicCard.replaceWith(cardBeingDragged);
    // mimicCard.remove();

  }

  disableDragZones();
  updateStopLockButtons();

  window.removeEventListener('mousemove', mouseMoveCallback);

  isCardBeingDragged = false;

}


function updateStopLockButtons(){

  const lockButtons = runStopsContainer.querySelectorAll('.lockButtonWrapper');

  for(let i = 0; i < lockButtons.length; i++){
    lockButtons[i].classList.add('hidden');
  }

  if(lockButtons.length > 0){
    lockButtons[0].classList.remove('hidden');
    lockButtons[lockButtons.length - 1].classList.remove('hidden');
  }
 


}


function enableDragZones(){

  const dragDetectionZones = runStopsContainer.querySelectorAll('.dragDetectionZone');

  for(let i = 0; i < dragZones.length; i++){

    dragZones[i].classList.remove('hidden');

  }

  const stops = currentSelectedRun.stops;

  for(let i = 0; i < stops.length; i++){

    if(stops[i].stopNumber == 1){

      if(stops[i]['isLocked']){
        dragDetectionZones[0].classList.add('hidden');
      }

    }

    if(stops[i].stopNumber == stops.length){

      if(stops[i]['isLocked']){
        dragDetectionZones[dragDetectionZones.length - 1].classList.add('hidden');
      }

    }

  }

}


function disableDragZones(){

  for(let i = 0; i < dragZones.length; i++){

    dragZones[i].classList.add('hidden');

  }

}


function moveStopCard(mouseY, stopCard, grabPositionOffset){

  const stopListYOffset = runStopsContainer.getBoundingClientRect().y;
  const top = mouseY - stopListYOffset - grabPositionOffset;

  //get center of card pos
  setTop(top, stopCard);

}


function setTop(top, element){

  element.style.top = top + "px";

}


function selectStop(stopMetaData, buttonWrapper, opposingStopAddress){

  if(currentStopMetaData == stopMetaData && currentStopButtonWrapper == buttonWrapper && currentOpposingStopAddress == opposingStopAddress){
    //deselect 
    currentStopMetaData = null; 
    currentStopButtonWrapper= null;
    currentOpposingStopAddress = null

    hideUI(stopMetaData);
    hideUI(buttonWrapper);
    hideUI(opposingStopAddress);

    return;

  }

  if(currentStopMetaData != null){
    hideUI(currentStopMetaData);
  }

  if(currentStopButtonWrapper != null){
    hideUI(currentStopButtonWrapper);
  }

  if(currentOpposingStopAddress != null){
    hideUI(currentOpposingStopAddress);
  }

  showUI(stopMetaData);
  showUI(buttonWrapper);
  showUI(opposingStopAddress);

  currentStopMetaData = stopMetaData;
  currentStopButtonWrapper = buttonWrapper;
  currentOpposingStopAddress = opposingStopAddress;

}


async function getOrders(query){

  //fetch orders
  const orderData = await getDocuments(query);
  addOrderTable.innerHTML = "";

  console.log(orderData);

  if(orderData.empty){
    console.log("no orders to show");

    return;
  }

  for(let i = 0; i < orderData.docs.length; i++){

    addOrderTable.appendChild(createTableOrderCard(orderData.docs[i]));

  }

}


function setAutocompleteResults(suggestions){

  removeAutocompleteSuggestions();

  for (const suggestion of suggestions) {

    const placePrediction = suggestion.placePrediction;

    const address = document.createElement("p");

    address.addEventListener("click", async () => {

      hideUI(autocompleteAnchor);
      removeAutocompleteSuggestions();
      const result = await fetchSuggestionPlace(placePrediction.text.toString());

      validateAddressLine1.value = result.address.streetAddress;
      validateAddressLine2.value = result.address.city;
      validateAddressLine3.value = result.address.county;
      validateAddressPostcode.value = result.address.postcode;
      
    });

    address.innerText = placePrediction.text.toString();

    // Create a new list element.
    const li = document.createElement("li");

    li.appendChild(address);
    autocompleteResults.appendChild(li);

  }

}

function removeAutocompleteSuggestions(){

  const suggestions = autocompleteResults.querySelectorAll('li');

  for(let i = 0; i < suggestions.length; i++){

    suggestions[i].remove();

  }

}





