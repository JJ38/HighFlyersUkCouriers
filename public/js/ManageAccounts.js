import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "/js/Firebase.js";

const table = document.getElementById('accountData');

getDocs(query(collection(db, "Users"), orderBy('username', 'asc'))).then((querySnapshot) => querySnapshot.forEach((doc) => {

    generateTableRow(doc.data(), doc.id);
    
   
}));
// querySnapshot

 //create element and append to DOM
function generateTableRow(userData, userID){

    const tableRow = document.createElement('tr');

    const username = document.createElement('td');
    const convertedEmailToUsername = userData.username.replace("@placeholder.com", "");

    username.innerText = convertedEmailToUsername;

    const role = document.createElement('td');
    role.innerText = userData.role;

    tableRow.appendChild(username);
    tableRow.appendChild(role);

    const buttonWrapper = document.createElement('td');

    const changePasswordLink = document.createElement('a');
    changePasswordLink.href = "/change-password?id=" + userID;
    const resetPasswordButton = document.createElement('button');
    resetPasswordButton.innerText = "reset password";
    changePasswordLink.appendChild(resetPasswordButton);
    

    const deleteUserLink = document.createElement('a');
    deleteUserLink.href = "/delete-user?id=" + userID;
    const deleteButton = document.createElement('button');
    deleteButton.innerText = "delete";
    deleteUserLink.appendChild(deleteButton);
   
    buttonWrapper.appendChild(changePasswordLink);
    buttonWrapper.appendChild(deleteUserLink)

    tableRow.appendChild(buttonWrapper);
    
    table.appendChild(tableRow);


}