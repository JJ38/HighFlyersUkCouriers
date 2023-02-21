<?php


use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/customer-profile', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "customer"){
        return $this->view->render($response,'CustomerProfile.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "CustomerProfile.css",
            'css_nav_file' => CSS_PATH . "NavigationBar.css",
            'css_footer_file' => CSS_PATH . "Footer.css",
            'asset_path' => ASSET_PATH,
            'js_file' => JS_PATH . "CustomerProfile.js",
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
    }

    return $response->withRedirect('loginpage', 302);
   
})->setName('');
