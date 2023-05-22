<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;



$app->get('/add-order', function (Request $request, Response $response, $args) use ($app) : Response{

  
  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin" || $account_type == "staff"){


    return $this->view->render($response,'AddOrder.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "AddOrder.css",
            'asset_path' => ASSET_PATH,
            'js_path' => JS_PATH . "",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
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

    return $response->withRedirect('loginpage', 302);
    
});


$app->post('/add-order', function (Request $request, Response $response) use ($app) : Response
{

  $tainted_parameters = $request->getParsedBody();
  //$tainted_parameters["printed"] = "0"; //default not printed value for newly added orders


  $container = $app->getContainer();
  $manage_order_model = $container->get('manageOrderModel');

  $cleaned_parameters = $manage_order_model->cleanOrder($tainted_parameters, $app);

  //if one of the parameters does not meet requirements

  // var_dump($tainted_parameters);

  if(empty($cleaned_parameters)){


    return $response->withRedirect('/manage-orders?addorder=false', 302);
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

  //check for duplicate orders


  //store data
  $doctrine_wrapper->storeOrderData($cleaned_parameters);

  $query_result = $doctrine_wrapper->getQueryResult();

  if($query_result){    

    return $response->withRedirect('/manage-orders?addorder=true', 302);

  }

  return $response->withRedirect('/manage-orders?addorder=false', 302);


})->setName('add-orders');
