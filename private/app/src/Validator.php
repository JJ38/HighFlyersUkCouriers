<?php

namespace HighFlyersUkCouriers;

class Validator
{
    private $validateResult = true;

    public function __construct() {}

    public function __destruct() {}

    public function getValidationResult() : bool
    {
      return $this->validateResult;
    }

    public function validatePaymentOption(string $tainted_payment_option) : string
    {

      $cleaned_option = '';

      if($tainted_payment_option == 'Delivery' || $tainted_payment_option == 'Pickup' || $tainted_payment_option == 'Account')
      {
        $cleaned_option = $tainted_payment_option;
        $this->validateResult = true;
      }else{
        $this->validateResult = false;
      }

      return $cleaned_option;

    }

    public function validatePrinted(string $tainted_payment_option) : string
    {

      $cleaned_option = '';

      if($tainted_payment_option == 'Not Printed' || $tainted_payment_option == 'Printed')
      {
        $cleaned_option = $tainted_payment_option;
        $this->validateResult = true;
      }else{
        $this->validateResult = false;
      }

      return $cleaned_option;

    }


    public function validatePositiveNumber(int $tainted_number) : int
    {

      $cleaned_number = 0;
      if($tainted_number > 0){
        $cleaned_number = filter_var($tainted_number, FILTER_SANITIZE_NUMBER_INT);
        $this->validateResult = true;
      }else{
        $this->validateResult = false;
      }
      return $cleaned_number;

    }

    public function validatePositiveNumberString(string $tainted_number) : string
    {

      $cleaned_number = '';
      if(strlen($tainted_number > 0)){
        $cleaned_number = $tainted_number;
        $this->validateResult = true;

      }else{
        $this->validateResult = false;
      }
      return $cleaned_number;

    }

    public function validatePhoneNumber(string $tainted_number) : string
    {

      $cleaned_number = '';
      if(strlen($tainted_number) > 10 && strlen($tainted_number) < 12){
        $cleaned_number = $tainted_number;
        $this->validateResult = true;

      }else{
        $this->validateResult = false;
      }
      return $cleaned_number;

    }

    public function validateEmail(string $tainted_email) : string
    {

      $cleaned_email = '';

      if(filter_var($tainted_email, FILTER_VALIDATE_EMAIL))
      {
        $this->validateResult = true;
        $cleaned_email = $tainted_email;
      }else{
        $this->validateResult = false;
      }
      return $cleaned_email;

    }

  


}
