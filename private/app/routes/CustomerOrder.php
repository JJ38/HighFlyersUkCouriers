<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
use HighFlyersUkCouriers\FirebaseDocument;
use Exception;

use DateTime;

$app->get('/customer-order', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    // Echo "<h1>This form is currently unavailable. Please order through the public form in the booking page or call us to book orders. Sorry for the inconvenience</h1>";

    // return $response;

    if($account_type == "customer"){

        $container = $app->getContainer();

        $santizer = $container->get('sanitizer');

        $allGetVars = $_GET;

        if(!empty($allGetVars)){   
    
           
            if(!empty($allGetVars['updated'])){
                $cleaned_updated = $santizer->sanitizeString($allGetVars['updated']);
                if($cleaned_updated == "true"){
                    echo "<script>alert('profile updated!');</script>";
                }
            }

            if(!empty($allGetVars['success'])){
                $cleaned_updated = $santizer->sanitizeString($allGetVars['success']);
                if($cleaned_updated == "true"){
                    echo "<script>alert('Success! Your orders have been place and you should recieve an email confirming your order shortly.');</script>";
                }
            }

            if(!empty($allGetVars['error'])){
                $cleaned_error = $santizer->sanitizeString($allGetVars['error']);
                if($cleaned_error == "true"){
                    echo "<script>alert('Error: Sorry something went wrong. No orders have been submitted.');</script>";
                }
            }

            if(!empty($allGetVars['partial'])){
                $cleaned_partial = $santizer->sanitizeString($allGetVars['partial']);
                if($cleaned_partial == "true"){
                    echo "<script>alert('Error: Sorry something went wrong. Some orders have been submitted. You will recieve an email shortly confirming the orders that have been submitted');</script>";
                }
            }
        }

        if($account_type == "customer"){

            return $this->view->render($response,'customer-order.html');
        }
    
    }

    
    return $response->withRedirect('loginpage', 302);
    

    
   
})->setName('');


$app->post('/customer-order', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "customer"){


        $allPostVars = $request->getParsedBody();

        $container = $app->getContainer();

        $manage_order_model = $container->get('manageOrderModel');

        $session_wrapper = $container->get('sessionWrapper');
        $account_name = $session_wrapper->getSessionVar('user');

        $cleaned_orders = $manage_order_model->cleanMultipleOrders($allPostVars, $app, $account_name);


        if(empty($cleaned_orders)){
            return $response->withRedirect('/customer-order?error=true', 302);
        }


        $container = $app->getContainer();
        $logger = $container->get('logger');
        $authentication_model = $container->get('authenticationModel');
        $authentication_model->setLogger($logger);
        $authentication_model->fetchOAuth2Token();
      
        $access_token = $authentication_model->getOAuth2Token();
    

        $finance_model = $container->get('financeModel');

      

        try{        
            
            //finance
            $rest_API_wrapper = $container->get('restAPIWrapper');

            $rest_API_wrapper->setLogger($logger);
            $rest_API_wrapper->setAccessToken($access_token);

            $initialise_success = $rest_API_wrapper->initialiseConfig();

            if(!$initialise_success){
                throw new Exception('Error initialising REST API Wrapper');
            }

            $rest_API_wrapper->fetchMultipleDocuments(['Settings/birdSpecies', 'Settings/priceDefinitions']);
            $successfully_fetched_documents = $rest_API_wrapper->getFirebaseFirestoreResult();

            if(!$successfully_fetched_documents){
                throw new Exception('Error fetching documents for calculating order price');
            }

            $multi_documents = $rest_API_wrapper->getMultiDocuments();

            $prices_firebase_document = new FirebaseDocument();
            $postcodes_firebase_document = new FirebaseDocument();

            $prices_firebase_document->setData($multi_documents['Settings/birdSpecies']['fields']);
            $postcodes_firebase_document->setData($multi_documents['Settings/priceDefinitions']['fields']);

        }catch(Exception $e){

            if($logger != null){
                $logger->error('FINANCE_ERROR', array($e));
            }

        }

        $finance_model->setLogger($logger);
        $finance_model->setPricesDocument($prices_firebase_document);
        $finance_model->setPostcodesDocument($postcodes_firebase_document);

        var_dump($cleaned_orders[1]);


        for($i = 1; $i < sizeof($cleaned_orders) + 1; $i++){

            $finance_model->setOrderData($cleaned_orders[$i]);
            $finance_model->calculateOrderPrice();

            $cleaned_orders[$i]['price'] = $finance_model->getOrderPrice();

        }
 
        // Get models + Wrappers
    
        $add_order_model = $container->get('addOrderModel');
        $session_wrapper = $container->get('sessionWrapper');

        $firestore = $authentication_model->getAuthenticatedFirebaseClient();


        if($firestore == null){
            return $response->withRedirect('/customer-order?error=true', 302);
        }

        
        putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); 

        $date_time = new DateTime();
        $date_time->setTimezone(new DateTimeZone('Europe/London'));
        $add_order_model->setDateTime($date_time);
        $add_order_model->setLogger($logger);
        $add_order_model->setSessionWrapper($session_wrapper);
    
        $add_order_model->setFirebaseFirestore($firestore);
        $add_order_model->setOAuth2Token($access_token);
    
        $manage_order_model->setOrderData($cleaned_orders);
        $manage_order_model->setAddOrderModel($add_order_model);

        
        $store_result = $manage_order_model->storeMultipleOrders();
        $confirmed_orders = $manage_order_model->getConfirmedOrders();
        $sanitizer = $container->get('sanitizer');
        
        //send email

        $cleaned_email = $sanitizer->sanitizeEmail($allPostVars['profileemail']);

        $mailer = $container->get('mailer');
        $mailer_settings = $container->get('settings')['mailerBookingSettings'];
        $mailer->setMailerSettings($mailer_settings);

        $mailer->setMailData($confirmed_orders);
        $mailer->sendMultipleOrderEmail($cleaned_email);
        $mailer->sendMultipleOrderEmailInternal();
        
        if($store_result){

            return $response->withRedirect('/customer-order?success=true', 302);
        }

        return $response->withRedirect('/customer-order?partial=true', 302);
    
    }

    return $response->withRedirect('loginpage', 302);
   
})->setName('');

