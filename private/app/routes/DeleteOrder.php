<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/delete-order[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){

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

        $manage_order_model->generateHTMLForDeleteData();
        $order_data = $manage_order_model->getOrderData();

        $session_wrapper = $app->getContainer()->get('sessionWrapper');

        $session_wrapper->setSessionVar('id', $order_data[0]['id']);

      }else{
        return  $response->withRedirect('manage-orders', 302);
      }

      //var_export($HTML_order_data);

      //echo '<pre>' . var_export($order_data,true) . '</pre>';

      return $this->view->render($response,'DeleteOrder.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "DeleteOrder.css",
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
    }

    return $response->withRedirect('loginpage', 302);
    
});

$app->post('/delete-order', function (Request $request, Response $response) use ($app) : Response
{

  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin" || $account_type == "staff"){

    $container = $app->getContainer();

    $doctrine_wrapper = $container->get('doctrineWrapper');
    $logger = $container->get('logger');

    $session_wrapper = $container->get('sessionWrapper');
    $order_id = $session_wrapper->getSessionVar('id');


    // // Doctrine wrapper setup
    $database_connection_settings = $container->get('settings')['doctrineSettings'];
    $database_connection = DriverManager::getConnection($database_connection_settings);
    $query_builder = $database_connection->createQueryBuilder();
    $doctrine_wrapper->setQueryBuilder($query_builder);
    $doctrine_wrapper->setDoctrineLogger($logger);

    $doctrine_wrapper->deleteOrderById($order_id);
    $doctrine_wrapper->getQueryResult();

    return $response->withRedirect('/HighFlyersUkCouriers/public/manage-orders?deleted=true', 302);
  }


})->setName('edit-orders');
