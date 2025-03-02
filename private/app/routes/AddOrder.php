<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Kreait\Firebase\Contract\Auth;
use Kreait\Firebase\Firestore;
use MrShan0\PHPFirestore\FirestoreClient;
use DateTime;

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

  $account_type = $request->getAttribute('accountType');

  if(!$account_type == "admin" || !$account_type == "staff"){

    var_dump($account_type);
    return $response;

    return $response->withRedirect("/loginpage", 301);

  }

  $tainted_parameters = $request->getParsedBody();
  //$tainted_parameters["printed"] = "0"; //default not printed value for newly added orders
 
  $container = $app->getContainer();
  $manage_order_model = $container->get('manageOrderModel');

  $cleaned_parameters = $manage_order_model->cleanOrder($tainted_parameters, $app);

  //if one of the parameters does not meet requirements

  if(empty($cleaned_parameters)){

    $error_message = "Error (No parameters were posted - connection error)"; //default error message
    
    $error_message = $manage_order_model->getErrorMessage();

    return $response->withRedirect("/manage-orders?addorder=$error_message", 301);
  }
  
  $username = $request->getAttribute('username');
  $cleaned_parameters['added_by'] = $username;

  if(empty($cleaned_parameters['delivery_week'])){//if delivery week empty
    //add delivery week in
    $cleaned_parameters['delivery_week'] = $manage_order_model->getDeliveryWeek("CUSTOMER");
  }


  //add in order id
  putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); 

  $container = $app->getContainer();

  //store in database
  $logger = $container->get('logger');
  $add_order_model = $container->get('addOrderModel');
  $session_wrapper = $container->get('sessionWrapper');

  $date_time = new DateTime();
  $date_time->setTimezone(new DateTimeZone('Europe/London'));
  $add_order_model->setDateTime($date_time);


  try{
            
    $env = parse_ini_file(realpath('../.env'));

    $projectID = $env['FIREBASE_PROJECT_ID'];
    $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];

    $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
        'database' => '(default)',
    ]);

    $add_order_model->setFirebaseFirestore($firestore);

  }catch(Exception $e){

      if($logger != null){
          $logger->error('FIREBASE_INIT_ERROR', array($e));
          $logger->error('FIREBASE_INIT_ENV', array($env));
      }

      return $response->withRedirect('/manage-accounts?error=dberror', 302);

  }


  
  $add_order_model->setLogger($logger);
  $add_order_model->setOrderData($cleaned_parameters);
  $add_order_model->setSessionWrapper($session_wrapper);

 

  //store data
  $add_order_model->storeOrder();
  $query_result = $add_order_model->getFirebaseFirestoreResult();

  if($query_result){    

    return $response->withRedirect('/manage-orders?addorder=true', 301);

  }

  return $response->withRedirect('/manage-orders?addorder=dberror', 301);

})->setName('add-orders');
