<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


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

  // Retrieve user credentials in POST body
  $tainted_parameters = $request->getParsedBody();
  $cleaned_parameters = cleanLoginData($app, $tainted_parameters);
  //$cleaned_parameters = $tainted_parameters;

  // Get models + Wrappers
  $container = $app->getContainer();
  $login_model = $container->get('loginModel');
  $bcrypt_wrapper = $container->get('bcryptWrapper');
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $session_wrapper = $container->get('sessionWrapper');
  $logger = $container->get('logger');


  //Does account exist on firebase




  // // Doctrine wrapper setup
  $database_connection_settings = $container->get('settings')['doctrineSettings'];
  $database_connection = DriverManager::getConnection($database_connection_settings);
  $query_builder = $database_connection->createQueryBuilder();
  $doctrine_wrapper->setQueryBuilder($query_builder);
  $doctrine_wrapper->setDoctrineLogger($logger);

  // LoginModel setup
  $login_model->setDoctrineWrapper($doctrine_wrapper);
  $login_model->setBcryptWrapper($bcrypt_wrapper);
  $login_model->setSessionWrapper($session_wrapper);
  $login_model->setUserCredentials($cleaned_parameters);
  $login_model->setLoggerHandle($logger);

  $login_model->login();
  $login_result = $login_model->getResult(); //If result is successful $login_result is true

  if($login_result) {
      $account_type = $session_wrapper->getSessionVar('accountType');

      if($account_type == "admin" || $account_type == "staff"){
       
        return $response->withRedirect('/manage-orders', 302);
      }

      return $response->withRedirect('/customer-order', 302);
    
  } 

  return $response->withRedirect('loginpage', 302);

})->setName('loginpage');

function cleanLoginData($app, array $tainted_parameters) : array
{
    $cleaned_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');

    $cleaned_parameters['username'] = $sanitizer->sanitizeUsername($tainted_parameters['username']);
    $cleaned_parameters['password'] = $tainted_parameters['password'];

    return $cleaned_parameters;
}
