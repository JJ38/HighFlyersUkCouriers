//SELECT * FROM orders INTO OUTFILE '/var/lib/mysql_files/orders.csv' FIELDS TERMINATED BY '|' LINES TERMINATED BY '~'; 

import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, addDoc} from "firebase/firestore";

const uploadButton = document.getElementById('upload');

uploadButton.addEventListener('click', previewFile);

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
  authDomain: "highflyersukcouriers-a9c17.firebaseapp.com",
  projectId: "highflyersukcouriers-a9c17",
  storageBucket: "highflyersukcouriers-a9c17.firebasestorage.app",
  messagingSenderId: "970355130070",
  appId: "1:970355130070:web:b2ff0ee62b6b9ac2339377",
  measurementId: "G-93M1E0Q9FJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

function previewFile() {

  const [file] = document.querySelector("input[type=file]").files;
  const reader = new FileReader();
  
  var fileData;

  reader.addEventListener(
    "load",
    () => {
      // this will then display a text file
      fileData = reader.result;

      parseFile(fileData);

    },
    false,
  );

  if (file) {
    reader.readAsText(file);
  }
}


function parseFile(fileData){


  const orderArray = fileData.split("~");

  for(let i = 0; i < orderArray.length - 1; i++){
      const fieldArray = orderArray[i].split("|");

      addDocument(fieldArray);
    
  }
  
  console.log(orderArray);

}

async function addDocument(orderData){

  const docData = {

    ID: parseInt(orderData[0]), //int
    animalType: orderData[1],
    quantity: parseInt(orderData[2]), //int
    email: orderData[3],
    account: orderData[4],
    deliveryWeek: parseInt(orderData[5]),//int
    collectionName: orderData[6],
    collectionPhoneNumber: orderData[7],
    collectionAddress1: orderData[8],
    collectionAddress2: orderData[9],
    collectionAddress3: orderData[10],
    collectionPostcode: orderData[11],
    deliveryName: orderData[12],
    deliveryAddress1: orderData[13],
    deliveryAddress2: orderData[14],
    deliveryAddress3: orderData[15],
    deliveryPostcode: orderData[16],
    deliveryPhoneNumber: orderData[17],
    payment: orderData[18],
    message: orderData[19], 
    addedBy: orderData[20],
    code: orderData[21],
    printed: parseInt(orderData[22]), //int
    timestamp: orderData[23],
    

  };

  console.log(docData);

  await addDoc(collection(db, "Orders"), docData);

}

