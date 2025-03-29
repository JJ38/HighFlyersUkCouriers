<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;

$app->get('/edit-order[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');
    
    if($account_type == "admin" || $account_type == "staff"){

      $allGetVars = $request->getQueryParams();
      $container = $app->getContainer();
  

    }else{
      return  $response->withRedirect('manage-orders', 302);
    }

    return $this->view->render($response,'edit-order.html', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "EditOrders.css",
            'asset_path' => ASSET_PATH,
            'js_path' => JS_PATH . "",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            
        ));

   
});


$app->post('/edit-order', function (Request $request, Response $response) use ($app) : Response
{
  $account_type = $request->getAttribute('accountType');
    
    if($account_type == "admin" || $account_type == "staff"){


      $tainted_parameters = $request->getParsedBody();

      $container = $app->getContainer();
      $session_wrapper = $app->getContainer()->get('sessionWrapper');
      $authentication_model = $app->getContainer()->get('authenticationModel');


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

      $cleaned_parameters['docRef'] = $tainted_parameters['docRef'];

     //convert printed value to int

      if($cleaned_parameters['printed'] == "Printed"){
        $cleaned_parameters['printed'] = 1;
      }else{
        $cleaned_parameters['printed'] = 0;

      }

      //store in database
      $logger = $container->get('logger');
      $edit_order_model = $container->get('editOrderModel');

      
      $edit_order_model->setLogger($logger);
      $edit_order_model->setOrderData($cleaned_parameters);

       
      $authentication_model->setLogger($logger);
      $authentication_model->fetchOAuth2Token();
  
      $firestore = $authentication_model->getAuthenticatedFirebaseClient();

      // try{
                
      //   $client = new GuzzleHttp\Client(['headers' => ['Authorization' => 'Bearer ' . $accessToken]]);
            
      //   $env = parse_ini_file(realpath('../.env'));
    
      //   $projectID = $env['FIREBASE_PROJECT_ID'];
      //   $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];
    
      //   $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
      //       'database' => '(default)',
      //   ], $client);

      //   $edit_order_model->setFirebaseFirestore($firestore);

      // }catch(Exception $e){

      //     if($logger != null){
      //         $logger->error('FIREBASE_INIT_ERROR', array($e));
      //         $logger->error('FIREBASE_INIT_ENV', array($env));
      //     }

      //     return $response->withRedirect('/manage-accounts?error=dberror', 302);

      // }

      if($firestore == null){
        return $response->withRedirect('/manage-accounts?error=dberror', 302);
      }

   
      $edit_order_model->setFirebaseFirestore($firestore);
      $edit_order_model->updateOrder();
      $query_result = $edit_order_model->getFirebaseFirestoreResult();

      if($query_result){    

        return $response->withRedirect('/manage-orders?updated=true', 301);

      }else if($query_result === false){

        return $response->withRedirect('/manage-orders?updated=dberror', 301);
      }

      return $response->withRedirect('/manage-orders?updated=false', 301);


    }

  return $response->withRedirect('/loginpage', 301);


})->setName('edit-orders');