<?php

namespace HighFlyersUkCouriers;

class ManageOrderModel
{

  private $doctrine_wrapper;
  private $order_data;
  private $HTML_order_data;

  public function getOrderData() : array|null //for testing purposes
  {
    return $this->order_data;
  }

  public function getHTMLOrderData() : string
  {
    return $this->HTML_order_data;
  }

  public function setDoctrineWrapper($doctrine_wrapper) : void
  {
    $this->doctrine_wrapper = $doctrine_wrapper;
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
    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    
    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';

      $HTML = $HTML . '<td><input type="checkbox" id="' . $this->order_data[$i]['id'] . '" name="' . $this->order_data[$i]['id'] . '" value="' . $this->order_data[$i]['id'] . '"></td>';

      for ($j = 0; $j < count($this->order_data[$i]); $j++) {
        $HTML = $HTML . "<td>{$this->order_data[$i][$headers[$j]]}</td>";
      }

      $HTML = $HTML . '<td class="orderbuttons"><a href="/HighFlyersUkCouriers/public/edit-order?id=' . $this->order_data[$i]['id'] .'"><button>edit</button></a><a href="/HighFlyersUkCouriers/public/delete-order?id=' . $this->order_data[$i]['id'] .'"><button type="button">Delete</button></a><a class="print"><button type="button">Print</button></a></td>';
      $HTML = $HTML . '</tr>';
    }

    $this->HTML_order_data = $HTML;

  }

  public function generateHTMLForEditData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Timestamp');

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
    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Collection Name', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Collection Phone Number','Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Timestamp');

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
    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_name', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'collection_phone_number', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    
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

}
