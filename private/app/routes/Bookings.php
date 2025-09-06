<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use HighFlyersUkCouriers\FirebaseDocument as FirebaseDocument;
use Datetime;
use DateTimeZone;


$app->get('/bookings[/invalidform]', function (Request $request, Response $response, $args) use ($app) : Response{

  $allGetVars = $_GET;

  if(!empty($allGetVars)){
    if(!empty($allGetVars['invalidform'])){
      $tainted_invalid_form = $allGetVars['invalidform'];
      $sanitizer = $app->getContainer()->get('sanitizer');
      $cleaned_invalid_form = $sanitizer->sanitizeBoolean($tainted_invalid_form);

      if($cleaned_invalid_form != null){

        if($cleaned_invalid_form === "false"){
          echo "<script>alert('Booking confirmed - You should recieve an email shortly confirming your booking');</script>";
        }else{

          if(!empty($allGetVars['errormessage'])){

            $cleaned_error_message = $sanitizer->sanitizeString($allGetVars['errormessage']);

            echo "<script>alert('invalid form - {$cleaned_error_message}');</script>";

          }else{

            echo "<script>alert('invalid form - please submit a valid form');</script>";

          }

        }
      }
    }
    else if(!empty($allGetVars['error'])){
      $tainted_error = $allGetVars['error'];
      $sanitizer = $app->getContainer()->get('sanitizer');
      $cleaned_error = $sanitizer->sanitizeString($tainted_error);

      if($cleaned_error != null){

        if($cleaned_error === "true"){
          echo "<script>alert('Unable to book currently - Please try again later');</script>";
        }
      }
    }
  }

  $env = parse_ini_file(realpath('../.env'));

  $api_key = $env['MAPS_JAVASCRIPT_API_KEY'];

  return $this->view->render($response,'bookings.html', array(
          'places_api_key' => $api_key,
          'page_title' => APP_TITLE,
          'css_file' => CSS_PATH . "NewBooking.css",
          'css_nav_file' => CSS_PATH . "NavigationBar.css",
          'css_footer_file' => CSS_PATH . "Footer.css",
          'asset_path' => ASSET_PATH,
          'landing_page' => __FILE__,
          'heading_1' => APP_TITLE,
          
      ));
});

$app->post('/bookings', function (Request $request, Response $response) use ($app) : Response
{

  $container = $app->getContainer();
  $logger = $container->get("logger"); 
  $tainted_parameters = $request->getParsedBody();

  if($logger != null){
    $logger->error('BOOKING_FORM_POST', array($tainted_parameters));
  }

  
  $manage_order_model = $container->get('manageOrderModel');

  $cleaned_parameters = $manage_order_model->cleanOrder($tainted_parameters, $app);

  //if one of the parameters does not meet requirements

  if(empty($cleaned_parameters)){
    
    $error_message = $manage_order_model->getErrorMessage();
    $error_input_value = $manage_order_model->getErrorInputValue();

    $logger->error("BOOKING-FORM-ERROR", $tainted_parameters);

    return $response->withRedirect('/bookings?invalidform=true&errormessage=' . $error_message . '&inputvalue=' . $error_input_value, 301);
    
  }

  //if cleaned and ready to send emails and store


  //get delivery week
 
  $delivery_week = $manage_order_model->getDeliveryWeek('PUBLIC');

  $cleaned_parameters['delivery_week'] = $delivery_week;

  //store in database
  $logger = $container->get('logger');

  $add_order_model = $container->get('addOrderModel');
  //add in order id
  putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); 

  $container = $app->getContainer();

  //store in database
  $logger = $container->get('logger');
  $add_order_model = $container->get('addOrderModel');
  $session_wrapper = $container->get('sessionWrapper');
  $authentication_model = $container->get('authenticationModel');
 

  $authentication_model->setLogger($logger);
  $authentication_model->fetchOAuth2Token();

  $access_token = $authentication_model->getOAuth2Token();
  

  
  //finance

  $finance_model = $container->get('financeModel');
  $rest_API_wrapper = $container->get('restAPIWrapper');

  $rest_API_wrapper->setLogger($logger);
  $rest_API_wrapper->setAccessToken($access_token);

  $finance_model->setLogger($logger);
  $finance_model->setOrderData($cleaned_parameters);

  $manage_order_model->setRESTAPIWrapper($rest_API_wrapper);
  $manage_order_model->setFinanceModel($finance_model);
  $manage_order_model->calculateOrderPrice();

  $cleaned_parameters['price'] = $finance_model->getOrderPrice();




 //store order

  $firestore = $authentication_model->getAuthenticatedFirebaseClient();

  if($firestore == null){
    return $response->withRedirect('/bookings?error=dberror', 302);
  }

  $date_time = new DateTime();
  $date_time->setTimezone(new DateTimeZone('Europe/London'));

  $add_order_model->setDateTime($date_time);
  $add_order_model->setLogger($logger);
  $add_order_model->setOrderData($cleaned_parameters);
  $add_order_model->setSessionWrapper($session_wrapper);
  $add_order_model->setFirebaseFirestore($firestore);
  $add_order_model->setOAuth2Token($access_token);
  $add_order_model->storeOrder();
 
 
  $query_result = $add_order_model->getFirebaseFirestoreResult();

  if($logger != null){
    $logger->error('BOOKING_FORM_POST_STORE_RESULT', array($query_result));
  }


  if(!$query_result){   
    
    return $response->withRedirect('/bookings?error=true', 301);
  }

  $cleaned_parameters['ID'] = $add_order_model->getOrderID();


  //TODO: popups for database error

  //send email

  $mailer = $container->get('mailer');
  $mailer_settings = $container->get('settings')['mailerBookingSettings'];
  $mailer->setMailerSettings($mailer_settings);
  $mailer->setLogger($logger);

  $mailer->setMailData($cleaned_parameters);
  $mailer->sendMailCustomer();
  $mailer->sendMailInternal();

  return $response->withRedirect('/bookings?invalidform=false', 302);

})->setName('bookings');


