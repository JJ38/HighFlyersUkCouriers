<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/system-settings', function (Request $request, Response $response) use ($app) : Response{

     $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){
        return $this->view->render($response,'system-settings.html', array());
    }

    return $response->withRedirect('loginpage', 301);

});
