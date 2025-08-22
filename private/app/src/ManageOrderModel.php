<?php

namespace HighFlyersUkCouriers;

use Datetime;
use DateTimeZone;
use HighFlyersUkCouriers\FinanceModel;
use HighFlyersUkCouriers\RestApiWrapper;

class ManageOrderModel
{

  private $doctrine_wrapper;
  private $order_data;
  private $HTML_order_data;
  private $confirmed_orders;
  private $error_message;
  private $error_input_value;
  private $add_order_model;
  private RestApiWrapper $rest_API_wrapper;
  private FinanceModel $finance_model;
  private $logger;



  public function getOrderData() : array|null //for testing purposes
  {
    return $this->order_data;
  }

  public function getConfirmedOrders() : array|null //for testing purposes
  {
    return $this->confirmed_orders;
  }

  public function getQueryResult(){
    return $this->doctrine_wrapper->getQueryResult();
  }

  public function getHTMLOrderData() : string
  {
    return $this->HTML_order_data;
  }

  public function getErrorMessage() : string
  {
    return $this->error_message;
  }

  public function getErrorInputValue() : string
  {
    return $this->error_input_value;
  }
  
  public function getFinanceModel() : FinanceModel
  {
    return  $this->finance_model;
  }
  
  public function setLogger($logger) : void
  {
    $this->logger = $logger;
  }

  public function setDoctrineWrapper($doctrine_wrapper) : void
  {
    $this->doctrine_wrapper = $doctrine_wrapper;
  }

  public function setRESTAPIWrapper($rest_API_wrapper) : void
  {
    $this->rest_API_wrapper = $rest_API_wrapper;
  }

  public function setFinanceModel($finance_model) : void
  {
    $this->finance_model = $finance_model;
  }

  public function setOrderData($order_data) : void
  {
    $this->order_data = $order_data;
  }

  public function setAddOrderModel($add_order_model) : void
  {
    $this->add_order_model = $add_order_model;
  }

  public function deleteOrderById(string $id) : void
  {
    $this->doctrine_wrapper->deleteOrderById($id);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
  }

  public function fetchAllOrderData() : void
  {

    $this->doctrine_wrapper->fetchAllOrderData();
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
    $this->translateData();
  }

  public function fetchOrderDataByField(string $field_name, string $value) : void
  { 

    if($field_name == "printed"){
      if($value == "Not Printed"){
        $value = 0;
      }elseif($value == "Printed"){
        $value = 1;
      }
    }

    $this->doctrine_wrapper->fetchOrderDataByField($field_name, $value);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
    $this->translateData();

  }

  public function fetchOrderDataByFieldAndMultipleValues(string $field_name, array $value) : void
  {
    $this->doctrine_wrapper->fetchOrderDataByFieldAndMultipleValues($field_name, $value);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
    $this->translateData();
  }

