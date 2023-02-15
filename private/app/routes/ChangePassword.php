<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/change-password[/id/equalpasswords]', function (Request $request, Response $response, $args) use ($app) : Response{

  $is_authenticated = $request->getAttribute('isAuthenticated');
  $is_admin = $request->getAttribute('isAdmin');
 
  if($is_authenticated && $is_admin){
    $allGetVars = $_GET;
    if(empty($allGetVars['id'])){
        return $response->withRedirect('manage-accounts', 302);
    }

    $container = $app->getContainer();


    $cleaned_id = cleanID($allGetVars['id'], $container);
    $equal_passwords = null;

    if(!empty($allGetVars['equalpasswords'])){
        $sanitizer = $container->get('sanitizer');
        $cleaned_equal_passwords = $sanitizer->sanitizeBoolean($allGetVars['equalpasswords']);
        if($cleaned_equal_passwords == "false"){
            echo "<script>alert('error: passwords not equal')</script>";
        }
    }

    
    $doctrine_wrapper = $container->get('doctrineWrapper');
    $logger = $container->get('logger');


    //Doctrine wrapper setup
    $database_connection_settings = $container->get('settings')['doctrineSettings'];
    $database_connection = DriverManager::getConnection($database_connection_settings);
    $query_builder = $database_connection->createQueryBuilder();
    $doctrine_wrapper->setQueryBuilder($query_builder);
    $doctrine_wrapper->setDoctrineLogger($logger);

    //check for valid id
    $doctrine_wrapper->fetchUserDataByField('id', $cleaned_id);
    $query_result = $doctrine_wrapper->getQueryResult();
    if(empty($query_result)){
        return $response->withRedirect('manage-accounts', 302);
    }
    
    return $this->view->render($response,'ChangePassword.twig', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "ChangePassword.css",
            'asset_path' => ASSET_PATH,
            'js_path' => JS_PATH . "",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            'userid' => $cleaned_id,
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


$app->post('/change-password', function (Request $request, Response $response) use ($app) : Response
{

  $tainted_parameters = $request->getParsedBody();

  //if one of the parameters does not meet requirements

  $container = $app->getContainer();

  //var_dump($tainted_parameters['accountid']);

  $cleaned_parameters = cleanChangePasswordForm($tainted_parameters, $container);

  if(empty($cleaned_parameters)){
    return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts', 302);
  }

  //are passwords equal

  $password = $cleaned_parameters['password'];
  $confirm_password = $cleaned_parameters['confirmpassword'];
  

  if($password != $confirm_password){
    return $response->withRedirect("/HighFlyersUkCouriers/public/change-password?id=" . $cleaned_parameters['id'] . "&equalpasswords=false", 302);

  }


  //store in database
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $logger = $container->get('logger');


  // // Doctrine wrapper setup
  $database_connection_settings = $container->get('settings')['doctrineSettings'];
  $database_connection = DriverManager::getConnection($database_connection_settings);
  $query_builder = $database_connection->createQueryBuilder();
  $doctrine_wrapper->setQueryBuilder($query_builder);
  $doctrine_wrapper->setDoctrineLogger($logger);

  $bcrypt_wrapper = $container->get('bcryptWrapper');
  $hashed_password = $bcrypt_wrapper->createHashedPassword($password);

  $doctrine_wrapper->changeUserPassword($cleaned_parameters['id'], $hashed_password);

  if($doctrine_wrapper->getQueryResult()){
    return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts?passwordreset=true', 302);
  }
  


  return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts?passwordreset=true', 302);
  


})->setName('change-password');


function cleanID($id, $container) : int{
 
  $sanitizer = $container->get('sanitizer');
  $validator = $container->get('validator');

  $saintized_id = $sanitizer->sanitizePositiveNumber($id);  
  $cleaned_id = $validator->validatePositiveNumber($saintized_id);  

  return $cleaned_id;   

}

function cleanChangePasswordForm($tainted_parameters, $container) : array{

    $sanitizer = $container->get('sanitizer');
    $validator = $container->get('validator');
  
    $cleaned_parameters = [];

    $saintized_id = $sanitizer->sanitizePositiveNumber($tainted_parameters['accountid']);  
    $cleaned_parameters['id'] = $validator->validatePositiveNumber($saintized_id);  

    $cleaned_parameters['password'] = $tainted_parameters['password'];
    $cleaned_parameters['confirmpassword'] = $tainted_parameters['confirmpassword'];

    return $cleaned_parameters;

}