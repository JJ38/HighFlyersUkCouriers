import { auth } from "/js/Firebase.js";
import { onAuthStateChanged } from "firebase/auth";

const adminLinks = document.querySelectorAll(".adminLink");

let role;

onAuthStateChanged(auth, (user) => {

  if (user) {

    auth.currentUser.getIdTokenResult().then(async (getIdTokenResult) => {

        role = getIdTokenResult.claims.role;

      if(role != "admin" && role != "staff"){
        showNotification("Error!", "Invalid permissions");
        return;
      }

      roleBasedAccess();

    });
  };
      
});

function roleBasedAccess(){

    if(role == "admin"){

        if(adminLinks != null){

        for(const link of adminLinks){
            
            link.classList.remove("hidden");

        }

        }

    }

}