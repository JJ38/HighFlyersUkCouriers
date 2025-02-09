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

let driverInfoCards = document.getElementsByClassName('driverInfoCard');
let currentSelectDriver = null;

for (let i = 0; i < driverInfoCards.length; i++){
    driverInfoCards[i].addEventListener('click', () => {
        
        if(currentSelectDriver != null){
            currentSelectDriver.classList.remove('selectedDriverInfoCard');
          }
  
          driverInfoCards[i].classList.add('selectedDriverInfoCard');
  
          currentSelectDriver = driverInfoCards[i];
          
          console.log("Get info about run from Firebase");
  

        

    });
}


