<?php

namespace HighFlyersUkCouriers;

class ManageOrderModel
{

  private $doctrine_wrapper;
  private $order_data;
  private $HTML_order_data;
  private $confirmed_orders;

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

  public function setDoctrineWrapper($doctrine_wrapper) : void
  {
    $this->doctrine_wrapper = $doctrine_wrapper;
  }

  public function setOrderData($order_data) : void
  {
    $this->order_data = $order_data;
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
  }

  public function fetchOrderDataByField(string $field_name, string $value) : void
  {

    $this->doctrine_wrapper->fetchOrderDataByField($field_name, $value);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
  }

  public function fetchOrderDataByFieldAndMultipleValues(string $field_name, array $value) : void
  {

    $this->doctrine_wrapper->fetchOrderDataByFieldAndMultipleValues($field_name, $value);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
  }

  public function generateHTMLFromData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    
    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';

      $HTML = $HTML . '<td><input type="checkbox" id="' . $this->order_data[$i]['id'] . '" name="' . $this->order_data[$i]['id'] . '" value="' . $this->order_data[$i]['id'] . '"></td>';

      for ($j = 0; $j < count($this->order_data[$i]); $j++) {
        $HTML = $HTML . "<td>{$this->order_data[$i][$headers[$j]]}</td>";
      }

      $HTML = $HTML . '<td class="orderbuttons"><a href="/edit-order?id=' . $this->order_data[$i]['id'] .'"><button>edit</button></a><a href="/delete-order?id=' . $this->order_data[$i]['id'] .'"><button type="button">Delete</button></a><a class="print"><button type="button">Print</button></a></td>';
      $HTML = $HTML . '</tr>';
    }

    $this->HTML_order_data = $HTML;

  }

  public function generateHTMLForEditData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Account', 'Delivery Week','Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Timestamp');

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
      $HTML = $HTML . '<td>' . "<input type=\"text\" id=\"" . $headers[$i] ."\"name=\"" . $headers[$i] . "\" value=\"" . $this->order_data[0][$headers[$i]] . "\"></td>";
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
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Account', 'Delivery Week','Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Timestamp');
    $HTML = '';
    $number_of_fields = count($this->order_data[0]);

    //TODO: Accessibility

    for ($i = 0; $i < $number_of_fields ; $i++) {
      $HTML = $HTML . '<tr>';
      $HTML = $HTML . '<td>' . $form_fields[$i] . '</td>'; //<label for="fname">First name:</label>
      $HTML = $HTML . '<td>' . $this->order_data[0][$headers[$i]];
      $HTML = $HTML . '</tr>';
    }

    $this->HTML_order_data = $HTML;
  }

  public function generateHTMLForMultipleDelete() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'username', 'delivery_week', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    
    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';

      for ($j = 0; $j < count($this->order_data[$i]); $j++) {
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
      return $cleaned_parameters;
    }

    $sanitized_parameters['email'] = $sanitizer->sanitizeEmail($tainted_parameters['email']);
    $cleaned_parameters['email'] = $validator->validateEmail($sanitized_parameters['email']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

    $sanitized_parameters['payment_option'] = $sanitizer->sanitizeString($tainted_parameters['payment_option']);
    $cleaned_parameters['payment_option'] = $validator->validatePaymentOption($sanitized_parameters['payment_option']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

   

    $sanitized_parameters['delivery_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['delivery_phone_number']);
    $cleaned_parameters['delivery_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['delivery_phone_number']);

    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

    $sanitized_parameters['collection_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['collection_phone_number']);
    $cleaned_parameters['collection_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['collection_phone_number']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

    

    $cleaned_parameters['username'] = $sanitizer->sanitizeString($tainted_parameters['username']);
    $cleaned_parameters['delivery_week'] = $sanitizer->sanitizeString($tainted_parameters['delivery_week']);
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
      $tainted_order['message'] = $tainted_parameters['extra'][$i][2];

      $tainted_order['username'] = $account_name;
  
      $cleaned_order = $this->cleanOrder($tainted_order, $app);

      if(empty($cleaned_order)){
        return [];
      }

      $cleaned_orders[$i] = $cleaned_order;
    }

    return $cleaned_orders;
  
  }


  public function storeMultipleOrders(){

    $this->confirmed_orders = [];

    for($i = 1; $i < count($this->order_data) + 1; $i++){ 
      $this->doctrine_wrapper->storeOrderData($this->order_data[$i]);
      $store_result = $this->getQueryResult();
      if(!$store_result){
        return false;
      }
      //add order data to confirmed orders
      $this->confirmed_orders[$i] = $this->order_data[$i];
    }

    return true;
    
  }

}
