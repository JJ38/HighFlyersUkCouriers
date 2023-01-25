<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/edit-order[/id]', function (Request $request, Response $response) use ($app) : Response{

    $is_authenticated = $request->getAttribute('isAuthenticated');

    if($is_authenticated){

      $allGetVars = $request->getQueryParams();

      if(!empty($allGetVars)){

        $tainted_order_id = $allGetVars['id'];

        $sanitizer = $app->getContainer()->get('sanitizer');
        $validator = $app->getContainer()->get('validator');

        $sanitized_order_id = $sanitizer->sanitizePositiveNumberString($tainted_order_id);
        $cleaned_order_id = $validator->validatePositiveNumberString($sanitized_order_id);
        if(empty($cleaned_order_id)){
          return $response->withRedirect('manage-orders', 302);
        }


        $container = $app->getContainer();
        $logger = $container->get('logger');
        $doctrine_wrapper = $container->get('doctrineWrapper');

        // // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);


        $manage_order_model = $container->get('manageOrderModel');
        $manage_order_model->setDoctrineWrapper($doctrine_wrapper);
        $manage_order_model->fetchOrderDataByField('id', $cleaned_order_id);
        if(empty($manage_order_model->getOrderData())){
          return $response->withRedirect('manage-orders', 302);
        }
        $manage_order_model->generateHTMLForEditData();
        $order_data = $manage_order_model->getOrderData();

        $session_wrapper = $app->getContainer()->get('sessionWrapper');

        $session_wrapper->setSessionVar('id', $order_data[0]['id']);

      }else{
        return  $response->withRedirect('manage-orders', 302);
      }

      //var_export($HTML_order_data);

      //echo '<pre>' . var_export($order_data,true) . '</pre>';

      return $this->view->render($response,'EditOrders.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "EditOrders.css",
              'asset_path' => ASSET_PATH,
              'js_path' => JS_PATH . "",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'orderdata' => $manage_order_model->getHTMLOrderData(),
              'links'=> array(
                  'register' => 'registerform',
                  'login' => 'loginform',
                  'homepage' => '#',
                  'send_initial_messages' => 'sendinitialtelemetrymessages',
                  'present_telemetry' => 'presenttelemetrydata',
                  'manage_users' => 'manageusersform',
                  'send_telemetry' => 'sendtelemetrydata',
                  'logout' => 'logout'
              ),
          ));
    }else{

      return $response->withRedirect('loginpage', 302);
    }
});


$app->post('/edit-order', function (Request $request, Response $response) use ($app) : Response
{

  $tainted_parameters = $request->getParsedBody();

  $cleaned_parameters = cleanEditOrderForm($app, $tainted_parameters);
  //if one of the parameters does not meet requirements

  if(empty($cleaned_parameters)){
    //TODO: popup saying invalid form did not update form

    return $response->withRedirect('/HighFlyersUkCouriers/public/manage-orders?updated=false', 302);
  }

  //if cleaned and ready to send emails and store

  $container = $app->getContainer();

  //store in database
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $logger = $container->get('logger');


  // // Doctrine wrapper setup
  $database_connection_settings = $container->get('settings')['doctrineSettings'];
  $database_connection = DriverManager::getConnection($database_connection_settings);
  $query_builder = $database_connection->createQueryBuilder();
  $doctrine_wrapper->setQueryBuilder($query_builder);
  $doctrine_wrapper->setDoctrineLogger($logger);

  //TODO: make sure id and timestamp are set as session vars before storing

  $doctrine_wrapper->updateOrderDataById($cleaned_parameters);
  $doctrine_wrapper->getQueryResult();

  return $response->withRedirect('/HighFlyersUkCouriers/public/manage-orders?updated=true', 302);


})->setName('edit-orders');

function cleanEditOrderForm($app, array $tainted_parameters) : array
{
    $cleaned_parameters = array();
    $sanitized_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');
    $validator = $app->getContainer()->get('validator');


    $sanitized_parameters['quantity'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['quantity']);
    $cleaned_parameters['quantity'] = $validator->validatePositiveNumber($sanitized_parameters['quantity']);
    //$cleaned_parameters['quantity'] = $tainted_parameters['quantity'];
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

    //$cleaned_parameters['id'] = $tainted_parameters['id'];
    $cleaned_parameters['animal_type'] = $sanitizer->sanitizeString($tainted_parameters['animal_type']);
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

    $session_wrapper = $app->getContainer()->get('sessionWrapper');

    $cleaned_parameters['id'] = $session_wrapper->getSessionVar('id');

    $session_wrapper->unsetSessionVar('id');


    return $cleaned_parameters;
}
