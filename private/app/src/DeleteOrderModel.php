<?php

namespace HighFlyersUkCouriers;

use Ramsey\Uuid\Type\Integer;

class DeleteOrderModel
{
    private $firebase_firestore_result;
    private $firebase_firestore;
    private $doc_ref;
    private $logger;

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    } 

    public function setDocRef($doc_ref){
        $this->doc_ref = $doc_ref;
    }
    
    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    public function deleteOrder(){

        try{
        
            $this->firebase_firestore->deleteDocument('Orders/' . $this->doc_ref);

            $this->firebase_firestore_result = true;

        }catch(\Exception $e){

            $this->firebase_firestore_result = false;

            if ($this->logger !== null) {
    
                $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR", array($e));
                $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR_FIRESTORE_CLIENT", array($this->firebase_firestore));
                $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR_PARAMETERS", array());

            }

        }
    }


}