function cleanBookingForm($app, array $tainted_parameters) : array
{
    $cleaned_parameters = array();
    $sanitized_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');
    $validator = $app->getContainer()->get('validator');

    //convert postcodes to uppercase
    $tainted_parameters['collectionPostcode'] = strtoupper($tainted_parameters['collectionPostcode']);
    $tainted_parameters['deliveryPostcode'] = strtoupper($tainted_parameters['deliveryPostcode']);


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

    $sanitized_parameters['payment'] = $sanitizer->sanitizeString($tainted_parameters['payment']);
    $cleaned_parameters['payment_option'] = $validator->validatePaymentOption($sanitized_parameters['payment']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

    $sanitized_parameters['delivery_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['deliveryTelephone']);
    $cleaned_parameters['delivery_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['delivery_phone_number']);

    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }


    $sanitized_parameters['collection_phone_number'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['collectionTelephone']);
    $cleaned_parameters['collection_phone_number'] = $validator->validatePhoneNumber($sanitized_parameters['collection_phone_number']);
    if(!$validator->getValidationResult()){
      $cleaned_parameters = array();
      return $cleaned_parameters;
    }

  
    $cleaned_parameters['username'] = "";
    $cleaned_parameters['code'] = "";
    $cleaned_parameters['added_by'] = "";

    $cleaned_parameters['animal_type'] = $sanitizer->sanitizeString($tainted_parameters['animalType']);
    $cleaned_parameters['collection_name'] = $sanitizer->sanitizeString($tainted_parameters['collectionName']);

    $cleaned_parameters['collection_address_1'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress1']);
    $cleaned_parameters['collection_address_2'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress2']);
    $cleaned_parameters['collection_address_3'] = $sanitizer->sanitizeString($tainted_parameters['collectionAddress3']);
    $cleaned_parameters['collection_postcode'] = $sanitizer->sanitizeString($tainted_parameters['collectionPostcode']);
    $cleaned_parameters['delivery_name'] = $sanitizer->sanitizeString($tainted_parameters['deliveryName']);
    $cleaned_parameters['delivery_address_1'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress1']);
    $cleaned_parameters['delivery_address_2'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress2']);
    $cleaned_parameters['delivery_address_3'] = $sanitizer->sanitizeString($tainted_parameters['deliveryAddress3']);
    $cleaned_parameters['delivery_postcode'] = $sanitizer->sanitizeString($tainted_parameters['deliveryPostcode']);

    $cleaned_parameters['message'] = $sanitizer->sanitizeString($tainted_parameters['message']);

    return $cleaned_parameters;
}
