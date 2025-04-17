<?php

namespace HighFlyersUkCouriers;

class Sanitizer
{
    private $santizeResult;

    public function __construct() {}

    public function __destruct() {}

    /**
     * Sanitises Username.
     *
     * @param string $tainted_user_name
     * @return mixed|string
     */

     public function sanitizePhoneNumber(string $tainted_string) : string | null
     {
       $cleaned_string = '';

       if (!empty($tainted_string)) {
           $cleaned_string = preg_replace('/[^0-9]|/', '', $tainted_string);
      }

       return $cleaned_string;


     }

     public function sanitizeUsername(string $tainted_string) : string
     {
         $cleaned_string = '';

         if (!empty($tainted_string)
             && strlen($tainted_string) <= 30) {
             $cleaned_string = filter_var(
                 $tainted_string,
                 FILTER_SANITIZE_FULL_SPECIAL_CHARS, //replaced FILTER_SANITIZE_STRING
                 FILTER_FLAG_NO_ENCODE_QUOTES
             );
         }

         return $cleaned_string;
     }

    public function sanitizeString($tainted_string) : string
    {
        $cleaned_string = '';

        if (!empty($tainted_string)) {
            $cleaned_string = filter_var(
                $tainted_string,
                FILTER_SANITIZE_FULL_SPECIAL_CHARS, //replaced FILTER_SANITIZE_STRING
                FILTER_FLAG_NO_ENCODE_QUOTES
            );
        }

        return $cleaned_string;
    }

    public function sanitizeEmail($tainted_email) : string
    {
      $cleaned_email = '';

      if (!empty($tainted_email)) {
          $cleaned_email = filter_var(
              $tainted_email,
              FILTER_SANITIZE_EMAIL, //replaced FILTER_SANITIZE_STRING
              FILTER_FLAG_NO_ENCODE_QUOTES
          );
      }

      return $cleaned_email;

    }

    public function sanitizePositiveNumber($tainted_number) : int
    {

      $cleaned_number = filter_var($tainted_number, FILTER_SANITIZE_NUMBER_INT);
      if(empty($cleaned_number)){
        $cleaned_number = 0;
      }
      return $cleaned_number;

    }

    public function sanitizePositiveNumberString($tainted_string) : string
    {

      $cleaned_string = '';

      if (!empty($tainted_string)) {
          $cleaned_string = preg_replace('/[^0-9]|/', '', $tainted_string);
     }

      return $cleaned_string;

    }

    public function sanitizeBoolean($tainted_bool) : string|null
    {
      $cleaned_bool = null;
      if($tainted_bool != null){
        if($tainted_bool == "true"){
          $cleaned_bool = "true";

        }else if($tainted_bool == "false"){
          return "false";

        }else{
          $cleaned_bool = null;
        }
      }
      return $cleaned_bool;
    }

    
    public function sanitizeAccountType($tainted_account_type) : string|null
    {
      
      if($tainted_account_type == "staff"){
        return "staff";
      }
      if($tainted_account_type == "admin"){
        return "admin";

      }if($tainted_account_type == "customer"){
        return "customer";
      }
      
      return null;
      
    
    }

}
