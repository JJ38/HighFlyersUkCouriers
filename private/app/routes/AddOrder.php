<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;



$app->get('/add-order', function (Request $request, Response $response, $args) use ($app) : Response{

  
  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin" || $account_type == "staff"){


    $env = parse_ini_file(realpath('../.env'));

    $api_key = $env['MAPS_JAVASCRIPT_API_KEY'];

    return $this->view->render($response,'add-order.html', array(
            'places_api_key' => $api_key,
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "AddOrder.css",
            'asset_path' => ASSET_PATH,
            'js_path' => JS_PATH . "",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            'isAdmin' => $account_type == "admin",
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
    }

    return $response->withRedirect('loginpage', 301);
    
});


$app->post('/add-order', function (Request $request, Response $response) use ($app) : Response
{

  $tainted_parameters = $request->getParsedBody();
  //$tainted_parameters["printed"] = "0"; //default not printed value for newly added orders
 

  $container = $app->getContainer();
  $manage_order_model = $container->get('manageOrderModel');

  $cleaned_parameters = $manage_order_model->cleanOrder($tainted_parameters, $app);

  //if one of the parameters does not meet requirements



  if(empty($cleaned_parameters)){

    $error_message = "Error (No parameters where posted - connection error)"; //default error message

    $error_message = $manage_order_model->getErrorMessage();


    return $response->withRedirect("/manage-orders?addorder=$error_message", 301);
  }

  
  $username = $request->getAttribute('username');
  $cleaned_parameters['added_by'] = $username;


  if(empty($cleaned_parameters['delivery_week'])){//if delivery week empty
    //add delivery week in

    $cleaned_parameters['delivery_week'] = $manage_order_model->getDeliveryWeek("CUSTOMER");

  }


  $container = $app->getContainer();

  //store in database

  
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $logger = $container->get('logger');

  // // Doctrine wrapper setup
  $database_connection_settings = $container->get('settings')['doctrineSettings'];
  try{
    $database_connection = DriverManager::getConnection($database_connection_settings);
  }catch(Exception $e){
    return $response->withRedirect('/manage-orders?error=dbconnection', 301);
  }
  $query_builder = $database_connection->createQueryBuilder();
  $doctrine_wrapper->setQueryBuilder($query_builder);
  $doctrine_wrapper->setDoctrineLogger($logger);
  $doctrine_wrapper->setDatabaseConnection($database_connection);

  //check for duplicate orders


  //store data
  $doctrine_wrapper->storeOrderData($cleaned_parameters);

  $query_result = $doctrine_wrapper->getQueryResult();

  if($query_result){    

    return $response->withRedirect('/manage-orders?addorder=true', 301);

  }

  return $response->withRedirect('/manage-orders?addorder=dberror', 301);


})->setName('add-orders');
