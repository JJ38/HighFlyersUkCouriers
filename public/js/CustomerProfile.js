import { db, auth, getDocument } from "/js/Firebase.js";
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

const updateButton = document.getElementById('updatebutton');

var uid;

updateButton.addEventListener('click', () => {

  //update customer profile
  if(uid == null){
    alert("error updating profile");
  }

  const emailValue = email.value;
  const collectionNameValue = collectionName.value;
  const collectionAddress1Value = collectionAddress1.value;
  const collectionAddress2Value = collectionAddress2.value;
  const collectionAddress3Value = collectionAddress3.value;
  const collectionPostcodeValue = collectionPostcode.value;
  const collectionPhoneNumberValue = collectionPhoneNumber.value;

  //validate email and phone number
  const validateFormResult = validateForm();

  //if error
  if(validateFormResult){
    
    alert(validateFormResult);
    
  }


});

console.log(auth);
const user = auth.currentUser;
// const q = query(collection(db, "Customers"), );
// const doc = getDocs(q);
// console.log(doc);
onAuthStateChanged(auth, (user) => {

  if (user) {
    // User is signed in

    uid = user.uid;
  
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
    console.log(customerProfileData);
    console.log(customerProfileData['email']);

    email.value = customerProfileData['email'];
    collectionName.value = customerProfileData['collectionName'];
    collectionAddress1.value = customerProfileData['collectionAddress1'];
    collectionAddress2.value = customerProfileData['collectionAddress2'];
    collectionAddress3.value = customerProfileData['collectionAddress3'];
    collectionPostcode.value = customerProfileData['collectionPostcode'];
    collectionPhoneNumber.value = customerProfileData['collectionPhoneNumber'];

    
    
}