  private function translateData(){
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      if($this->order_data[$i]['printed'] == 0){
        $this->order_data[$i]['printed'] = "Not Printed";
      }else{
        $this->order_data[$i]['printed'] = "Printed";
      }
    }
  }

  public function cleanOrder($tainted_parameters, $app){

    $cleaned_parameters = array();
    $sanitized_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');
    $validator = $app->getContainer()->get('validator');

    $this->error_message = "error";

    //convert postcodes to uppercase
    $tainted_parameters['collection_postcode'] = strtoupper($tainted_parameters['collectionPostcode']);
    $tainted_parameters['delivery_postcode'] = strtoupper($tainted_parameters['deliveryPostcode']);


    $cleaned_parameters = array();
    $sanitized_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');
    $validator = $app->getContainer()->get('validator');

    
    $sanitized_parameters['quantity'] = $sanitizer->sanitizePositiveNumber($tainted_parameters['quantity']);
    $cleaned_parameters['quantity'] = $validator->validatePositiveNumber($sanitized_parameters['quantity']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid quantity";
      $this->error_input_value = $tainted_parameters['quantity'];
      return $cleaned_parameters;
    }

    $sanitized_parameters['email'] = $sanitizer->sanitizeEmail($tainted_parameters['email']);
    $cleaned_parameters['email'] = $validator->validateEmail($sanitized_parameters['email']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid email";
      $this->error_input_value = $tainted_parameters['email'];

      return $cleaned_parameters;
    }

    $sanitized_parameters['payment_option'] = $sanitizer->sanitizeString($tainted_parameters['payment']);
    $cleaned_parameters['payment_option'] = $validator->validatePaymentOption($sanitized_parameters['payment_option']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid payment option";
      $this->error_input_value = $tainted_parameters['payment'];
      return $cleaned_parameters;
    }

    $sanitized_parameters['delivery_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['deliveryPhoneNumber']);
    $cleaned_parameters['delivery_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['delivery_phone_number']);

    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid delivery phone number";
      $this->error_input_value = $tainted_parameters['deliveryPhoneNumber'];
      return $cleaned_parameters;
    }

    $sanitized_parameters['collection_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['collectionPhoneNumber']);
    $cleaned_parameters['collection_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['collection_phone_number']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid collection phone number";
      $this->error_input_value = $tainted_parameters['collectionPhoneNumber'];
      return $cleaned_parameters;
    }

    if(array_key_exists('code', $tainted_parameters)){
      $cleaned_parameters['code'] = $sanitizer->sanitizeString($tainted_parameters['code']);
    }else{
      $cleaned_parameters['code'] = "";
    }

    if(array_key_exists('username', $tainted_parameters)){
      $cleaned_parameters['username'] = $sanitizer->sanitizeString($tainted_parameters['username']);
    }else{
      $cleaned_parameters['username'] = "";
    }
      
    if(array_key_exists('addedBy', $tainted_parameters)){
      $cleaned_parameters['added_by'] = $sanitizer->sanitizeString($tainted_parameters['addedBy']);
    }else{
      $cleaned_parameters['added_by'] = "";
    }
      
    if(array_key_exists('deliveryWeek', $tainted_parameters)){
      $cleaned_parameters['delivery_week'] = $sanitizer->sanitizePositiveNumber($tainted_parameters['deliveryWeek']);
    }else{
      $cleaned_parameters['delivery_week'] = null;
    }

    if(array_key_exists('printed', $tainted_parameters)){
      $cleaned_parameters['printed'] = $sanitizer->sanitizeString($tainted_parameters['printed']);
    }else{
      $cleaned_parameters['printed'] = "Not Printed";
    }

    if(array_key_exists('price', $tainted_parameters)){
      $cleaned_parameters['price'] = $sanitizer->sanitizePrice($tainted_parameters['price']);
    }else{
      $cleaned_parameters['price'] = null;
    }


    $cleaned_parameters['animal_type'] = $sanitizer->sanitizeString($tainted_parameters['animal_type']);
    $cleaned_parameters['animal_type'] = htmlspecialchars_decode($cleaned_parameters['animal_type']);

    $cleaned_parameters['collection_name'] = $sanitizer->sanitizeString($tainted_parameters['collectionName']);
    $cleaned_parameters['collection_address_1'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress1']);
    $cleaned_parameters['collection_address_2'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress2']);
    $cleaned_parameters['collection_address_3'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress3']);
    $cleaned_parameters['collection_postcode'] = $sanitizer->sanitizeString($tainted_parameters['collection_postcode']);
    $cleaned_parameters['delivery_name'] = $sanitizer->sanitizeString($tainted_parameters['deliveryName']);
    $cleaned_parameters['delivery_address_1'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress1']);
    $cleaned_parameters['delivery_address_2'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress2']);
    $cleaned_parameters['delivery_address_3'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress3']);
    $cleaned_parameters['delivery_postcode'] = $sanitizer->sanitizeString($tainted_parameters['delivery_postcode']);
    $cleaned_parameters['message'] = $sanitizer->sanitizeString($tainted_parameters['message']);
  

    return $cleaned_parameters;
  }

  
  public function cleanMultipleOrders($tainted_parameters, $app, $account_name){

    //assemble order

    $number_of_orders = count($tainted_parameters['collection']);
    $cleaned_orders = [];

    $delivery_week = $this->getDeliveryWeek('CUSTOMER');

    for($i = 1; $i < $number_of_orders + 1; $i++){
      $tainted_order = [];

      $tainted_order['animal_type'] = $tainted_parameters['collection'][$i][0];
      $tainted_order['quantity'] = $tainted_parameters['collection'][$i][1];
      $tainted_order['collectionName'] = $tainted_parameters['collection'][$i][2];
      $tainted_order['collectionAddress1'] = $tainted_parameters['collection'][$i][3];
      $tainted_order['collectionAddress2'] = $tainted_parameters['collection'][$i][4];
      $tainted_order['collectionAddress3'] = $tainted_parameters['collection'][$i][5];
      $tainted_order['collectionPostcode'] = $tainted_parameters['collection'][$i][6];
      $tainted_order['collectionPhoneNumber'] = $tainted_parameters['collection'][$i][7];
  
      $tainted_order['deliveryName'] = $tainted_parameters['delivery'][$i][0];
      $tainted_order['deliveryAddress1'] = $tainted_parameters['delivery'][$i][1];
      $tainted_order['deliveryAddress2'] = $tainted_parameters['delivery'][$i][2];
      $tainted_order['deliveryAddress3'] = $tainted_parameters['delivery'][$i][3];
      $tainted_order['deliveryPostcode'] = $tainted_parameters['delivery'][$i][4];
      $tainted_order['deliveryPhoneNumber'] = $tainted_parameters['delivery'][$i][5];
      
      $tainted_order['email'] = $tainted_parameters['extra'][$i][0];
      $tainted_order['payment'] = $tainted_parameters['extra'][$i][1];
      $tainted_order['code'] = $tainted_parameters['extra'][$i][2];
      $tainted_order['message'] = $tainted_parameters['extra'][$i][3];


      $tainted_order['username'] = $account_name;

      $tainted_order['printed'] = "Not Printed";
  
      $cleaned_order = $this->cleanOrder($tainted_order, $app);

      if(empty($cleaned_order)){
        return [];
      }

      $cleaned_order['delivery_week'] = intval($delivery_week);


      $cleaned_orders[$i] = $cleaned_order;
    }

    return $cleaned_orders;
  
  }


  public function storeMultipleOrders() : bool{

    $this->confirmed_orders = [];
    $confirmed_orders = [];

    for($i = 1; $i < count($this->order_data) + 1; $i++){ 

      $this->add_order_model->setOrderData($this->order_data[$i]);
      $this->add_order_model->storeOrder();
      $store_result = $this->add_order_model->getFirebaseFirestoreResult();
      $this->order_data[$i]['ID'] = $this->add_order_model->getOrderID();

      if(!$store_result){
        return false;
      }
      //add order data to confirmed orders
      
      $confirmed_orders[$i] = $this->order_data[$i];
    
    }

    $this->confirmed_orders = $confirmed_orders;

    return true;
    
  }

  public function updatePrinted(){

    for($i = 0; $i < count($this->order_data); $i++){ 

      $store_result = $this->getQueryResult();
      if(!$store_result){
        return false;
      }
      //add order data to confirmed orders
      // $this->confirmed_orders[$i] = $this->order_data[$i];
    }

    return true;
  }


  public function getDeliveryWeek($order_type) : int{

    $current_date = new DateTime();
    $current_date->setTimezone(new DateTimeZone('Europe/London'));


    $delivery_date = new DateTime();
    $delivery_date->setTimezone(new DateTimeZone('Europe/London'));


    //public cutoff sunday 4pm
    //customer cutoff monday 12pm

    //is it sunday or monday?
    if(($current_date->format('D') == "Sun" || $current_date->format('D') == "Mon")){
    
      //is it after 4pm sunday and a public order
      if($order_type == "PUBLIC"){ //$current_date->format('H')
        //public order

    
        
        //is it after 4pm on sunday
        if($current_date->format('D') == "Sun" && $current_date->format('H') >= 16){
          //delivery tuesday after next
          $delivery_date->modify('next monday')->modify('next monday');
        }else if($current_date->format('D') == "Mon"){
          $delivery_date->modify('next monday');
        }else{

          //delivery next tuesday
          $delivery_date->modify('next monday');
        }
        
      }else{
        //customer order

        //is it after 12pm on Monday
        if($current_date->format('D') == "Mon" && $current_date->format('H') >= 12){
          //delivery tuesday after next
          $delivery_date->modify('next monday');
        
        }else if($current_date->format('D') == "Sun"){

          //delivery next tuesday
          $delivery_date->modify('next monday');
        }

      }

    }else{
      //else delivery next tuesday
      $delivery_date->modify('next monday');
    }

    // echo $current_date->format('M-d');
    //$current_date->modify('next tuesday');

    $delivery_week = intval($delivery_date->format('W'));

    return $delivery_week; 

  }

  public function calculateOrderPrice(){

    $initialise_success = $this->rest_API_wrapper->initialiseConfig();

    if(!$initialise_success){
      return;
    }

    $this->rest_API_wrapper->fetchMultipleDocuments(['Settings/birdSpecies', 'Settings/priceDefinitions']);
    $successfully_fetched_documents = $this->rest_API_wrapper->getFirebaseFirestoreResult();

    if(!$successfully_fetched_documents){
      return;
    }

    $multi_documents = $this->rest_API_wrapper->getMultiDocuments();

    $prices_firebase_document = $multi_documents['Settings/birdSpecies'];
    $postcodes_firebase_document = $multi_documents['Settings/priceDefinitions'];

    $this->finance_model->setPricesDocument($prices_firebase_document);
    $this->finance_model->setPostcodesDocument($postcodes_firebase_document);
    $this->finance_model->calculateOrderPrice();

  }

}
