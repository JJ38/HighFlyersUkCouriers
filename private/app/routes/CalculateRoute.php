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

    // $response->getBody()->write('{"result": "calculate Route route with direct string as json"}');

    $model = $request->getParsedBody();

    //contact google routes optimisation api

    $container = $app->getContainer();
    $authentcation_model = $container->get('authenticationModel');
    $calculate_route_model = $container->get('calculateRouteModel');
    $logger = $container->get('logger');

    $authentcation_model->setLogger($logger);
    $calculate_route_model->setLogger($logger);


    //'https://www.googleapis.com/auth/cloud-platform'
    $scopes = [
        // 'https://www.googleapis.com/auth/maps-platform.routeoptimization'
        'https://www.googleapis.com/auth/cloud-platform'
    ];

    $serviceAccountPath = '../route-optimisation-service-account.json';

    try {

        $accessToken = $authentcation_model->fetchGoogleCloudAccessToken($serviceAccountPath, $scopes);

        // var_dump($model);

        $minimalOptimizationModel = [
            'model' => [
                'shipments' => [
                    [
                        'pickups' => [
                            [
                                'arrivalLocation' => [
                                    'latitude' => 51.5074,
                                    'longitude' => -0.1278
                                ]
                            ]
                        ]
                    ]
                ],
                'vehicles' => [
                    [
                        'startLocation' => [
                            'latitude' => 51.5,
                            'longitude' => -0.1
                        ],
                        'endLocation' => [
                            'latitude' => 51.5,
                            'longitude' => -0.1
                        ],
                        'costPerKilometer' => 1
                    ]
                ]
            ],
        ]; 

        $example = 
        [
            "model" => [
                "shipments" => [
                    [
                        "pickups" => [
                            [
                                "arrivalLocation" => [
                                    "latitude" => 37.73881799999999,
                                    "longitude" => -122.4161
                                ]
                            ]
                        ],
                        "deliveries" => [
                            [
                                "arrivalLocation" => [
                                    "latitude" => 37.79581,
                                    "longitude" => -122.4218856
                                ]
                            ]
                        ]
                    ]
                ],
                "vehicles" => [
                    [
                        "startLocation" => [
                            "latitude" => 37.73881799999999,
                            "longitude" => -122.4161
                        ],
                        "endLocation" => [
                            "latitude" => 37.73881799999999,
                            "longitude" => -122.4161
                        ],
                        "costPerKilometer" => 1.0
                    ]
                ],
                "globalStartTime" => "2024-02-13T00:00:00.000Z",
                "globalEndTime"=> "2024-02-14T06:00:00.000Z"
            ]
        ];

        $route = $calculate_route_model->calculateRoute($accessToken, $model); 

        // var_dump($route);

        return $response->withJson($route);

    }catch(Exception $e){

        $response->getBody()->write('{"status": "500", "error": ' . json_encode($e) . '}');
        
        return $response->withStatus(500);

    }

    // $json = $response->withJson($requestParameters);

});
