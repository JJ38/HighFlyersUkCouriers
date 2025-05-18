<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/logistics-settings', function (Request $request, Response $response, $args) use ($app) : Response{

    return $this->view->render($response,'logistics-settings.html', array());
});