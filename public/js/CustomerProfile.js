import { db, auth, getDocument, updateDocument } from "/js/Firebase.js";
import { doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

const updateButton = document.getElementById('updatebutton');

var uid;

updateButton.addEventListener('click', () => {

  updateLoader.style.display = "block";

  //update customer profile;
  if(uid == null || db == null){
    alert("error updating profile");
    return;
  }

  const docRef = doc(db, "Customers", uid);
  const customerProfile = createCustomerProfile();
  updateDocument(docRef, customerProfile);
  
  updateLoader.style.display = "none";
  alert("Your profile has been updated");

});


onAuthStateChanged(auth, (user) => {

  if (user) {
    // User is signed in
    uid = user.uid;

    if(uid == null || db == null){
      alert("Error fetching profile");
    }
  
    const docRef = doc(db, "Customers", uid);

    getDocument(docRef).then((doc) => {
        parseCustomerProfile(doc.data());

        //show customer profile data
        loader.style.display = "none";
        customerProfileData.classList.remove("hidden");
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
