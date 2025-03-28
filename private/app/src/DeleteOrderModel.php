<?php

namespace HighFlyersUkCouriers;

use Ramsey\Uuid\Type\Integer;

class DeleteOrderModel
{
    private $firebase_firestore_result;
    private $firebase_firestore;
    private $doc_ref;
    private $doc_ref_array;
    private $logger;
    private $unsuccessfullyDeletedTally;

    public function getFirebaseFirestoreResult() : bool{
        return $this->firebase_firestore_result;
    }

    public function getUnsuccessfullyDeletedTally() : int{
        return $this->unsuccessfullyDeletedTally;
    }

    public function setFirebaseFirestore($firebase_firestore) : void{
        $this->firebase_firestore = $firebase_firestore;
    } 

    public function setDocRef($doc_ref){
        $this->doc_ref = $doc_ref;
    }

    public function setDocRefArray($doc_ref_array){
        $this->doc_ref_array = $doc_ref_array;
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

    public function bulkDeleteOrder(){

        $successfullyDeletedTally = 0;

        for($i = 0; $i < count($this->doc_ref_array); $i++){

            try{
        
                $this->firebase_firestore->deleteDocument('Orders/' . $this->doc_ref_array[$i]);
                
                $successfullyDeletedTally++;

            }catch(\Exception $e){

                if ($this->logger !== null) {
        
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR", array($e));
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR_FIRESTORE_CLIENT", array($this->firebase_firestore));
                    $this->logger->error("FIREBASE_FIRESTORE_DELETE_ORDER_ERROR_PARAMETERS", array());
    
                }
    
            }
    
        }

        if(count($this->doc_ref_array) ==  $successfullyDeletedTally){

            $this->firebase_firestore_result = true;
            return;

        }

        $this->firebase_firestore_result = false;

        $this->unsuccessfullyDeletedTally = count($this->doc_ref_array) -  $successfullyDeletedTally;

        
    }


}