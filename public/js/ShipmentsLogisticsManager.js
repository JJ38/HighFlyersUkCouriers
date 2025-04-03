
const liveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const shipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");
const unassignedOrdersButton = document.getElementById("unassignedOrdersCard");
const runCards = document.querySelectorAll('.runCard');

let selectableCards = Array.from(runCards);
selectableCards = selectableCards.concat(unassignedOrdersButton);

let currentSelectedRun = null;

let map;

console.log(selectableCards);

initMap();
addEventListeners();

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

function addEventListeners(){

  if(selectableCards != null){

    for(let i = 0; i < selectableCards.length; i++){
      console.log(selectableCards[i]);
      selectableCards[i].addEventListener('click', () => {

        console.log("clicked");
        
        if(currentSelectedRun != null){
          currentSelectedRun.classList.remove('selectedRunCard');
        }
      
        selectableCards[i].classList.add('selectedRunCard');
      
        currentSelectedRun = selectableCards[i];
      
      });
    }

  }



}


