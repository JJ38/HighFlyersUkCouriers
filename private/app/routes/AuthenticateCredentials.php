<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/authenticate-credentials', function (Request $request, Response $response) use ($app) : Response{

    $body = $response->getBody();

    $body->write("{key='dwaadwawddwawda'}");

    // $body->write("lsekfopkekfopesfpkesofopeskopfkesopfkopesfpoeskfopesokpfkp");

    return $response;

});