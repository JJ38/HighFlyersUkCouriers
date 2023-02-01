<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/content-manager', function (Request $request, Response $response) use ($app) : Response{

$is_authenticated = $request->getAttribute('isAuthenticated');

if($is_authenticated){

  return $this->view->render($response,'ContentManager.twig', array(
          'page_title' => APP_TITLE,
          'css_file' => CSS_PATH . "ContentManager.css",
          'asset_path' => ASSET_PATH,
          'js_file' => JS_PATH . "ContentManager.js",
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
}else{
   
  return $response->withRedirect('loginpage', 302);
}
});
