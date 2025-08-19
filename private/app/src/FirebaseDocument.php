<?php

namespace HighFlyersUkCouriers;

class FirebaseDocument{

    private $data;

    public function __construct($data = null){
        $this->data = $data;
    }

    public function setData($data){
        $this->data = $data;
    }

    public function getDocument(){
        return $this->data;
    }

    public function getStringField($fieldName) : string{
        return $this->data[$fieldName]['stringValue'];
    }

    public function getIntegerField($fieldName) : int{
        return $this->data[$fieldName]['integerValue'];
    }

    public function getArrayField($fieldName) : FirebaseDocument{
        return new FirebaseDocument($this->data[$fieldName]['arrayValue']['values']);
    }

    public function getMapField($fieldName) : FirebaseDocument{
        return new FirebaseDocument($this->data[$fieldName]['mapValue']['fields']);
    }


}
