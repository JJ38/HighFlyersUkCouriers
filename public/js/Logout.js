import { auth } from "/js/firebase.js";
import { signOut } from "firebase/auth";

const logoutButtons = document.querySelectorAll(".logoutButton");


for(const logoutButton of logoutButtons){

    if(logoutButton != null){

        logoutButton.addEventListener('click', () => {
            console.log("clicked logout");
    
            if(auth == null){
                console.log("error logging out");
                return;
            } 
        
            signOut(auth).then(() => {
                // Sign-out successful.
                window.location.href = window.location.origin + "/logout";
              }).catch((error) => {
                // An error happened
                console.log(error);
              });
        
        });
        
    
    }
    
}

