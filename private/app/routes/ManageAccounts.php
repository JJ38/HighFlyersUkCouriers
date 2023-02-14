<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/manage-accounts[/error]', function (Request $request, Response $response) use ($app) : Response{

    $is_authenticated = $request->getAttribute('isAuthenticated');

    if($is_authenticated){

      $allGetVars = $_GET;
      if(!empty($allGetVars)){
        if(!empty($allGetVars['error'])){
          $tainted_error = $allGetVars['error'];
        
          $sanitizer = $app->getContainer()->get('sanitizer');
          $cleaned_error = $sanitizer->sanitizeBoolean($tainted_error);

          if($cleaned_error != "false"){
            echo "<script>alert('Error');</script>";
          }
        }
      }
      
      $container = $app->getContainer();
      $logger = $container->get('logger');
      $doctrine_wrapper = $container->get('doctrineWrapper');

      // // Doctrine wrapper setup
      $database_connection_settings = $container->get('settings')['doctrineSettings'];
      $database_connection = DriverManager::getConnection($database_connection_settings);
      $query_builder = $database_connection->createQueryBuilder();
      $doctrine_wrapper->setQueryBuilder($query_builder);
      $doctrine_wrapper->setDoctrineLogger($logger);


      $manage_accounts_model = $container->get('manageAccountsModel');
      $manage_accounts_model->setDoctrineWrapper($doctrine_wrapper);

      $manage_accounts_model->fetchAllUsers();
      $manage_accounts_model->generateHTMLFromData();

      return $this->view->render($response,'ManageAccounts.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageAccounts.css",
              'asset_path' => ASSET_PATH,
              // 'js_file' => JS_PATH . "ManageAccounts.js",
              'userdata' => $manage_accounts_model->getUserDataHTML(),
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
