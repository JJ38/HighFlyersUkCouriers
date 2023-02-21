<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/delete-user[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){

      $allGetVars = $request->getQueryParams();

      if(!empty($allGetVars['id'])){
        $container = $app->getContainer();

        $tainted_user_id = $allGetVars['id'];

        $sanitizer = $container->get('sanitizer');
        $validator = $container->get('validator');

        $sanitized_user_id = $sanitizer->sanitizePositiveNumberString($tainted_user_id);
        $cleaned_user_id = $validator->validatePositiveNumberString($sanitized_user_id);
        if(empty($cleaned_user_id)){
          return $response->withRedirect('manage-accounts', 302);
        }
        
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
        $manage_accounts_model->fetchUserDataByID($cleaned_user_id);
        $manage_accounts_model->generateHTMLForDeleteData();

        $session_wrapper = $container->get('sessionWrapper');
        $session_wrapper->setSessionVar('delete_user_id', $cleaned_user_id);


      }else{
        return  $response->withRedirect('manage-accounts', 302);
      }

      //var_export($HTML_order_data);

      //echo '<pre>' . var_export($order_data,true) . '</pre>';

      return $this->view->render($response,'DeleteUser.twig', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "DeleteUser.css",
              'asset_path' => ASSET_PATH,
              'js_path' => JS_PATH . "",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'userdata' => $manage_accounts_model->getUserDataHTML(),
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

$app->post('/delete-user', function (Request $request, Response $response) use ($app) : Response
{

    $container = $app->getContainer();

    //store in database
    $doctrine_wrapper = $container->get('doctrineWrapper');
    $logger = $container->get('logger');
    $session_wrapper = $container->get('sessionWrapper');
    $user_id = $session_wrapper->getSessionVar('delete_user_id');


    // // Doctrine wrapper setup
    $database_connection_settings = $container->get('settings')['doctrineSettings'];
    $database_connection = DriverManager::getConnection($database_connection_settings);
    $query_builder = $database_connection->createQueryBuilder();
    $doctrine_wrapper->setQueryBuilder($query_builder);
    $doctrine_wrapper->setDoctrineLogger($logger);

    //TODO: make sure id and timestamp are set as session vars before storing

    $session_wrapper->unsetSessionVar('delete_user_id');

    $doctrine_wrapper->deleteUser($user_id);
    if($doctrine_wrapper->getQueryResult()){
        return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts?deleted=true', 302);
    }

    return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts?deleted=false', 302);


  

})->setName('edit-orders');
