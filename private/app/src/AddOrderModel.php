<?php

namespace HighFlyersUkCouriers;

use Exception;
use Google\Auth\AccessToken;
use Ramsey\Uuid\Type\Integer;

class AddOrderModel
{
    private $firebase_firestore_result;
    private $firebase_firestore;
    private $order_data;
    private $logger;
    private $session_wrapper;
    private $order_ID;
    private $date_time;
    private $access_token;

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function getOrderID(){
        return $this->order_ID;
    }

    public function getOAuth2Token(){
        return $this->access_token;
    }

    public function setOAuth2Token($access_token){
        $this->access_token = $access_token;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    } 

    public function setOrderData($order_data){
        $this->order_data = $order_data;
    }

    public function setSessionWrapper($session_wrapper){
        $this->session_wrapper = $session_wrapper;
    }
    
    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    public function setDateTime($date_time) : void{
        $this->date_time = $date_time;
    }


    public function fetchOAuth2Token(){


        function base64url_encode($data) { 
            return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); 
        }
        
        //Google's Documentation of Creating a JWT: https://developers.google.com/identity/protocols/OAuth2ServiceAccount#authorizingrequests
        
        //{Base64url encoded JSON header}
        $jwtHeader = base64url_encode(json_encode(array(
            "alg" => "RS256",
            "typ" => "JWT"
        )));

        //{Base64url encoded JSON claim set}
        $now = time();
        $jwtClaim = base64url_encode(json_encode(array(
            "iss" => "firebase-adminsdk-fbsvc@highflyersukcouriers-a9c17.iam.gserviceaccount.com",
            "scope" => "https://www.googleapis.com/auth/datastore",
            "aud" => "https://oauth2.googleapis.com/token",
            "exp" => $now + 3600,
            "iat" => $now
        )));


        $env = parse_ini_file(realpath('../.env'));
        $private_key = $env['SERVICE_ACCOUNT_PRIVATE_KEY'];

        $new_private_key = str_replace('\n', "\n", $private_key); //important for formatting. Key wont work otherwise

        //The base string for the signature: {Base64url encoded JSON header}.{Base64url encoded JSON claim set}
        $encryption_result = openssl_sign(
            $jwtHeader.".".$jwtClaim,
            $jwtSig,
            $new_private_key,
            "sha256WithRSAEncryption"
        );

        $jwtSign = base64url_encode($jwtSig);
        
        //{Base64url encoded JSON header}.{Base64url encoded JSON claim set}.{Base64url encoded signature}
        $jwtAssertion = $jwtHeader.".".$jwtClaim.".".$jwtSign;

        $this->logger->error("JWT", array($jwtAssertion));

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" . $jwtAssertion);

