<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/f-a-q', function (Request $request, Response $response) use ($app) : Response{

    return $this->view->render($response,'FAQ.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "avents.css",
            'asset_path' => ASSET_PATH,
            'js_path' => JS_PATH . "avents.js",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            'links'=> array(
                'register' => 'registerform',
                'login' => 'loginform',
                'homepage' => '#',
                'send_initial_messages' => 'sendinitialtelemetrymessages',
                'present_telemetry' => 'presenttelemetrydata',
                'manage_users' => 'manageusersform',
                'send_telemetry' => 'sendtelemetrydata',
                'logout' => 'logout'
            ),
        ));
});
