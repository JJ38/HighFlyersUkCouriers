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
    $container = $app->getContainer();
    $authentication_model = $container->get('authenticationModel');

    $JWT = $authentication_model->getBearerToken();

    if($JWT == null){

        $response->getBody()->write('{"status": "500", "error": {"message": "UNAUTHORISED", "details": "No JWT found"}}');
        return $response->withStatus(500);

    }

    $role = $authentication_model->getRoleOfJWT($JWT);

    if($role != "admin"){

        $response->getBody()->write('{"status": "500", "error": {"message": "UNAUTHORISED", "account_type": "' . $role . '"}}');
        return $response->withStatus(500);

    }
    
    $model = $request->getParsedBody();

    //contact google routes optimisation api

    $calculate_route_model = $container->get('calculateRouteModel');
    $logger = $container->get('logger');

    $authentication_model->setLogger($logger);
    $calculate_route_model->setLogger($logger);


    $scopes = [
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

});
