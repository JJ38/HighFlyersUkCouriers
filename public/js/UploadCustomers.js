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
    username: orderData[1],
    email: orderData[2],
    collectionName: orderData[3],
    collectionPhoneNumber: orderData[4],
    collectionAddress1: orderData[5],
    collectionAddress2: orderData[6],
    collectionAddress3: orderData[7],
    collectionPostcode: orderData[8],
    timestamp: orderData[9]
  
  };

  console.log(docData);

  
  await addDoc(collection(db, "Customers"), docData);
}