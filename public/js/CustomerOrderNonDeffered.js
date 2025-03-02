var headers = document.getElementById('headerrow');;

function toggleExpand(element){
    
    const transportinfowrapper = element.parentElement.parentElement;
    const tablerow = transportinfowrapper.parentElement;

    transportinfowrapper.children[0].classList.toggle('hideInfo'); //transport icons 
    transportinfowrapper.children[1].classList.toggle('hideInfo'); //collection info
    transportinfowrapper.children[2].classList.toggle('deliveryinfomargin');
    transportinfowrapper.children[2].children[5].classList.toggle('hideInfo'); //payment info

    tablerow.children[1].classList.toggle('hideInfo'); //extra info
    tablerow.children[2].classList.toggle('hideInfo'); //delete button
    
    element.parentElement.children[0].classList.toggle('hidefont'); //animal name
    element.parentElement.children[1].classList.toggle('hidefont'); //animal name
    element.parentElement.children[5].classList.toggle('hidefont'); //payment type
    element.classList.toggle('hide')// button animation

    transporticons = transportinfowrapper.children[0];
    collectioninfo = transportinfowrapper.children[1];
    deliveryinfo = transportinfowrapper.children[2];
    updateTransportIconsPositions(transporticons, collectioninfo, deliveryinfo);

}


function updateTransportIconsPositions(transporticons, collectioninfo, deliveryinfo){

    console.log(headers);

    headers = document.getElementById('headerrow');

    var deliveryinfoStyle = window.getComputedStyle(deliveryinfo);
    transporticons.style.height = collectioninfo.offsetHeight + parseInt(deliveryinfoStyle.marginTop) + 20 + 'px';
    transporticons.style.top = '30px';
    transporticons.style.right = headers.children[headers.children.length-1].offsetWidth + headers.children[headers.children.length-2].offsetWidth + 20 - 30 + 50 + 'px';
}


