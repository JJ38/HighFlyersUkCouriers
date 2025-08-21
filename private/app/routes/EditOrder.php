<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
use HighFlyersUkCouriers\FirebaseDocument;

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

      $access_token = $authentication_model->getOAuth2Token();
  
      $firestore = $authentication_model->getAuthenticatedFirebaseClient();

      if($firestore == null){
        return $response->withRedirect('/manage-accounts?error=dberror', 302);
      }

      $finance_model = $container->get('financeModel');
      $rest_API_wrapper = $container->get('restAPIWrapper');

      

      if(empty($cleaned_parameters['price'])){

        //finance

        $rest_API_wrapper->setLogger($logger);
        $rest_API_wrapper->setAccessToken($access_token);

        $initialise_success = $rest_API_wrapper->initialiseConfig();

        if(!$initialise_success){
          return $response->withRedirect('/manage-orders?addorder=fetchpriceerror', 301);
        }

        $rest_API_wrapper->fetchMultipleDocuments(['Settings/birdSpecies', 'Settings/priceDefinitions']);
        $successfully_fetched_documents = $rest_API_wrapper->getFirebaseFirestoreResult();

        if(!$successfully_fetched_documents){
          return $response->withRedirect('/manage-orders?addorder=fetchpriceerror', 301);
        }

        $multi_documents = $rest_API_wrapper->getMultiDocuments();

        $prices_firebase_document = new FirebaseDocument();
        $postcodes_firebase_document = new FirebaseDocument();

        $prices_firebase_document->setData($multi_documents['Settings/birdSpecies']['fields']);
        $postcodes_firebase_document->setData($multi_documents['Settings/priceDefinitions']['fields']);

        $finance_model->setLogger($logger);
        $finance_model->setPricesDocument($prices_firebase_document);
        $finance_model->setPostcodesDocument($postcodes_firebase_document);
        $finance_model->setOrderData($cleaned_parameters);
        $finance_model->calculateOrderPrice();

        $successfully_calculated_order_price = $finance_model->getFinanceResult();

        // if(!$successfully_calculated_order_price){
        //   return $response->withRedirect('/manage-orders?addorder=fetchpriceerror', 301);
        // }

        $cleaned_parameters['price'] = $finance_model->getOrderPrice();

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