<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Kreait\Firebase\Factory;

$app->get('/loginpage', function (Request $request, Response $response) use ($app) : Response{

    return $this->view->render($response,'loginpage.html', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "LoginPage.css",
            'asset_path' => ASSET_PATH,
            'js_path' => '/js/LoginPage.js',
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            'links'=> array(
                'register' => 'registerform',
                'login' => 'loginform',
                'homepage' => '#',
                'logout' => 'logout'
            ),
        ));

})->setName('loginpage');

$app->post('/loginpage', function (Request $request, Response $response) use ($app) : Response
{

  // Get models + Wrappers
  $container = $app->getContainer();
  $login_model = $container->get('loginModel');
  $session_wrapper = $container->get('sessionWrapper');
  $logger = $container->get('logger');
  $login_model->setLoggerHandle($logger);
  $login_model->setSessionWrapper($session_wrapper);
 
  //if not authenticated on firebase via the frontend
  if(empty($_POST['accessToken'])){

    return $response->withRedirect('/loginpage', 302);
    
  }else{

    //verify JWT
    $factory = (new Factory)->withServiceAccount('../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json');
    $auth = $factory->createAuth();
    
    $sanitizer = $app->getContainer()->get('sanitizer');
    $ID_Token_String = $sanitizer->sanitizeString($_POST['accessToken']);

    $login_model->setAuth($auth);
    $login_model->setIDToken($ID_Token_String);
    $login_model->verifyIDToken();
    $login_result = $login_model->getResult();

  }

  if($login_result) {

    $account_type = $session_wrapper->getSessionVar('accountType');

    if($account_type == "admin" || $account_type == "staff"){
      
      return $response->withRedirect('/manage-orders', 302);
    }

    if($account_type == "driver"){
      return $response->withRedirect('/driver-runs', 302);
    }

    return $response->withRedirect('/customer-order', 302);
  } 

  return $response->withRedirect('loginpage', 302);

})->setName('loginpage');

