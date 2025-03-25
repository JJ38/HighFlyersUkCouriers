<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
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

        
        

        // Get models + Wrappers
        $logger = $container->get('logger');

    


        if($account_type == "customer"){


        

            return $this->view->render($response,'customer-order.html');
        }
    
    }

    
    return $response->withRedirect('loginpage', 302);
    

    
   
})->setName('');


$app->post('/customer-order', function (Request $request, Response $response) use ($app) : Response{



    // Echo "<h1>This form is currently unavailable. Please order through the public form in the booking page or call us to book orders. Sorry for the inconvenience</h1>";

    // return $response;

    $account_type = $request->getAttribute('accountType');

    if($account_type == "customer"){


        $allPostVars = $request->getParsedBody();

        $container = $app->getContainer();

        $manage_order_model = $container->get('manageOrderModel');

        $session_wrapper = $container->get('sessionWrapper');
        $account_name = $session_wrapper->getSessionVar('user');


        echo $account_name;

        $cleaned_orders = $manage_order_model->cleanMultipleOrders($allPostVars, $app, $account_name);



        // return $response;

        if(empty($cleaned_orders)){
            return $response->withRedirect('/customer-order?error=true', 302);
        }

        // Get models + Wrappers
        $container = $app->getContainer();
        $logger = $container->get('logger');
        $add_order_model = $container->get('addOrderModel');
        $session_wrapper = $container->get('sessionWrapper');

        
        putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); 


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

        $date_time = new DateTime();
        $date_time->setTimezone(new DateTimeZone('Europe/London'));
        $add_order_model->setDateTime($date_time);
        $add_order_model->setLogger($logger);
        $add_order_model->setSessionWrapper($session_wrapper);
        $add_order_model->getOAuth2Token();
    
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

