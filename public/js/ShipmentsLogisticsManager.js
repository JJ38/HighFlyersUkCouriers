let map;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

initMap();


const LiveLogisticsManagerButton = document.getElementById("liveLogisticsManagerButton");
const ShipmentLogisticsManagerButton = document.getElementById("shipmentLogisticsManagerButton");

let runCards = document.getElementsByClassName('runCard');
let currentSelectedRun = null;

for (let i = 0; i < runCards.length; i++){
  runCards[i].addEventListener('click', () => {
        
        if(currentSelectedRun != null){
          currentSelectedRun.classList.remove('selectedRunCard');
        }

        runCards[i].classList.add('selectedRunCard');

        currentSelectedRun = runCards[i];
        
        console.log("Get info about run from Firebase");

    

    });
}
