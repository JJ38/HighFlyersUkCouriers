import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const table = document.getElementById('accountData');

const firebaseConfig = {
    apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
    authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
    projectId: "highflyersukcouriers-a9c17",
    storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
    messagingSenderId: "970355130070",
    appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
    measurementId: "G-93M1E0Q9FJ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

getDocs(collection(db, "Users")).then((querySnapshot) => querySnapshot.forEach((doc) => {

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