<?php

namespace HighFlyersUkCouriers;

use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Exception\Auth\EmailExists;
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
    private $customer_profile;
    private $error_code;

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

    public function getErrorCode(){
        return $this->error_code;
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

    public function setCustomerProfile($customer_profile) : void{
        $this->customer_profile = $customer_profile;
    }

    public function createUser() : void{

        if($this->firebase_auth != null){

            try{

                $createdUser = $this->firebase_auth->createUser($this->credentials);
                $this->uid = $createdUser->uid;
                $this->email = $createdUser->email;
                $this->firebase_auth->setCustomUserClaims($this->uid, ['role' => $this->role]);

                $this->firebase_auth_result = true;

            }catch(EmailExists $e){

                $this->firebase_auth_result = false;
                $this->error_code = 400;

                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_AUTH_EMAIL_EXISTS", array($e));
                    $this->logger->error("FIREBASE_AUTH_EMAIL_EXISTS_AUTH", array($this->firebase_auth));
                    $this->logger->error("FIREBASE_AUTH_EMAIL_EXISTS_USER", array($createdUser));
                    $this->logger->error("FIREBASE_AUTH_EMAIL_EXISTS_CREDENTIALS", array($this->credentials));
    
                }

                
            }catch(\Exception $e){
                
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_AUTH_ERROR", array($e));
                    $this->logger->error("FIREBASE_AUTH_ERROR_AUTH", array($this->firebase_auth));
                    $this->logger->error("FIREBASE_AUTH_ERROR_USER", array($createdUser));
                    $this->logger->error("FIREBASE_AUTH_ERROR_CREDENTIALS", array($this->credentials));
    
                }
                
                $this->firebase_auth_result = false;
                var_dump($e);
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
    
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_USER_DOCUMENT_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_USER_DOCUMENT_PARAMETERS", array($this->email, $this->role));
    
                }

                $this->firebase_firestore_result = false;
              
            }

        }else{
            $this->firebase_firestore_result = false;
        }

      
    }

    public function createFirestoreCustomerDocument() : void{

        if($this->firebase_firestore != null){
            
            //$customer_profile will be null if there is an error fetching it from the legacy database or creating a new customer account
            if($this->customer_profile == null){
                $this->customer_profile['collection_address_1'] = "";
                $this->customer_profile['collection_address_2'] = "";
                $this->customer_profile['collection_address_3'] = "";
                $this->customer_profile['collection_name'] = "";
                $this->customer_profile['collection_phone_number'] = "";
                $this->customer_profile['collection_postcode'] = "";
                $this->customer_profile['email'] = "";
            }


            try{

                //create document in customer collection to store profile information
                $this->firebase_firestore->addDocument('Customers', [
                    'collectionAddress1' => $this->customer_profile['collection_address_1'],
                    'collectionAddress2' => $this->customer_profile['collection_address_2'],
                    'collectionAddress3' => $this->customer_profile['collection_address_3'],
                    'collectionName' => $this->customer_profile['collection_name'],
                    'collectionPhoneNumber' => $this->customer_profile['collection_phone_number'],
                    'collectionPostcode' => $this->customer_profile['collection_postcode'],
                    'email' => $this->customer_profile['email'],
                ], $this->uid);
                
                $this->firebase_firestore_result = true;
    
            }catch (\Exception $e){
    
                if ($this->logger !== null){
    
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_CUSTOMER_DOCUMENT_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_CUSTOMER_DOCUMENT_PARAMETERS", array($this->email, $this->role));
    
                }

                $this->firebase_firestore_result = false;
              
            }

        }else{
            $this->firebase_firestore_result = false;
        }

      
    }


    public function createFirestoreDriverDocument() : void{

        if($this->firebase_firestore != null){

            try{

                //create docuement in users collection to store roles for admin panel to see role information

                $this->firebase_firestore->addDocument('Drivers', [
                    'assignedRuns' => [],
                    'driverName' => str_replace("@placeholder.com", "", $this->email),
                    'driverStatus' => "Offline",                 
                ], $this->uid);
                
                $this->firebase_firestore_result = true;
    
            }catch (\Exception $e) {
    
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_DRIVER_DOCUMENT_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_CREATE_DRIVER_DOCUMENT_PARAMETERS", array($this->email, $this->role));
    
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
    
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_USER_DOCUMENT_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_USER_DOCUMENT_PARAMETERS", array($this->uid));
    
                }

                $this->firebase_firestore_result = false;
                $this->delete_user_result = false;

                return;
              
            }

            try{

                $this->firebase_firestore->deleteDocument('Customers/' . $this->uid);
                $this->firebase_firestore_result = true;
                $this->delete_user_result = true;
    
            }catch (\Exception $e) {
    
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_CUSTOMER_DOCUMENT_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_CUSTOMER_DOCUMENT_PARAMETERS", array($this->uid));
    
                }

                $this->firebase_firestore_result = false;
                $this->delete_user_result = false;
                
                return;

            }

        }else{
            $this->firebase_firestore_result = false;
            $this->delete_user_result = false;
        }

      
    }

    public function changeUserPassword($newPassword) : void{

        if($this->firebase_auth != null){

            try{

                $this->firebase_auth->changeUserPassword($this->uid, $newPassword);
                $this->firebase_auth_result = true;

            }catch(\Exception $e){
                
                if ($this->logger !== null) {
    
                    $this->logger->error("FIREBASE_AUTH_CHANGEPASSWORD_ERROR", array($e));
                    $this->logger->error("FIREBASE_AUTH_CHANGEPASSWORD_ERROR_AUTH", array($this->firebase_auth));
        
                }
                
                $this->firebase_auth_result = false;
            }

        }else{
            $this->firebase_auth_result = false;
        }

      
    }


}