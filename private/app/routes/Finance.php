<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/finance', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){
    
        return $this->view->render($response,'finance.html', array(
            'page_title' => APP_TITLE,
        ));

    }

    return $response->withRedirect('loginpage', 302);

});
