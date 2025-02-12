<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/edit-order[/id]', function (Request $request, Response $response) use ($app) : Response{

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
        $manage_order_model->setIsAdmin($account_type == "admin");
        $manage_order_model->fetchOrderDataByField('id', $cleaned_order_id);
        if(empty($manage_order_model->getOrderData())){
          return $response->withRedirect('manage-orders', 302);
        }

        $order_data = $manage_order_model->getOrderData();

        
  
        //check if a staff member is trying ot edit a customer order

        $iscustomer = !empty($order_data[0]['username']);
        
        if($account_type == "staff" && $iscustomer){
          return  $response->withRedirect('manage-orders?permission=denied', 302);
        }

        $manage_order_model->generateHTMLForEditData();

        $session_wrapper = $app->getContainer()->get('sessionWrapper');

        $session_wrapper->setSessionVar('id', $order_data[0]['id']);

        $added_by = $order_data[0]['added_by'];


        if(empty($added_by)){
          $added_by = "";
        }

        $session_wrapper->setSessionVar('added_by', $added_by);


        //set delivery week if staff member as wont be submitted in form as staff members shouldnt be able to change delivery week
        if($account_type == "staff"){ 
          if(array_key_exists('delivery_week', $order_data[0])){

           if(empty($order_data[0]['delivery_week'])){
              $delivery_week = "";          
           }else{
              $delivery_week = $order_data[0]['delivery_week'];
           }
            $session_wrapper->setSessionVar('delivery_week', $delivery_week);
          }

        }

      }else{
        return  $response->withRedirect('manage-orders', 302);
      }

      return $this->view->render($response,'edit-orders.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "EditOrders.css",
              'asset_path' => ASSET_PATH,
              'js_path' => JS_PATH . "",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'orderdata' => $manage_order_model->getHTMLOrderData() 
          ));
    }else{

      return $response->withRedirect('loginpage', 302);
    }
});


$app->post('/edit-order', function (Request $request, Response $response) use ($app) : Response
{
  $account_type = $request->getAttribute('accountType');
    
    if($account_type == "admin" || $account_type == "staff"){


      $tainted_parameters = $request->getParsedBody();

      $container = $app->getContainer();
      
      
      $session_wrapper = $app->getContainer()->get('sessionWrapper');

      $tainted_parameters['added_by'] = $session_wrapper->getSessionVar('added_by');
      $session_wrapper->unsetSessionVar('added_by');

      if($account_type == "staff"){ 
        $tainted_parameters['delivery_week'] = $session_wrapper->getSessionVar('delivery_week');
        $session_wrapper->unsetSessionVar('delivery_week');
      }
     
      $manage_order_model = $container->get('manageOrderModel');
      $cleaned_parameters = $manage_order_model->cleanOrder($tainted_parameters, $app);

     
      //if one of the parameters does not meet requirements

      if(empty($cleaned_parameters)){

        return $response->withRedirect('/manage-orders?updated=false', 301);
      }

      $cleaned_parameters['id'] = $session_wrapper->getSessionVar('id');
      $session_wrapper->unsetSessionVar('id');

     //convert printed value to int

      if($cleaned_parameters['printed'] == "Printed"){
        $cleaned_parameters['printed'] = 1;
      }else{
        $cleaned_parameters['printed'] = 0;

      }


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

      
      $doctrine_wrapper->updateOrderDataById($cleaned_parameters);
      $query_result = $doctrine_wrapper->getQueryResult();

     
      if($query_result){    

        return $response->withRedirect('/manage-orders?updated=true', 301);

      }else if($query_result === false){

        return $response->withRedirect('/manage-orders?updated=dberror', 301);
      }

      return $response->withRedirect('/manage-orders?updated=false', 301);


    }

  return $response->withRedirect('/loginpage', 301);


})->setName('edit-orders');