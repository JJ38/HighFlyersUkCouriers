<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/manage-orders[/updated]', function (Request $request, Response $response, $updated="null") use ($app) : Response{



    $is_authenticated = $request->getAttribute('isAuthenticated');

    if($is_authenticated){
      $allGetVars = $_GET;
      // $response->getBody()->write('<pre>' . var_export($allGetVars,true) . '</pre>');
      // return $response;

      $cleaned_field = null;
      $cleaned_filter = null;

      if(!empty($allGetVars)){
        if(!empty($allGetVars['updated'])){
          $tainted_invalid_form = $allGetVars['updated'];
          if($tainted_invalid_form){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_invalid_form = $sanitizer->sanitizeBoolean($tainted_invalid_form);

            if($cleaned_invalid_form != null){

              if($cleaned_invalid_form === "true"){
                echo "<script>alert('Order Updated');</script>";

              }else{
                echo "<script>alert('Order Not Updated - Error');</script>";
              }
            }
          }
        }else if(!empty($allGetVars['addorder'])){
          $tainted_add_order = $allGetVars['addorder'];
          if($tainted_add_order){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_add_order = $sanitizer->sanitizeBoolean($tainted_add_order);

            if($cleaned_add_order != null){

              if($cleaned_add_order === "true"){
                echo "<script>alert('Order Added successfully!');</script>";

              }else{
                echo "<script>alert('Order Not Added - Error');</script>";
              }
            }
          }
        }else if(!empty($allGetVars['field'])){
          if(!empty($allGetVars['filter'])){
            $tainted_field = $allGetVars['field'];
            $tainted_filter = $allGetVars['filter'];

            $cleaned_field = $tainted_field;
            $cleaned_filter = $tainted_filter;
          }

        }

      }

      //generate html order data
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

      if($cleaned_field == null || $cleaned_filter == null){
        $manage_order_model->fetchALLOrderData();
      }else{
        $manage_order_model->fetchOrderDataByField($cleaned_field, $cleaned_filter);
      }

      $manage_order_model->generateHTMLFromData();
      $HTML_order_data = $manage_order_model->getHTMLOrderData();

      // $response->getBody()->write('<pre>' . var_export($manage_order_model->getOrderData(), true) . '</pre>');
      // return $response;



      return $this->view->render($response,'ManageOrders.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageOrders.css",
              'css_nav_file' => CSS_PATH . "NavigationBar.css",
              'css_footer_file' => CSS_PATH . "Footer.css",
              'asset_path' => ASSET_PATH,
              'js_file' => JS_PATH . "ManageOrders.js",
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
