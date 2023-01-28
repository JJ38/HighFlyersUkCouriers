<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/contact-us', function (Request $request, Response $response) use ($app) : Response{

    return $this->view->render($response,'NewContactUs.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "NewContactUs.css",
            'css_nav_file' => CSS_PATH . "NavigationBar.css",
            'css_footer_file' => CSS_PATH . "Footer.css",
            'asset_path' => ASSET_PATH,
            'js_file' => JS_PATH . "NewContactUs.js",
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

$app->post('/contact-us', function (Request $request, Response $response) use ($app) : Response
{

  $response->getBody()->write("post contact-us"); //from input tag name

  return $response;

})->setName('contact-us');
