<?php

namespace HighFlyersUkCouriers;

use Ramsey\Uuid\Type\Integer;

class AddOrderModel
{
    private $firebase_firestore_result;
    private $firebase_firestore;
    private $order_data;
    private $logger;

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    } 

    public function setOrderData($order_data){
        $this->order_data = $order_data;
    }
    
    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    private function getOrderID() : int{
        

        try{    

            $env = parse_ini_file(realpath('../.env'));
            $firestoreAccessToken = $env['FIREBASE_FIRESTORE_ACCESS_TOKEN'];
            

            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, 'https://firestore.googleapis.com/v1beta1/projects/highflyersukcouriers-a9c17/databases/(default)/documents:commit?key=AIzaSyDNBL3PpPTm6l69jVFbL');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"writes\":[{\"transform\":{\"document\":\"projects/highflyersukcouriers-a9c17/databases/(default)/documents/MetaData/IDTRACKER\",\"fieldTransforms\":[{\"fieldPath\":\"ID\",\"increment\":{\"integerValue\":1}}]}}]}");
            curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');
            
            $headers = array();
            $headers[] = 'Authorization: Bearer ' . $firestoreAccessToken;
            $headers[] = 'Accept: application/json';
            $headers[] = 'Content-Type: application/json';

            
         
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            
            $result = curl_exec($ch);
            if (curl_errno($ch)) {
                echo 'Error:' . curl_error($ch);
            }
            curl_close($ch);

            $result_arr = json_decode($result, true);
            $order_ID = intval($result_arr['writeResults'][0]['transformResults'][0]['integerValue']);

            $this->firebase_firestore_result = false;

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
        
    public function storeOrder() : void{

        //get order ID

        $order_ID = $this->getOrderID();

        if($order_ID == -1){
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
                'collectionAddress_2' => $this->order_data['collection_address_2'],
                'collectionAddress_3' => $this->order_data['collection_address_3'],
                'collectionPostcode' => $this->order_data['collection_postcode'],
                'deliveryName' => $this->order_data['delivery_name'],
                'deliveryAddress_1' => $this->order_data['delivery_address_1'],
                'deliveryAddress_2' => $this->order_data['delivery_address_2'],
                'deliveryAddress_3' => $this->order_data['delivery_address_3'],
                'deliveryPostcode' => $this->order_data['delivery_postcode'],
                'deliveryPhoneNumber' => $this->order_data['delivery_phone_number'],
                'payment' => $this->order_data['payment_option'],
                'message' => $this->order_data['message'],
                'addedBy' => $this->order_data['added_by'],
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


