var orders = document.querySelectorAll('tr');
const formConfirmDelete = document.getElementById('formconfirmdelete');


function confirmDelete(){
    let orderIDs = [];    

    orders = Array.from(orders);

    orders.shift();

    console.log(orders);

    for(let i = 0; i < orders.length; i++){
        orderIDs.push(orders[i].children[0].innerHTML);
    }

    console.log(orderIDs);

    for(let i = 0; i < orderIDs.length; i++){
        const input = document.createElement('input');
        input.type = "hidden";
        input.value = orderIDs[i];
        input.name= orderIDs[i];
        formConfirmDelete.appendChild(input);
    }

    formConfirmDelete.submit();
}