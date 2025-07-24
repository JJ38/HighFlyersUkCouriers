<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/calculate-route', function (Request $request, Response $response) use ($app) : Response
{

    $requestParameters = $request->getParsedBody();

    echo "awdawdaw";

    return $response;

});


$app->post('/calculate-route', function (Request $request, Response $response) use ($app) : Response
{

    $model = $request->getParsedBody();

    //contact google routes optimisation api

    // return $response->withJson($model);

    $container = $app->getContainer();
    $authentication_model = $container->get('authenticationModel');
    $calculate_route_model = $container->get('calculateRouteModel');
    $logger = $container->get('logger');

    $authentication_model->setLogger($logger);
    $calculate_route_model->setLogger($logger);


    //'https://www.googleapis.com/auth/cloud-platform'
    $scopes = [
        // 'https://www.googleapis.com/auth/maps-platform.routeoptimization'
        'https://www.googleapis.com/auth/cloud-platform'
    ];

    $serviceAccountPath = '../route-optimisation-key.json';

    try {

        $accessToken = $authentication_model->fetchGoogleCloudAccessToken($serviceAccountPath, $scopes);

        $route = $calculate_route_model->calculateRoute($accessToken, $model); 

        return $response->withJson($route);

    }catch(Exception $e){

        $response->getBody()->write('{"status": "500", "error": ' . json_encode($e) . '}');
        
        return $response->withStatus(500);

    }

    // $json = $response->withJson($requestParameters);

});
