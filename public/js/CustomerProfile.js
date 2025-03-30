import { db, auth, getDocument, updateDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { showNotification } from "/js/Notification.js";

const email = document.getElementById('email');
const collectionName = document.getElementById('collectionName');
const collectionAddress1 = document.getElementById('collectionAddress1');
const collectionAddress2 = document.getElementById('collectionAddress2');
const collectionAddress3 = document.getElementById('collectionAddress3');
const collectionPostcode = document.getElementById('collectionPostcode');
const collectionPhoneNumber = document.getElementById('collectionPhoneNumber');

const customerProfileData = document.getElementById('customerProfileData');
const loader = document.getElementById('loader');
const updateLoader = document.getElementById('updateLoader')
const updatePasswordLoader = document.getElementById('updatePasswordLoader')

const updateButton = document.getElementById('updatebutton');

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const updatePasswordButton = document.getElementById('updatePasswordButton');

var uid;

addEventListeners();

function addEventListeners(){

  if(updatePasswordButton != null){
    updatePasswordButton.addEventListener('click', () => {
      updatePasswordLoader.style.display = "block";
      updateUserPassword();
      updatePasswordLoader.style.display = "none";
    });
  }
  
  if(updateButton != null){

    updateButton.addEventListener('click', () => {

      updateLoader.style.display = "block";
  
      //update customer profile;
      if(uid == null || db == null){
        showNotification("Error!", "Error updating profile")
        return;
      }
  
      const docRef = doc(db, "Customers", uid);
      const customerProfile = createCustomerProfile();
      updateDocument(docRef, customerProfile);
      
      updateLoader.style.display = "none";
      showNotification("Success!", "Your profile was updated successfully")

  
    });

  }

  
}

onAuthStateChanged(auth, (user) => {
  
  console.log("customer profile authstatechanged");
  if (user) {
    // User is signed in
    uid = user.uid;

    if(uid == null || db == null){
      showNotification("Error!", "Error fetching profile")
    }
  
    const docRef = doc(db, "Customers", uid);

    getDocument(docRef).then((doc) => {
        parseCustomerProfile(doc.data());

        //show customer profile data
        loader.style.display = "none";
        if(customerProfileData != null){
          customerProfileData.classList.remove("hidden");
        }
        
    });
    
  } else {
    // User is signed out
 
  }

});

function parseCustomerProfile(customerProfileData){

    email.value = customerProfileData['email'];
    collectionName.value = customerProfileData['collectionName'];
    collectionAddress1.value = customerProfileData['collectionAddress1'];
    collectionAddress2.value = customerProfileData['collectionAddress2'];
    collectionAddress3.value = customerProfileData['collectionAddress3'];
    collectionPostcode.value = customerProfileData['collectionPostcode'];
    collectionPhoneNumber.value = customerProfileData['collectionPhoneNumber'];

}

function createCustomerProfile(){

  const customerProfile = {

    email: email.value,
    collectionName: collectionName.value,
    collectionAddress1: collectionAddress1.value,
    collectionAddress2: collectionAddress2.value,
    collectionAddress3: collectionAddress3.value,
    collectionPostcode: collectionPostcode.value,
    collectionPhoneNumber: collectionPhoneNumber.value,
  

  }

  return customerProfile;

}



function updateUserPassword(){
  console.log(password.value);
  console.log(confirmPassword.value);
  console.log(auth.currentUser);

  //check if password and confirm password are equal. if they're not return
  if(!(password.value == confirmPassword.value)){

    showNotification("Error!", "Password and confirm password are not equal")
    return;
  }
 
  if(auth == null){
    showNotification("Error!", "Error updating password - unauthenticated")
    return;
  }

  const user = auth.currentUser;
  const newPassword = password.value;

  updatePassword(user, newPassword).then(() => {
    // Update successful.
    showNotification("Success!", "Password updated successfully")
  }).catch((error) => {
    // An error ocurred
    showNotification("Error!", "Error updating password - Please re-login to update your password")

    console.log(error);
    
  });
}