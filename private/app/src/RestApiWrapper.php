<?php

namespace HighFlyersUkCouriers;

use Doctrine\DBAL\Schema\View;
use Exception;
use Kreait\Firebase\Project\ProjectId;

class RestApiWrapper{

    private $logger;
    private $access_token;
    private $project_ID;
    private $database_name;
    private $firebase_firestore_result;
    private $latest_document;
    private $latest_multi_documents;


    public function setLogger($logger){
        $this->logger = $logger;
    }

    public function setAccessToken($access_token){
        $this->access_token = $access_token;
    }

    public function getFirebaseFirestoreResult(){
        return $this->firebase_firestore_result;
    }

    public function getDocument(){
        return $this->latest_document;
    }

    public function getMultiDocuments(){
        return $this->latest_multi_documents;
    }

    public function initialiseConfig() : bool{

        try{

            $env = parse_ini_file(realpath('../.env'));
        
            $this->project_ID = $env['FIREBASE_PROJECT_ID'];
            $this->database_name = $env['FIREBASE_FIRESTORE_DATABASE_NAME'];

            if($this->project_ID == null || $this->database_name == null){
                throw new Exception;
            }

            return true;

        }catch(Exception $e){

            if($this->logger != null){

                $this->logger->error('REST_API_WRAPPER_GET_CONFIG_ERROR_PROJECTID', array($this->project_ID));
                $this->logger->error('REST_API_WRAPPER_GET_CONFIG_ERROR_DATABASENAME', array($this->database_name));
                $this->logger->error('REST_API_WRAPPER_GET_CONFIG_ERROR_EXCEPTION', array($e));

            }

            return false;

        }

        return true;
        
    }
    
    public function fetchDocument($path){

        //using curl as firestore library didnt like document structure

        try{

            $url = "https://firestore.googleapis.com/v1/projects/{$this->project_ID}/databases/{$this->database_name}/documents/{$path}";

            $ch = $this->createRequest($url);
            
            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                echo 'Curl error: ' . curl_error($ch);
                $this->firebase_firestore_result = false;

                if ($this->logger !== null) {
                    $this->logger->error("FIREBASE_FIRESTORE_FETCH_DOCUMENT_CURL_ERROR", array(curl_error($ch)));
                }

                return;

            } 

            $data = json_decode($response, true);


            if ($this->isValidDocument($data, $path)) {

                $this->firebase_firestore_result = false;
                curl_close($ch);
                return;
            }

            curl_close($ch);

            $this->latest_document = $data;

            $this->firebase_firestore_result = true;

        }catch(Exception $e){

           $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_FETCH_DOCUMENT_EXCEPTION", array($e));

            }

        }

    }

    public function fetchMultipleDocuments($paths){

        try{

            $mh = curl_multi_init();
            $ch_handles = [];

            for($i = 0; $i < sizeof($paths); $i++){

                $path = $paths[$i];

                $url = "https://firestore.googleapis.com/v1/projects/{$this->project_ID}/databases/{$this->database_name}/documents/{$path}";

                $ch = $this->createRequest($url);
                curl_multi_add_handle($mh, $ch);
                $ch_handles[$path] = $ch;

            }

            $running = null;

            // Execute the requests
            do {
                curl_multi_exec($mh, $running);
            } while ($running > 0);

            // Get the results
            $responses = [];
            foreach ($ch_handles as $key => $ch) {

                $data = json_decode(curl_multi_getcontent($ch), true);
            
                if(curl_errno($ch)){

                    $this->firebase_firestore_result = false;
                    curl_multi_close($mh);
                    return;

                }

                if(!$this->isValidDocument($data, $key)){

                    $this->firebase_firestore_result = false;

                    curl_multi_close($mh);
                    return;  
                    
                }

                $responses[$key] = $data;

                curl_multi_remove_handle($mh, $ch);

            }

            curl_multi_close($mh);

            $this->latest_multi_documents = $responses;

            $this->firebase_firestore_result = true;

        }catch(Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_FETCH_MULTIPLE_DOCUMENTS_EXCEPTION", array($e));

            }

        }

    }

    private function createRequest($url){

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$this->access_token}",
            "Content-Type: application/json"
        ]);

        return $ch;

    }

    private function isValidDocument($data, $key) : bool{

        if(isset($data['name']) && isset($data['fields'])){
            return true;
        }

        if (isset($data['error'])) {

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
                $this->logger->error("FIREBASE_FIRESTORE_INVALID_DOCUMENT_ERROR", array($data['error']['message']));
                $this->logger->error("FIREBASE_FIRESTORE_INVALID_DOCUMENT_ERROR", array($key));
            }   

            return false;
        }

        if ($this->logger !== null) {
            $this->logger->error("FIREBASE_FIRESTORE_INVALID_DOCUMENT_UNKNOWN_ERROR", array($key));
        }   

    
        return false;
    }
}