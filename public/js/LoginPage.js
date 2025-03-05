import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore"; 
import { getFirestore } from "firebase/firestore";

const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loader = document.getElementById('loader');
var loginButton = document.getElementById('loginButton');

// TODO: Replace the following with your app's Firebase project configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

loginButton.addEventListener('click', login);

async function login(){

    //input validation (e.g password length)

    //show loading symbol and disable button
    loginButton.style.display = "none";
    loader.style.display = "block";

    const usernameValue = usernameInput.value.replace(" ", "") + "@placeholder.com";
    const passwordValue = passwordInput.value;

    console.log(usernameValue);

    var accessToken = "";

    if(usernameValue && passwordValue){

            await signInWithEmailAndPassword(auth, usernameValue, passwordValue)
        .then((userCredential) => {
            // Signed in 

            console.log(userCredential.user.accessToken);
            accessToken = userCredential.user.accessToken;

            var input = document.createElement('input');
            input.id = "accessToken";
            input.name = "accessToken";
            input.value = accessToken;
            input.style.display = "none";
            loginForm.append(input);
            loginForm.submit();
            
        })
        .catch((error) => {

            console.log("error signing into firebase");

            switch (error.code){

            
                case "auth/invalid-credential":

                    //alert("incorrect username and password");
                    //post top backend to check if legacy account exists

                    console.log("checking for legacy account");
                   
                    fetch("login-legacy", {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({ username: usernameInput.value, password: passwordValue})
                      }).then(async (response) => {
                        console.log(response.status + "second login attempt");

                        switch (response.status){

                            case 204:
                                console.log("case 204");
                                //sign in front end to firebase as account has been created
                                await signInWithEmailAndPassword(auth, usernameValue, passwordValue)
                                .then((userCredential) => {
                                    // Signed in 
                        
                                    console.log(userCredential.user.accessToken);
                                    accessToken = userCredential.user.accessToken;
                        
                                    var input = document.createElement('input');
                                    input.id = "accessToken";
                                    input.name = "accessToken";
                                    input.value = accessToken;
                                    input.style.display = "none";
                                    loginForm.append(input);
                                    loginForm.submit();
                                    
                                })
                                .catch((error) => {
                                    console.log(error);
                                    alert("Error signing in please try again later");
                                });
                                
                                break;

                            case 401:

                                alert("Error code 401: Invalid username and password");
                                break;

                            case 500:

                                alert("Error code 500: Error signing in please try again later");
                                break;
                        }
                        
                      });

                    break;
                
                case "auth/invalid-email":
                    alert("invalid username " +  usernameInput.value);
                    usernameInput.value = "";
            
                    break;

                default:
                    alert("error  " + error.code + error.message);
                    break;
            }
        
        });

        // post form to login on the backend aswell
      
    }

    //show login button symbol and disable loader
    loginButton.style.display = "block";
    loader.style.display = "none";


}

