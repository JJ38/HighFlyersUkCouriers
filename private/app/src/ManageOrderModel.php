<?php

namespace HighFlyersUkCouriers;

use Datetime;
use DateTimeZone;

class ManageOrderModel
{

  private $doctrine_wrapper;
  private $order_data;
  private $HTML_order_data;
  private $confirmed_orders;
  private $is_admin;
  private $error_message;
  private $error_input_value;


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

  public function setDoctrineWrapper($doctrine_wrapper) : void
  {
    $this->doctrine_wrapper = $doctrine_wrapper;
  }

  public function setOrderData($order_data) : void
  {
    $this->order_data = $order_data;
  }

  public function setIsAdmin($is_admin){
    $this->is_admin = $is_admin;
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

  public function generateHTMLFromData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'code', 'added_by', 'printed', 'timestamp');
    
    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';

      $HTML = $HTML . '<td><input type="checkbox" id="' . $this->order_data[$i]['id'] . '" name="' . $this->order_data[$i]['id'] . '" value="' . $this->order_data[$i]['id'] . '" onclick="highlightorder(this)"></td>';

      for ($j = 0; $j < count($this->order_data[$i]); $j++) {
        if($headers[$j] == "delivery_week"){

          $week_colour = "white";

          $week_number = intval($this->order_data[$i][$headers[$j]]);

          switch ($week_number % 8) {
            case 0:
              $week_colour = "red";
              break;

            case 1:
              $week_colour = "green";
              break;

            case 2:
              $week_colour = "yellow";
              break;

            case 3:
              $week_colour = "blue";
              break;

            case 4:
              $week_colour = "#B5651D";
              break;

            case 5:
              $week_colour = "#CBC3E3";
              break;

            case 6:
              $week_colour = "pink";
              break;

            case 7:
              $week_colour = "orange";
              break;

            default:
              $week_colour = "white";

        }

          $HTML = $HTML . "<td style=\"background-color: {$week_colour}\">{$this->order_data[$i][$headers[$j]]}</td>";
        }else{
          $HTML = $HTML . "<td>{$this->order_data[$i][$headers[$j]]}</td>";
        }
      }

      $HTML = $HTML . '<td class="orderbuttons">';
      

      $HTML = $HTML . '<a class="print"><button type="button">Print</button></a>';
      $HTML = $HTML . '<a href="/view-order?id=' . $this->order_data[$i]['id'] .'"><button type="button">View</button></a>';

      if($this->is_admin || empty($this->order_data[$i]['username'])){
        $HTML = $HTML . '<a href="/edit-order?id=' . $this->order_data[$i]['id'] .'"><button>Edit</button></a>';
      }
     

      if($this->is_admin){
        $HTML = $HTML . '<a href="/delete-order?id=' . $this->order_data[$i]['id'] .'"><button type="button">Delete</button></a>';
       
      }

