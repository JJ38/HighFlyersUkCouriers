<?php

namespace HighFlyersUkCouriers;

use Ramsey\Uuid\Type\Integer;

class EditOrderModel
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

    public function updateOrder(){

        try{

            $this->firebase_firestore->updateDocument('Orders/' . $this->order_data['docRef'], [
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
            ], true);

            $this->firebase_firestore_result = true;

        }catch(\Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_UPDATE_ORDER_ERROR", array($e));
                $this->logger->error("FIREBASE_FIRESTORE_UPDATE_ORDER_FIRESTORE_CLIENT", array($this->firebase_firestore));
                $this->logger->error("FIREBASE_FIRESTORE_UPDATE_ORDER_PARAMETERS", array($this->order_data));

            }

        }

    }

    























}