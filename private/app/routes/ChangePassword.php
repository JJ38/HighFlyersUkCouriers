<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Kreait\Firebase\Factory;


$app->get('/change-password[/id/equalpasswords]', function (Request $request, Response $response, $args) use ($app) : Response{


  $account_type = $request->getAttribute('accountType');
 
  if($account_type == "admin"){
    $allGetVars = $_GET;
    if(empty($allGetVars['id'])){
        return $response->withRedirect('manage-accounts', 302);
    }

    $container = $app->getContainer();

    if(!empty($allGetVars['equalpasswords'])){
        $sanitizer = $container->get('sanitizer');
        $cleaned_equal_passwords = $sanitizer->sanitizeBoolean($allGetVars['equalpasswords']);
        if($cleaned_equal_passwords == "false"){
            echo "<script>alert('error: passwords not equal')</script>";
        }
    }

    $session_wrapper = $container->get('sessionWrapper');
    $session_wrapper->setSessionVar('CHANGE_PASSWORD_UID', $allGetVars['id']);
    
    
    return $this->view->render($response,'change-password.html', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "ChangePassword.css",
            'asset_path' => ASSET_PATH,
            ));
    }else{

      return $response->withRedirect('loginpage', 302);
    }
});


$app->post('/change-password', function (Request $request, Response $response) use ($app) : Response
{

  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin"){
      
    putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json");

    $tainted_parameters = $request->getParsedBody();
    $container = $app->getContainer();

    $session_wrapper = $container->get('sessionWrapper');
    $uid = $session_wrapper->getSessionVar('CHANGE_PASSWORD_UID');

 

    //if one of the parameters does not meet requirements
    if(empty($uid)){
      return $response->withRedirect('/manage-accounts?error=true', 302);
    }

    //are passwords equal
    $password = $tainted_parameters['password'];
    $confirm_password = $tainted_parameters['confirmpassword'];
    

    if($password != $confirm_password){
      return $response->withRedirect("/change-password?id=" . $uid. "&equalpasswords=false", 302);

    }

        
    //setup manage accounts model

    $factory = new Factory();
    $auth = $factory->createAuth();
  
    $logger = $container->get('logger');

    $manage_accounts_model = $container->get('manageAccountsModel');

    $manage_accounts_model->setLogger($logger);
    $manage_accounts_model->setFirebaseAuth($auth);
    $manage_accounts_model->setUID($uid);
    $manage_accounts_model->changeUserPassword($password);


    if($manage_accounts_model->getFirebaseAuthResult() == false){
      return $response->withRedirect('/manage-accounts?passwordreset=false', 302);
    }

    $session_wrapper->unsetSessionVar('CHANGE_PASSWORD_UID');
    
    return $response->withRedirect('/manage-accounts?passwordreset=true', 302);
    
  }else{
    return $response->withRedirect('/loginpage', 302);
  }

})->setName('change-password');

