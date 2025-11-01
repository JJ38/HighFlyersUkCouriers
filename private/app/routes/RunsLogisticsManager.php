<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/runs-logistics-manager', function (Request $request, Response $response, $args) use ($app) : Response{


    $account_type = $request->getAttribute('accountType');
   

    if($account_type == "admin"){
        
        return $this->view->render($response,'runs-logistics-manager.html', array());

    }else{

        return $response->withRedirect('loginpage', 302);
    }


});                 