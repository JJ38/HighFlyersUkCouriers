import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, addDoc, updateDoc} from "firebase/firestore";
import { replace } from "lodash";

const uploadButton = document.getElementById('upload');
const runName = document.getElementById('run_name');

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
const db = getFirestore(app, 'development');

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

  console.log("parse file");
 
  const taintedPostcodes = fileData.split(',');

  console.log(taintedPostcodes);
  const cleanedPostcodes = cleanPostcodes(taintedPostcodes);
  console.log(cleanedPostcodes);

  //add to firebase document
  updateDocument(cleanedPostcodes);
}

function cleanPostcodes(postcodeArray){

  let cleanedPostcodes = {};
  let tempPostcode = null;

  console.log(postcodeArray.length);

  for(let i = 0; i < postcodeArray.length; i++){

    tempPostcode = postcodeArray[i];

    tempPostcode = tempPostcode.replace("\r", "");
    tempPostcode = tempPostcode.replace("\n", "");
    tempPostcode = tempPostcode.replace(" ", "");

    console.log(tempPostcode);
    if(tempPostcode != ""){
      cleanedPostcodes[tempPostcode] = runName.value;
    }

  }

  return cleanedPostcodes; 

}

async function updateDocument(data){

  const docRef = doc(db, "Settings", "runDefinitions");

  // Set the "capital" field of the city 'DC'
  await updateDoc(docRef, data);

}