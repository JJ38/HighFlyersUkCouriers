<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/manage-orders[/updated]', function (Request $request, Response $response, $updated="null") use ($app) : Response{
  
    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){
      $allGetVars = $_GET;

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

        }else if(!empty($allGetVars['deleted'])){
          $tainted_add_order = $allGetVars['deleted'];
          if($tainted_add_order){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_delete_order = $sanitizer->sanitizeBoolean($tainted_add_order);

            if($cleaned_delete_order != null){

              if($cleaned_delete_order === "true"){
                echo "<script>alert('Order Deleted successfully!');</script>";

              }else{
                echo "<script>alert('Orders Not Deleted - Error');</script>";
              }
            }
          }
        }else if(!empty($allGetVars['printerror'])){
          $tainted_print_error = $allGetVars['printerror'];
          if($tainted_print_error){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_print_error = $sanitizer->sanitizeBoolean($tainted_print_error);

            if($cleaned_print_error != null){

              if($cleaned_print_error === "false"){
                echo "<script>alert('Orders marked as printed successfully!');</script>";

              }else{
                echo "<script>alert('Orders not marked as printed - Error');</script>";
              }
            }
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
      

      return $this->view->render($response,'ManageOrders.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageOrders.css",
              'asset_path' => ASSET_PATH,
              'js_file' => JS_PATH . "ManageOrders.js",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'orderdata' => $manage_order_model->getHTMLOrderData(),
              'isAdmin' => $account_type == "admin",
          ));
    }

    return $response->withRedirect('loginpage', 302);
    
});
