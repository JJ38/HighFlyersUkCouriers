<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
use Kreait\Firebase\Factory;

$app->get('/delete-user[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){

      $allGetVars = $request->getQueryParams();

      if(!empty($allGetVars['id'])){
        $container = $app->getContainer();

        $tainted_user_id = $allGetVars['id'];

        $sanitizer = $container->get('sanitizer');
        $cleaned_user_id = $sanitizer->sanitizeString($tainted_user_id);

        $session_wrapper = $container->get('sessionWrapper');
        $session_wrapper->setSessionVar('delete_user_id', $cleaned_user_id);
       
        if(empty($cleaned_user_id)){
          return $response->withRedirect('manage-accounts', 302);
        }


       

      }else{
        return  $response->withRedirect('manage-accounts', 302);
      }

      return $this->view->render($response,'delete-user.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "DeleteUser.css",
          ));
    }else{

      return $response->withRedirect('loginpage', 302);
    }
});

$app->post('/delete-user', function (Request $request, Response $response) use ($app) : Response
{

  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin"){
    
    $container = $app->getContainer();
    $session_wrapper = $container->get('sessionWrapper');
    $logger = $container->get('logger');
    $uid = $session_wrapper->getSessionVar('delete_user_id');
    $session_wrapper->unsetSessionVar('delete_user_id');

    putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json");
    $container = $app->getContainer();
    $sanitizer = $container->get('sanitizer');
    $cleaned_user_id = $sanitizer->sanitizeString($uid);

    $factory = new Factory();

    //create Auth
    $auth = $factory->createAuth();

    $authentication_model = $container->get('authenticationModel');
  
    $authentication_model->setLogger($logger);
    $authentication_model->fetchOAuth2Token();

    $firestore = $authentication_model->getAuthenticatedFirebaseClient();


    if($firestore == null){
      return  $response->withRedirect('manage-accounts?error=true', 302);
    }
    
    //setup manage accounts model
    $manage_accounts_model = $container->get('manageAccountsModel');

    $manage_accounts_model->setLogger($logger);
    $manage_accounts_model->setFirebaseFirestore($firestore);
    $manage_accounts_model->setFirebaseAuth($auth);
    $manage_accounts_model->setUID($cleaned_user_id);
    $manage_accounts_model->deleteUser();

    if($manage_accounts_model->getDeleteUserResult() == false){
      return  $response->withRedirect('manage-accounts?error=true', 302);
    }

    return $response->withRedirect('/manage-accounts?deleted=true', 302);

  }

  return $response->withRedirect('/loginpage', 302);


})->setName('edit-orders');
