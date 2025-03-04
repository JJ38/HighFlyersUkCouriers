<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Kreait\Firebase\Factory;
use MrShan0\PHPFirestore\FirestoreClient;

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


  // Get models + Wrappers
  $container = $app->getContainer();
  $login_model = $container->get('loginModel');
  $bcrypt_wrapper = $container->get('bcryptWrapper');
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $session_wrapper = $container->get('sessionWrapper');
  $logger = $container->get('logger');



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

  $login_result = false;

  //if not authenticated on firebase via the frontend
  if(empty($_POST['accessToken'])){
 
    $login_model->login();
    $login_result = $login_model->getResult();

    if($login_result){

      //create firebase account
      $manageAccountsModel = $container->get('manageAccountsModel');
      $manageAccountsModel->setLogger($logger);
  
      $factory = new Factory();
      $auth = $factory->createAuth();

      $userCredentials = [
          'email' =>  str_replace(" ", "", $cleaned_parameters['username']) . "@placeholder.com",
          'password' =>  $cleaned_parameters['password'],
      ];

      $account_type = $login_model->getAccountType();

      $manageAccountsModel->setFirebaseAuth($auth);
      $manageAccountsModel->setCredentials($userCredentials);
      $manageAccountsModel->setRole($account_type);
      $manageAccountsModel->createUser();

      $login_result = $manageAccountsModel->getFirebaseAuthResult();

      if($login_result == false){
        return $response->withRedirect('loginpage?error=fireauth', 302);
      }

      try{
          
        $env = parse_ini_file(realpath('../.env'));

        $projectID = $env['FIREBASE_PROJECT_ID'];
        $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];

        $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
            'database' => '(default)',
        ]);

        $manageAccountsModel->setFirebaseFirestore($firestore);
        $manageAccountsModel->createFirestoreUserDocument();

        

      }catch(Exception $e){

          if($logger != null){
              $logger->error('FIREBASE_INIT_ERROR', array($e));
              $logger->error('FIREBASE_INIT_ENV', array($env));
          }

          return $response->withRedirect('/loginpage?error=firestore', 302);

      }


      if($account_type == "customer"){

        //get customer profile data from legacy database;
        $doctrine_wrapper->fetchCustomerDetails($cleaned_parameters['username']);
        $customer_profile = $doctrine_wrapper->getQueryResult();//could be null
        // var_dump($customer_profile);
        // return $response;
        $manageAccountsModel->setCustomerProfile($customer_profile);
        $manageAccountsModel->createFirestoreCustomerDocument();

      }

    }

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
