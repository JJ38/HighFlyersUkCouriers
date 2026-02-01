<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/driver-runs', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');
    
    if($account_type != "driver"){
      return  $response->withRedirect('loginpage', 302);
    }
    
    return $this->view->render($response,'driver-runs.html', array(
            'page_title' => APP_TITLE,
        ));
});
