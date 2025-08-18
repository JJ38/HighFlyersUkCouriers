<?php

namespace HighFlyersUkCouriers;

use MrShan0\PHPFirestore\FirestoreClient;


class FinanceModel
{

    private $totalPrice;
    private $firebase_firestore_result;
    private $firebase_firestore;
    private $logger;
    private $access_token;
    private $prices;
    private $orders;

    public function getTotalPrice(){
        return $this->totalPrice;
    }

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    } 

    public function setLogger($logger){
        $this->logger = $logger;
    }

    public function setAccessToken($access_token){
        $this->access_token = $access_token;
    }

    public function setOrders($orders){
        $this->orders = $orders;
    }

    public function fetchPrices(){

        //using curl as firestore library didnt like document structure
        try{
            $env = parse_ini_file(realpath('../.env'));
        
            $projectID = $env['FIREBASE_PROJECT_ID'];
            $database = $env['FIREBASE_FIRESTORE_DATABASE_NAME'];
        

            $url = "https://firestore.googleapis.com/v1/projects/{$projectID}/databases/{$database}/documents/Settings/birdSpecies";

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer {$this->access_token}",
                "Content-Type: application/json"
            ]);

            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                echo 'Curl error: ' . curl_error($ch);
                $this->firebase_firestore_result = false;

                if ($this->logger !== null) {
                    $this->logger->error("FIREBASE_FIRESTORE_FETCH_PRICES_CURL_ERROR", array(curl_error($ch)));
                }

                return;

            } 

            $data = json_decode($response, true);

            var_dump($data);

            if (isset($data['error'])) {

                $this->firebase_firestore_result = false;

                if ($this->logger !== null) {
                    $this->logger->error("FIREBASE_FIRESTORE_FETCH_PRICES_ERROR", array($data['error']['message']));
                }

                return;
            }

            curl_close($ch);

            $this->prices = $data;

            $this->firebase_firestore_result = true;


        }catch(\Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_FETCH_PRICES_ERROR", array($e));
                $this->logger->error("FIREBASE_FIRESTORE_FETCH_PRICES_FIRESTORE_CLIENT", array($this->firebase_firestore));

            }

        }

    }

}