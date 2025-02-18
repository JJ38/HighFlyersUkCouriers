<?php

namespace HighFlyersUkCouriers;

use Kreait\Firebase\Contract\Auth;
use MrShan0\PHPFirestore\FirestoreClient;

class ManageAccountsModel
{

    private $logger;
    private $uid;
    private $role;
    private $email;
    /** @var object */
    private $firebase_auth;
    /** @var object */
    private $firebase_firestore;    
    private $credentials;
    private $firebase_auth_result;
    private $firebase_firestore_result;
    private $delete_user_result;

    public function __construct()
    {
        $this->firebase_auth = null;
        $this->firebase_firestore = null;
        $this->logger = null;
        $this->credentials = null;
    }

    public function getDeleteUserResult() : bool{
        return $this->delete_user_result;
    }
    
    public function getFirebaseAuthResult() : bool{
        return $this->firebase_auth_result;
    }

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function setUID($uid){
        $this->uid = $uid;
    }

    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    public function setRole($role) : void{
        $this->role = $role;
    }

    public function setFirebaseAuth($firebase_auth) : void{
        $this->firebase_auth = $firebase_auth;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    }

    public function setCredentials($credentials) : void{
        $this->credentials = $credentials;
    }

    public function createUser() : void{

        if($this->firebase_auth != null){

            try{

                $createdUser = $this->firebase_auth->createUser($this->credentials);
                $this->uid = $createdUser->uid;
                $this->email = $createdUser->email;
                $this->firebase_auth->setCustomUserClaims($this->uid, ['role' => $this->role]);

                $this->firebase_auth_result = true;

            }catch(\Exception $e){
                
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_AUTH_ERROR", array($e));
                    $this->logger->error("FIREBASE_AUTH_ERROR_AUTH", array($this->firebase_auth));
                    $this->logger->error("FIREBASE_AUTH_ERROR_USER", array($createdUser));
    
                }
                
                $this->firebase_auth_result = true;
            }

        }else{
            $this->firebase_auth_result = false;
        }

      
    }

    //Creates document thats stores user roles so they can be view by the admin panel. This does NOT create firebase users or set the roles of firebase users.
    public function createFirestoreUserDocument() : void{

        if($this->firebase_firestore != null){

            try{

                //create docuement in users collection to store roles for admin panel to see role information

                $this->firebase_firestore->addDocument('Users', [
                    'username' => $this->email,
                    'role' => $this->role,
                ], $this->uid);
                
                $this->firebase_firestore_result = true;
    
            }catch (\Exception $e) {
    
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_FIRESTORE_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_PARAMETERS", array($this->email, $this->role));
    
                }

                $this->firebase_firestore_result = false;
              
            }

        }else{
            $this->firebase_firestore_result = false;
        }

      
    }


    public function deleteUser() : void{

        if($this->firebase_firestore != null){

            //remove auth account

    

            try {

                $this->firebase_auth->deleteUser($this->uid);
                $this->firebase_auth_result = true;

            }catch (\Exception $e) {

                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_AUTH_DELETE_ERROR", array($e));
                    $this->logger->error("FIREBASE_AUTH_DELETE_PARAMETERS", array($this->uid));
    
                }
               
                $this->firebase_auth_result = false;
                $this->delete_user_result = false;
                return;
            } 

            try{

                $this->firebase_firestore->deleteDocument('Users/' . $this->uid);
                $this->firebase_firestore_result = true;
                $this->delete_user_result = true;
    
            }catch (\Exception $e) {
    
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_PARAMETERS", array($this->uid));
    
                }

                $this->firebase_firestore_result = false;
                $this->delete_user_result = false;
              
            }

        }else{
            $this->firebase_firestore_result = false;
            $this->delete_user_result = false;
        }

      
    }


    


}