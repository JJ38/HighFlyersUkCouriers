<?php

namespace HighFlyersUkCouriers;

class ManageOrderModel
{

  private $doctrine_wrapper;
  private $order_data;
  private $HTML_order_data;

  public function getOrderData() : array //for testing purposes
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


  public function fetchAllOrderData() : void
  {

    $this->doctrine_wrapper->fetchAllOrderData();
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
  }

  public function fetchOrderDataById(string $id) : void
  {

    $this->doctrine_wrapper->fetchOrderDataById($id);
    $this->order_data = $this->doctrine_wrapper->getQueryResult();
  }

  public function generateHTMLFromData() : void
  {

    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_phone_number', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');

    $HTML = '';
    $number_of_orders = count($this->order_data);
    for ($i = 0; $i < $number_of_orders; $i++) {
      $HTML = $HTML . '<tr>';
        for ($j = 0; $j < count($this->order_data[$i]); $j++) {
          $HTML = $HTML . "<td>{$this->order_data[$i][$headers[$j]]}</td>";
        }

      $HTML = $HTML . '<td><a href="/HighFlyersUkCouriers/public/edit-order?id=' . $number_of_orders - $i .'"><button>edit</button></a><button type="button">Delete</button> <button type="button">Print</button></td>';
      $HTML = $HTML . '</tr>';
    }

    $this->HTML_order_data = $HTML;

  }

  public function generateHTMLForEditData() : void
  {
    $headers = array('id', 'animal_type', 'quantity', 'email', 'collection_phone_number', 'collection_address_1', 'collection_address_2', 'collection_address_3', 'collection_postcode', 'delivery_name', 'delivery_address_1', 'delivery_address_2', 'delivery_address_3', 'delivery_postcode', 'delivery_phone_number', 'payment_option', 'message', 'timestamp');
    $form_fields = array('ID', 'Animal Type', 'Quantity', 'Email', 'Collection Phone Number', 'Collection Address 1', 'Collection Address 2', 'Collection Address 3', 'Collection Postcode', 'Delivery Name', 'Delivery Address 1', 'Delivery Address 2', 'Delivery Address 3', 'Delivery Postcode', 'Delivery Phone Number', 'Payment Option', 'Message', 'Timestamp');

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
    $HTML = $HTML . '<td>' . 'Timestamp' . '</td>'; //<label for="fname">First name:</label>
    $HTML = $HTML . '<td>' . $this->order_data[0]['timestamp'] . "</td>";
    $HTML = $HTML . '</tr>';

    $this->HTML_order_data = $HTML;

  }

}
