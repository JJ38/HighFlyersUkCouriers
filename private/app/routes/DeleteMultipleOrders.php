<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/delete-multiple-orders', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){

        $container = $app->getContainer();

        $allGetVars = $_GET;

        $tainted_ids = [];

        for($i = 0; $i < count($allGetVars); $i++){
          
            $tainted_ids[$i] = $allGetVars[array_keys($allGetVars)[$i]];
        }
        
        // var_dump($tainted_ids);

        // return $response;

        //get orders from database
        $doctrine_wrapper = $container->get('doctrineWrapper');
        $logger = $container->get('logger');

        // // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);


        $manage_order_model = $container->get('manageOrderModel');
        $manage_order_model->setDoctrineWrapper($doctrine_wrapper);
        $manage_order_model->fetchOrderDataByFieldAndMultipleValues('id', $tainted_ids);

        $manage_order_model->generateHTMLForMultipleDelete();

        $order_data = $manage_order_model->getOrderData();

        return $this->view->render($response,'DeleteMultipleOrders.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "DeleteMultipleOrders.css",
            'asset_path' => ASSET_PATH,
            'js_file' => JS_PATH . "DeleteMultipleOrders.js",
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
    }
    
    
    return $response->withRedirect('loginpage', 302);
    
});


$app->post('/delete-multiple-orders', function (Request $request, Response $response) use ($app) : Response{    

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){
        
        $allPostVars = $request->getParsedBody();

        $container = $app->getContainer();


        $doctrine_wrapper = $container->get('doctrineWrapper');
        $logger = $container->get('logger');


        $ids = [];

        for($i = 0; $i < count($allPostVars); $i++){
         
            $ids[$i] = $allPostVars[array_keys($allPostVars)[$i]];
        }


   

        // // Doctrine wrapper setup
        $database_connection_settings = $container->get('settings')['doctrineSettings'];
        $database_connection = DriverManager::getConnection($database_connection_settings);
        $query_builder = $database_connection->createQueryBuilder();
        $doctrine_wrapper->setQueryBuilder($query_builder);
        $doctrine_wrapper->setDoctrineLogger($logger);

        //TODO: make sure id and timestamp are set as session vars before storing

        $doctrine_wrapper->deleteMultipleOrders($ids);
        $query_result = $doctrine_wrapper->getQueryResult();


        if($query_result){
            return $response->withRedirect('manage-orders?deleted=true', 302);
        }

        return $response->withRedirect('manage-orders?deleted=false', 302);

    }

    return $response->withRedirect('manage-orders', 302);

});