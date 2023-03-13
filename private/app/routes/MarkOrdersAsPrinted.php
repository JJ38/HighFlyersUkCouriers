<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->post('/mark-orders-as-printed', function (Request $request, Response $response) use ($app) : Response
{
    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){
        // Retrieve user credentials in POST body
        $tainted_parameters = $request->getParsedBody();

      

        // Get models + Wrappers
        $container = $app->getContainer();
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

        // echo '<pre>';
        // var_dump($tainted_parameters);
        // echo '</pre>';

        // return $response;


        $manage_order_model->setOrderData($tainted_parameters);
        $update_result = $manage_order_model->updatePrinted();

        if($update_result){
            return $response->withRedirect('/manage-orders?printerror=false', 302);
        }

        return $response->withRedirect('/manage-orders?printerror=true', 302);

    } 

    return $response->withRedirect('/loginpage', 302);

});