        $headers = array();
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }

        $result_arr = json_decode($result, true);
        $access_token = $result_arr['access_token'];
        curl_close($ch);

        $this->access_token = $access_token;

    }


    private function incrementOrderID() : int{

        $accessToken = null;

        try{    

            $accessToken = $this->access_token;

            $this->logger->error("OAUTH2_TOKEN", array($accessToken));
            
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, 'https://firestore.googleapis.com/v1beta1/projects/highflyersukcouriers-a9c17/databases/(default)/documents:commit?key=AIzaSyDNBL3PpPTm6l69jVFbL');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"writes\":[{\"transform\":{\"document\":\"projects/highflyersukcouriers-a9c17/databases/(default)/documents/MetaData/IDTRACKER\",\"fieldTransforms\":[{\"fieldPath\":\"ID\",\"increment\":{\"integerValue\":1}}]}}]}");
            curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');
            
            $headers = array();
            $headers[] = 'Authorization: Bearer ' . $accessToken;
            $headers[] = 'Accept: application/json';
            $headers[] = 'Content-Type: application/json';

        
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            
            $result = curl_exec($ch);
            if (curl_errno($ch)) {

                echo 'Error:' . curl_error($ch);
                curl_close($ch);

                $this->logger->error("FIREBASE_REST_API_ERROR", array($ch));

                return -1;
            }

            curl_close($ch);

            $result_arr = json_decode($result, true);
            $order_ID = intval($result_arr['writeResults'][0]['transformResults'][0]['integerValue']);
            $this->logger->error("ORDER_ID", array($order_ID));
            $this->firebase_firestore_result = true;

            $this->order_ID = $order_ID;

            if($order_ID < 1 || $order_ID == null){

                $this->logger->error("FIREBASE_FIRESTORE_INCREMENT_ORDER_ID_INVALID", array($order_ID));
                $this->logger->error("FIREBASE_FIRESTORE_INCREMENT_ORDER_ID_ERROR", array($result_arr));
                $this->logger->error("FIREBASE_FIRESTORE_INCREMENT_ORDER_ID_ACCESS_TOKEN", array($accessToken));

                $verified_id_token = $this->session_wrapper->getSessionVar('verified_ID_Token');
                $this->logger->error("FIREBASE_FIRESTORE_INCREMENT_ORDER_ID_SESSION_VERIFIED_ID_TOKEN", array($verified_id_token));
               
            }

            return $order_ID;

        }catch(\Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_GET_ORDER_ID_ERROR", array($e));
                $this->logger->error("FIREBASE_FIRESTORE_GET_ORDER_ID_ERROR_FIRESTORE_CLIENT", array($this->firebase_firestore));
                $this->logger->error("FIREBASE_FIRESTORE_GET_ORDER_ID_ERROR_PARAMETERS", array());

            }

        }

        return -1;
    }
        
    public function storeOrder(){

        //get order ID
        $order_ID = $this->incrementOrderID();

        if($order_ID < 1 || $order_ID == null){

            $this->logger->error("FIREBASE_FIRESTORE_GET_ORDER_ID_INVALID", array($order_ID));

            $this->firebase_firestore_result = false;
            return;
        }

        try{

            $this->firebase_firestore->addDocument('Orders', [
                'ID' => $order_ID,
                'animalType' => $this->order_data['animal_type'],
                'quantity' => $this->order_data['quantity'],
                'email' => $this->order_data['email'],
                'code' => $this->order_data['code'],
                'account' => $this->order_data['username'],
                'deliveryWeek' => $this->order_data['delivery_week'],
                'collectionName' => $this->order_data['collection_name'],
                'collectionPhoneNumber' => $this->order_data['collection_phone_number'],
                'collectionAddress1' => $this->order_data['collection_address_1'],
                'collectionAddress2' => $this->order_data['collection_address_2'],
                'collectionAddress3' => $this->order_data['collection_address_3'],
                'collectionPostcode' => $this->order_data['collection_postcode'],
                'deliveryName' => $this->order_data['delivery_name'],
                'deliveryAddress1' => $this->order_data['delivery_address_1'],
                'deliveryAddress2' => $this->order_data['delivery_address_2'],
                'deliveryAddress3' => $this->order_data['delivery_address_3'],
                'deliveryPostcode' => $this->order_data['delivery_postcode'],
                'deliveryPhoneNumber' => $this->order_data['delivery_phone_number'],
                'payment' => $this->order_data['payment_option'],
                'message' => $this->order_data['message'],
                'addedBy' => $this->order_data['added_by'],
                'printed' => 0,
                'timestamp' => $this->date_time->format("Y-m-d H:i:s"),
            ]);

            $this->firebase_firestore_result = true;

        }catch(\Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_ADD_ORDER_ERROR", array($e));
                $this->logger->error("FIREBASE_FIRESTORE_ADD_ORDER_FIRESTORE_CLIENT", array($this->firebase_firestore));
                $this->logger->error("FIREBASE_FIRESTORE_ADD_ORDER_PARAMETERS", array($this->order_data));

            }

        }



    }

}


