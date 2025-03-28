//Identify notification thats needed by getting url
const params = new URLSearchParams(document.location.search);

for (const [key, value] of params.entries()) {

    console.log(`${key}, ${value}`);
    shouldShowNotification(key, value);
    
}


function shouldShowNotification(key, value){

    //identify if a notification is needed

    switch(key){

        case 'addorder':

            if(value == "true"){
                showNotification("Success!", "Order added successfully")   
            }

            else if(value == "dberror"){
                showNotification("Error!", "Order not added - database error")
            }

            else{
                showNotification("Error!", "Order not added - an error occured")
            }

            break;
        
        case 'deleted':

            if(value == "true"){
                showNotification("Success!", "Order deleted successfully")  
            }
            
            else{
                showNotification("Error!", "Order not deleted - an error occured")
            }

            break;

        case 'updated':

            if(value == "true"){
                showNotification("Success!", "Order updated successfully")  
            }

            else if(value == 'dberror'){
                showNotification("Error!", "Order not updated - database error")
            }

            else{
                showNotification("Error!", "Order not updated - an error occured")
            }

            break;

        case 'printerror':

            if(value == 'false'){
                showNotification("Success!", "Orders marked as printed")
            }

            else{
                showNotification("Error!", "Orders not marked as printed - error")
            }

            break;

        case 'permission':

            if(value == "denied"){
                showNotification("Error!", "You do not have permission to edit this order!")
            }
            
            break;


        case 'partiallyDeleted':

            if(value != null){
                showNotification("Error!", "Error failed to delete order " + value)
            }

            break;

        case 'error':

            if(value == "dbconnection"){
                showNotification("Error!", "Error connection to database!")
            }
        
        default:
            return;

    }

}

function showNotification(title, message){

    //generate HTML
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notificationContainer')

    const icon = getIcon(title);
    notificationContainer.appendChild(icon);

    const notificationContentWrapper = getNotificationContent(title, message);
    notificationContainer.appendChild(notificationContentWrapper);

    const closeSymbol = document.createElement('p');
    closeSymbol.classList.add('closeSymbol');
    closeSymbol.innerText = "x";
    closeSymbol.addEventListener('click', () => {
        notificationContainer.remove();
    });
    notificationContainer.appendChild(closeSymbol);

    const progressBar = document.createElement('div');
    progressBar.classList.add('progressBar');
    notificationContainer.appendChild(progressBar);

    const notificationWrapper = document.createElement('div');
    notificationWrapper.classList.add('notificationWrapper');
    notificationWrapper.appendChild(notificationContainer);

    document.body.appendChild(notificationWrapper);
    setInterval(() => {notificationWrapper.remove();}, 8000);

}


function getNotificationContent(title, message){
    
    const notificationContentWrapper = document.createElement('div');
    notificationContentWrapper.classList.add('notificationContentWrapper');

    const h1 = document.createElement('h1');
    h1.classList.add('notificationTitle');
    h1.innerText = title;

    const p = document.createElement('p');
    p.classList.add('notificationMessage');
    p.innerText = message;

    notificationContentWrapper.appendChild(h1);
    notificationContentWrapper.appendChild(p);

    return notificationContentWrapper;

}

function getIcon(title){

    const iconWrapper = document.createElement('div');
    iconWrapper.classList.add('iconWrapper')

    const circle = document.createElement('div');
    circle.classList.add('circle');
    iconWrapper.appendChild(circle);

     //identify if success or failure
    if(title == "Success!"){
        circle.style.background = "rgb(26, 184, 26)";
        circle.style.filter = "drop-shadow(2px 3px 5px rgba(26, 184, 26, 0.4))";
    }else{
        circle.style.background = "rgb(230, 22, 22)";
        circle.style.filter = "drop-shadow(2px 3px 5px rgb(230, 22, 22, 0.4))";
    }

    return iconWrapper;

}


