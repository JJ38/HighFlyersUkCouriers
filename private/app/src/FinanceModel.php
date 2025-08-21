<?php

namespace HighFlyersUkCouriers;

use Exception;
use MrShan0\PHPFirestore\FirestoreClient;

class FinanceModel
{

    private $order_price;
    private $logger;
    private $prices;
    private $order;
    private FirebaseDocument $price_document;
    private FirebaseDocument $postcodes_document;
    private $finance_result; 

    public function setLogger($logger){
        $this->logger = $logger;
    }

    public function setOrderData($order){
        $this->order = $order;
    }

    public function setPricesDocument($price_document){
        $this->price_document = $price_document;
    }

    public function setPostcodesDocument($postcodes_document){
        $this->postcodes_document = $postcodes_document;
    }

    public function getOrderPrice(){
        return $this->order_price;
    } 
    
    public function getFinanceResult(){
        return $this->finance_result;
    }


    public function calculateOrderPrice(){

        $collection_outward_postcode = $this->getOutwardPostcode($this->order['collection_postcode']);
        $delivery_outward_postcode = $this->getOutwardPostcode($this->order['delivery_postcode']);

        if($collection_outward_postcode == false || $delivery_outward_postcode == false){
            $this->finance_result = false;
            return;
        }

        //get run that each postcode is in
        $collection_run = $this->postcodes_document->getStringField($collection_outward_postcode);
        $delivery_run = $this->postcodes_document->getStringField($delivery_outward_postcode);

        if($collection_run == false || $delivery_run == false){
            $this->finance_result = false;
            return;
        }

        //find price for both collection and delivery postcodes
        $species_prices = $this->getPriceForSpecies();

        if($species_prices == false){
            $this->finance_result = false;
            return;
        }

        //choose higher price
        $collection_run_pricing = $this->getPricingForRun($collection_run, $species_prices);
        $delivery_run_pricing = $this->getPricingForRun($delivery_run, $species_prices);
        

        if($collection_run_pricing == false || $delivery_run_pricing == false){
            $this->finance_result = false;
            return;
        }

        $pricing_to_use_for_order = $this->getHigherRunPricing($collection_run_pricing, $delivery_run_pricing);

        //calculate additional cost if any

        $this->calculateOrderTotalPrice($pricing_to_use_for_order, $species_prices);

        $this->finance_result = true;

    }

    private function getOutwardPostcode($postcode){

        $trimmed_postcode = str_replace(" ", "", $postcode);
        if(strlen($trimmed_postcode) == 7){
            return substr($trimmed_postcode, 0, 4);
        }

        if(strlen($trimmed_postcode) == 6){
            return substr($trimmed_postcode, 0, 3);
        }

        if(strlen($trimmed_postcode) == 5){
            return substr($trimmed_postcode, 0, 1);
        }

        if($this->logger != null){

            $this->logger->error('GET_OUTWARD_POSTCODE_ERROR', array($postcode));

        }

        return false;
    }
    
    private function getPriceForSpecies(){

        $species = $this->price_document->getArrayField('species');

        $number_of_species = sizeof($species->getDocument());

        for($i = 0; $i < $number_of_species; $i++){

            if($species->getMapField($i)->getStringField("name") == $this->order['animal_type']){
                return $species->getMapField($i);
            }
        
        }

        return false;

    }


    private function getPricingForRun($runName, $species_prices){

        $area_prices = $species_prices->getMapField('prices')->getArrayField('areaPrices');
        $number_of_areas = sizeof($area_prices->getDocument());

        for($i = 0; $i < $number_of_areas; $i++){   

            if($area_prices->getMapField($i)->getStringField('area') == $runName){
                return $area_prices->getMapField($i);
            }

        }

        return false;

    }

    private function getHigherRunPricing($collection_run_pricing, $delivery_run_pricing){

        if($collection_run_pricing->getIntegerField('standardPrice') > $delivery_run_pricing->getIntegerField('standardPrice')){

            return $collection_run_pricing;

        }

        return $delivery_run_pricing;

    }

    private function calculateOrderTotalPrice($pricing_to_use_for_order, $species_prices){

        if($this->order['quantity'] < 1){
            $this->order_price = 0;
            return;
        } 

        $tally = $pricing_to_use_for_order->getIntegerField('standardPrice');

        $includedQuantity =  $species_prices->getMapField('prices')->getIntegerField('includedQuantity');

        $excess = $this->order['quantity'] - $includedQuantity;

        if($excess > 0){   
            $tally += ($excess * $pricing_to_use_for_order->getIntegerField('additionalPrice'));
        }   

        $this->order_price = $tally;

    }

}