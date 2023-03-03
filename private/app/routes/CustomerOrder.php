<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/customer-order', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "customer"){

        $allGetVars = $_GET;

        if(!empty($allGetVars)){   
    
            $cleaned_updated = $allGetVars['updated'];
    
    
            if($cleaned_updated == "true"){
                echo "<script>alert('profile updated!');</script>";
            }
        }

        $profile_data = "mef opkm,sep;f se";

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
        echo "<pre>";
        var_dump($allPostVars);
        echo "</pre>";
        return $response;

        $container = $app->getContainer();

        $customer_profile_model = $container->get('customerProfileModel');
        $sanitizer = $container->get('sanitizer');
        $validator = $container->get('validator');
        $customer_profile_model->setSanitizer($sanitizer);
        $customer_profile_model->setValidator($validator);
        $customer_profile_model->cleanProfileForm($allPostVars);

        if(empty($customer_profile_model->getCleanedFormData())){
            return $response->withRedirect('/HighFlyersUkCouriers/public/customer-profile?updated=false', 302);
        }

        // Get models + Wrappers
        $container = $app->getContainer();
        $session_wrapper = $container->get('sessionWrapper');
        $doctrine_wrapper = $container->get('doctrineWrapper');
        $logger = $container->get('logger');

        // // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);


        // $customer_details = $customer_profile_model->getCleanedFormData();

        // $customer_profile_model->setDoctrineWrapper($doctrine_wrapper);
        // $customer_profile_model->setSessionWrapper($session_wrapper);

        // $customer_profile_model->setCustomerDetails($customer_details);
        // $customer_profile_model->updateCustomerDetails();

        // $update_result = $customer_profile_model->getUpdateResult();


        if($update_result){
            return $response->withRedirect('/HighFlyersUkCouriers/public/customer-order?updated=true', 302);
        }

        return $response->withRedirect('/HighFlyersUkCouriers/public/customer-profile?updated=false', 302);
    
        
    }

    return $response->withRedirect('loginpage', 302);
   
})->setName('');

