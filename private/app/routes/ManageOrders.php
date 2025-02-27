<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Datetime;
use DateTimeZone;

$app->get('/manage-orders[/updated]', function (Request $request, Response $response, $updated="null") use ($app) : Response{


    $current_date = new DateTime();
    $current_date->setTimezone(new DateTimeZone('Europe/London'));

    echo $current_date->format("Y-m-d H:i:s P T");

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
            $cleaned_invalid_form = $sanitizer->sanitizeString($tainted_invalid_form);

            if($cleaned_invalid_form != null){

              if($cleaned_invalid_form === "true"){
                echo "<script>alert('Order Updated');</script>";

              }else if($cleaned_invalid_form === "dberror"){

                echo "<script>alert('Order Not Added - Database Error');</script>";

              }else{

                echo "<script>alert('Order Not Updated - Error');</script>";

              }
            }
          }
        }else if(!empty($allGetVars['addorder'])){
          $tainted_add_order = $allGetVars['addorder'];
          if($tainted_add_order){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_add_order = $sanitizer->sanitizeString($tainted_add_order);

            if($cleaned_add_order != null){

              if($cleaned_add_order === "true"){
                echo "<script>alert('Order Added successfully!');</script>";

              }
              else if($cleaned_add_order === "dberror"){
                echo "<script>alert('Order Not Added - Database Error');</script>";
              }
              
              else{
                echo "<script>alert('Order Not Added - Error ($cleaned_add_order)');</script>";
              }
            }
          }
        }


        else if(!empty($allGetVars['error'])){
          $tainted_error = $allGetVars['error'];
          if($tainted_error){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_error = $sanitizer->sanitizeString($tainted_error);

            if($cleaned_error != null){

              if($cleaned_error === "dbconnection"){
                echo "<script>alert('Error connecting to database!');</script>";

              }
            }
          }
        }


        else if(!empty($allGetVars['field'])){
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
        }else if(!empty($allGetVars['permission'])){
          $tainted_permission = $allGetVars['permission'];
          if($tainted_permission){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_permission = $sanitizer->sanitizeString($tainted_permission);

            if($cleaned_permission != null){

              if($cleaned_permission === "denied"){
                echo "<script>alert('You do not have permission to edit this order!');</script>";

              }
            }
          }
        }else if(!empty($allGetVars['partiallyDeleted'])){
          $tainted_permission = $allGetVars['partiallyDeleted'];
          if($tainted_permission){
            $sanitizer = $app->getContainer()->get('sanitizer');
            $cleaned_permission = $sanitizer->sanitizePositiveNumber($tainted_permission);

            if($cleaned_permission != null){

             
              echo "<script>alert('Error failed to delete $cleaned_permission');</script>";

              
            }
          }
        }

      }

      //generate html order data
      $container = $app->getContainer();
      $logger = $container->get('logger');


      return $this->view->render($response,'manage-orders.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageOrders.css",
              'asset_path' => ASSET_PATH,
              'js_file' => JS_PATH . "ManageOrders.js",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'isAdmin' => $account_type == "admin",
          ));
    }

    // echo "<pre>" . var_dump($account_type) . "</pre>";

    // return $response;

    return $response->withRedirect('loginpage', 301);
    
});


