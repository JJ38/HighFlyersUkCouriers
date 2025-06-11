<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/calculate-route', function (Request $request, Response $response) use ($app) : Response
{


    // $response->getBody()->write('{result: "calculate Route route"}');

    // return $response;

    $data = array('result' => "calculate Route route");

    $json = $response->withJson($data);

    echo $json;

    return $response;

});


$app->post('/calculate-route', function (Request $request, Response $response) use ($app) : Response
{


    $response->getBody()->write('{"result": "calculate Route route with diredct string as json"}');

    return $response;

    $data = array('result' => "calculate Route route");

    $json = $response->withJson($data);

    return $json;

});
