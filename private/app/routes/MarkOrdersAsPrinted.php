<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->post('/mark-orders-as-printed', function (Request $request, Response $response) use ($app) : Response
{
    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){
        
        // Retrieve user credentials in POST body
        $doc_references = $request->getParsedBody();
      
        // Get models + Wrappers
        $container = $app->getContainer();
        $logger = $container->get('logger');
        $manage_order_model = $container->get('manageOrderModel');

        //Add firebase update printed field functionality
        $manage_order_model->setOrderData($doc_references);
        $update_result = $manage_order_model->updatePrinted();

        if($update_result){
            return $response->withRedirect('/manage-orders?printerror=false', 302);
        }

        return $response->withRedirect('/manage-orders?printerror=true', 302);

    } 

    return $response->withRedirect('/loginpage', 302);

});