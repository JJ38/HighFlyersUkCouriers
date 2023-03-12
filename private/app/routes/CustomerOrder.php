<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/customer-order', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

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
        $container = $app->getContainer();
        $doctrine_wrapper = $container->get('doctrineWrapper');
        $session_wrapper = $container->get('sessionWrapper');
        $logger = $container->get('logger');

        // // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);

        $username = $session_wrapper->getSessionVar('user');

        $doctrine_wrapper->fetchCustomerDetails($username);
        $customer_details = $doctrine_wrapper->getQueryResult();
    
        if($account_type == "customer"){
            return $this->view->render($response,'CustomerOrder.twig', array(
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "CustomerOrder.css",
                'css_nav_file' => CSS_PATH . "NavigationBar.css",
                'css_footer_file' => CSS_PATH . "Footer.css",
                'asset_path' => ASSET_PATH,
                'js_file' => JS_PATH . "CustomerOrder.js",
                'email' => $customer_details[0]['email'],
                'collection_name' => $customer_details[0]['collection_name'],
                'collection_phone_number' => $customer_details[0]['collection_phone_number'],
                'collection_address_1' => $customer_details[0]['collection_address_1'],
                'collection_address_2' => $customer_details[0]['collection_address_2'],
                'collection_address_3' => $customer_details[0]['collection_address_3'],
                'collection_postcode' => $customer_details[0]['collection_postcode'],
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


        // Get models + Wrappers
        $container = $app->getContainer();
        $doctrine_wrapper = $container->get('doctrineWrapper');
        $logger = $container->get('logger');

        // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);

        $manage_order_model->setDoctrineWrapper($doctrine_wrapper);
        $manage_order_model->setOrderData($cleaned_orders);

      
        //return $response;

        $store_result = $manage_order_model->storeMultipleOrders();
        $confirmed_orders = $manage_order_model->getConfirmedOrders();

        // echo "<pre>";
        // var_dump($cleaned_orders);
        // echo "</pre> cleaned orders";

        // echo "<pre>";
        // var_dump($confirmed_orders);
        // echo "</pre> confirmed orders";
        // return $response;
        $sanitizer = $container->get('sanitizer');

        //send email

        $cleaned_email = $sanitizer->sanitizeEmail($allPostVars['profileemail']);

        $mailer = $container->get('mailer');
        $mailer_settings = $container->get('settings')['mailerBookingSettings'];
        $mailer->setMailerSettings($mailer_settings);

        $mailer->setMailData($confirmed_orders);
        $mailer->sendMultipleOrderEmail($cleaned_email);
        // $mailer->sendMailInternal();

        if($store_result){

            return $response->withRedirect('/customer-order?success=true', 302);
        }

        return $response->withRedirect('/customer-order?partial=true', 302);
    
    }

    return $response->withRedirect('loginpage', 302);
   
})->setName('');

