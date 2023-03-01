const transporticons = document.querySelector('.collectiondeliveryicons');
const transportinfowrapper = document.querySelector('.transportinfowrapper');
const addressDataRow = transportinfowrapper.querySelectorAll('.columns');
// var exandButtons = document.querySelectorAll('.expand');
const headers = document.querySelector('.headerrow');

// updateTransportIconsPositon();

onresize = (event) => {
    updateTransportIconsPositon();
}

document.addEventListener('DOMContentLoaded', function() {
    updateTransportIconsPositon();
});

function updateTransportIconsPositon(){
    transporticons.style.height = transportinfowrapper.offsetHeight -20 + 'px';
    transporticons.style.top = '26px';
    transporticons.style.right = headers.children[headers.children.length-1].offsetWidth + headers.children[headers.children.length-2].offsetWidth + 20 - 30 + 50 + 'px';

}

function toggleExpand(element){

    
    const transportinfowrapper = element.parentElement.parentElement;
    const tablerow = transportinfowrapper.parentElement;
    transportinfowrapper.children[0].classList.toggle('hidden'); //transport icons 
    transportinfowrapper.children[0].classList.toggle('transporticons');
    transportinfowrapper.children[1].classList.toggle('hidden'); //collection info
    console.log(transportinfowrapper.children[2]);
    transportinfowrapper.children[2].children[5].classList.toggle('hidden'); //payment info

    tablerow.children[1].classList.toggle('hidden'); //extra info
    tablerow.children[1].classList.toggle('extrainfo');
    tablerow.children[2].classList.toggle('hidden'); //delete button
    
    element.parentElement.children[0].classList.toggle('hidefont'); //animal name
    element.classList.toggle('hide')// button animation

    console.log(element.parentElement.children[0]);

    updateTransportIconsPositon();

}