      $HTML = $HTML . '</TD></tr>';
    }

    $this->HTML_order_data = $HTML;

  }

  public function generateHTMLForEditData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'code', 'added_by', 'printed', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Account', 'Delivery Week','Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Code', 'Added By', 'Printed', 'Timestamp');

    $HTML = '';
    $number_of_fields = count($this->order_data[0]);

    //TODO: Accessibility
    $HTML = $HTML . '<tr>';
    $HTML = $HTML . '<td>' . 'ID' . '</td>'; //<label for="fname">First name:</label>
    $HTML = $HTML . '<td>' . $this->order_data[0]['id'] . "</td>";
    $HTML = $HTML . '</tr>';


    for ($i = 1; $i < $number_of_fields - 1; $i++) {
      $HTML = $HTML . '<tr>';
      $HTML = $HTML . '<td>' . $form_fields[$i] . '</td>'; //<label for="fname">First name:</label>
      if($form_fields[$i] == "Printed"){

        $HTML = $HTML . '<td>' . '<select name="printed" id="printed" required="">';  

        if($this->order_data[0][$headers[$i]] == "Printed"){
          $HTML = $HTML . '<option value="Printed" selected>Printed</option><option value="Not Printed">Not Printed</option>';
        }else{
          $HTML = $HTML . '<option value="Printed">Printed</option><option value="Not Printed" selected>Not Printed</option>';

        }

        $HTML = $HTML . '</select>' . "</td>";

      }else if($form_fields[$i] == "Added By"){
      
        $HTML = $HTML . '<td>' . $this->order_data[0]['added_by'] . "</td>";
        

      }else if($form_fields[$i] == "Delivery Week" && !$this->is_admin){  //if staff member
      
        $HTML = $HTML . '<td>' . $this->order_data[0]['delivery_week'] . "</td>";
        
      }

      else if($form_fields[$i] == "Account" && !$this->is_admin){  //if staff member
        
        $HTML = $HTML . '<td>' . $this->order_data[0]['username'] . "</td>";
        
      }

      
      else if($form_fields[$i] == "Delivery Week"){ 
        
        $HTML = $HTML . '<td>' . "<input type=\"number\" id=\"" . $headers[$i] ."\"name=\"" . $headers[$i] . "\" value=\"" . $this->order_data[0][$headers[$i]] . "\" min=\"1\" max=\"53\"></td>";

      }

    

      else if($form_fields[$i] == "Message"){ 
        
        $HTML = $HTML . '<td>' . "<textarea id=\"message\" name=\"message\" rows=\"8\" wrap=\"soft\">" . $this->order_data[0][$headers[$i]] . "</textarea></td>";

      }
      
      else{

        $HTML = $HTML . '<td>' . "<input type=\"text\" id=\"" . $headers[$i] ."\"name=\"" . $headers[$i] . "\" value=\"" . $this->order_data[0][$headers[$i]] . "\"></td>";
      
      }

      $HTML = $HTML . '</tr>';
    }

    $HTML = $HTML . '<tr>';
    $HTML = $HTML . '<td>' . 'Timestamp' . '</td>'; 
    $HTML = $HTML . '<td>' . $this->order_data[0]['timestamp'] . "</td>";
    $HTML = $HTML . '</tr>';

    $this->HTML_order_data = $HTML;

  }

  public function generateHTMLForDeleteData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'code', 'added_by', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Account', 'Delivery Week','Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Code', 'Added By', 'Timestamp');
    $HTML = '';
    $number_of_fields = count($this->order_data[0]);

    //TODO: Accessibility

    for ($i = 0; $i < $number_of_fields - 1; $i++) {

      $HTML = $HTML . '<tr>';
      $HTML = $HTML . '<td>' . $form_fields[$i] . '</td>';

      if($form_fields[$i] == "Message"){
        $HTML = $HTML . '<td><p class="message">' . $this->order_data[0][$headers[$i]] . '</p>';
      }else{
         //<label for="fname">First name:</label>
        $HTML = $HTML . '<td>' . $this->order_data[0][$headers[$i]];
      }

     
      $HTML = $HTML . '</td></tr>';
    }

    $this->HTML_order_data = $HTML;
  }

  public function generateHTMLForMultipleDelete() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'code', 'added_by', 'timestamp');
    
    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';

      for ($j = 0; $j < count($this->order_data[$i]) - 1; $j++) { //-1 to account for not showing isprinted
        $HTML = $HTML . "<td>{$this->order_data[$i][$headers[$j]]}</td>";
      }

      $HTML = $HTML . '</tr>';
    }

    $this->HTML_order_data = $HTML;

  }


  public function cleanOrder($tainted_parameters, $app){

    $cleaned_parameters = array();
    $sanitized_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');
    $validator = $app->getContainer()->get('validator');

    $this->error_message = "error";

    //convert postcodes to uppercase
    $tainted_parameters['collection_postcode'] = strtoupper($tainted_parameters['collection_postcode']);
    $tainted_parameters['delivery_postcode'] = strtoupper($tainted_parameters['delivery_postcode']);


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

    $sanitized_parameters['payment_option'] = $sanitizer->sanitizeString($tainted_parameters['payment_option']);
    $cleaned_parameters['payment_option'] = $validator->validatePaymentOption($sanitized_parameters['payment_option']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid payment option";
      $this->error_input_value = $tainted_parameters['payment_option'];
      return $cleaned_parameters;
    }

    $sanitized_parameters['delivery_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['delivery_phone_number']);
    $cleaned_parameters['delivery_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['delivery_phone_number']);

    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid delivery phone number";
      $this->error_input_value = $tainted_parameters['delivery_phone_number'];
      return $cleaned_parameters;
    }

    $sanitized_parameters['collection_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['collection_phone_number']);
    $cleaned_parameters['collection_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['collection_phone_number']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      $this->error_message = "invalid collection phone number";
      $this->error_input_value = $tainted_parameters['collection_phone_number'];
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
      
    if(array_key_exists('added_by', $tainted_parameters)){
      $cleaned_parameters['added_by'] = $sanitizer->sanitizeString($tainted_parameters['added_by']);
    }else{
      $cleaned_parameters['added_by'] = "";
    }
      
    if(array_key_exists('delivery_week', $tainted_parameters)){
      $cleaned_parameters['delivery_week'] = $sanitizer->sanitizeString($tainted_parameters['delivery_week']);
    }else{
      $cleaned_parameters['delivery_week'] = null;
    }

    if(array_key_exists('printed', $tainted_parameters)){
      $cleaned_parameters['printed'] = $sanitizer->sanitizeString($tainted_parameters['printed']);
    }else{
      $cleaned_parameters['printed'] = "Not Printed";
    }


    $cleaned_parameters['animal_type'] = $sanitizer->sanitizeString($tainted_parameters['animal_type']);
    $cleaned_parameters['collection_name'] = $sanitizer->sanitizeString($tainted_parameters['collection_name']);
    $cleaned_parameters['collection_address_1'] = $sanitizer->sanitizeString($tainted_parameters['collection_address_1']);
    $cleaned_parameters['collection_address_2'] = $sanitizer->sanitizeString($tainted_parameters['collection_address_2']);
    $cleaned_parameters['collection_address_3'] = $sanitizer->sanitizeString($tainted_parameters['collection_address_3']);
    $cleaned_parameters['collection_postcode'] = $sanitizer->sanitizeString($tainted_parameters['collection_postcode']);
    $cleaned_parameters['delivery_name'] = $sanitizer->sanitizeString($tainted_parameters['delivery_name']);
    $cleaned_parameters['delivery_address_1'] = $sanitizer->sanitizeString($tainted_parameters['delivery_address_1']);
    $cleaned_parameters['delivery_address_2'] = $sanitizer->sanitizeString($tainted_parameters['delivery_address_2']);
    $cleaned_parameters['delivery_address_3'] = $sanitizer->sanitizeString($tainted_parameters['delivery_address_3']);
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
      $tainted_order['collection_name'] = $tainted_parameters['collection'][$i][2];
      $tainted_order['collection_address_1'] = $tainted_parameters['collection'][$i][3];
      $tainted_order['collection_address_2'] = $tainted_parameters['collection'][$i][4];
      $tainted_order['collection_address_3'] = $tainted_parameters['collection'][$i][5];
      $tainted_order['collection_postcode'] = $tainted_parameters['collection'][$i][6];
      $tainted_order['collection_phone_number'] = $tainted_parameters['collection'][$i][7];
  
      $tainted_order['delivery_name'] = $tainted_parameters['delivery'][$i][0];
      $tainted_order['delivery_address_1'] = $tainted_parameters['delivery'][$i][1];
      $tainted_order['delivery_address_2'] = $tainted_parameters['delivery'][$i][2];
      $tainted_order['delivery_address_3'] = $tainted_parameters['delivery'][$i][3];
      $tainted_order['delivery_postcode'] = $tainted_parameters['delivery'][$i][4];
      $tainted_order['delivery_phone_number'] = $tainted_parameters['delivery'][$i][5];
      
      $tainted_order['email'] = $tainted_parameters['extra'][$i][0];
      $tainted_order['payment_option'] = $tainted_parameters['extra'][$i][1];
      $tainted_order['code'] = $tainted_parameters['extra'][$i][2];
      $tainted_order['message'] = $tainted_parameters['extra'][$i][3];


      $tainted_order['username'] = $account_name;

      $tainted_order['printed'] = "Not Printed";
  
      $cleaned_order = $this->cleanOrder($tainted_order, $app);

      if(empty($cleaned_order)){
        return [];
      }

      $cleaned_order['delivery_week'] = $delivery_week;

      $cleaned_orders[$i] = $cleaned_order;
    }

    return $cleaned_orders;
  
  }


  public function storeMultipleOrders(){

    $this->confirmed_orders = [];

    for($i = 1; $i < count($this->order_data) + 1; $i++){ 

      //get delivery week

      $this->doctrine_wrapper->storeOrderData($this->order_data[$i]);
      $store_result = $this->getQueryResult();

      $this->order_data[$i]['ID'] = $this->doctrine_wrapper->getLastInsertID();

      if(!$store_result){
        return false;
      }
      //add order data to confirmed orders
      $this->confirmed_orders[$i] = $this->order_data[$i];
    }

    return true;
    
  }

  public function updatePrinted(){

    for($i = 0; $i < count($this->order_data); $i++){ 

      $this->doctrine_wrapper->updatePrinted($this->order_data[$i]);

      $store_result = $this->getQueryResult();
      if(!$store_result){
        return false;
      }
      //add order data to confirmed orders
      // $this->confirmed_orders[$i] = $this->order_data[$i];
    }

    return true;
    
  }


  public function getDeliveryWeek($order_type){

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
    return $delivery_date->format('W');

  }

}
