<?php
use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
use Kreait\Firebase\Factory;

$app->post('/login-legacy', function (Request $request, Response $response) use ($app) : Response
{   

    $tainted_parameters = $request->getParsedBody();
    $cleaned_parameters = cleanLoginData($app, $tainted_parameters);
  
    $response->getBody()->write($cleaned_parameters['username']);
    $response->getBody()->write($cleaned_parameters['password']);

    // Get models + Wrappers
    $container = $app->getContainer();
    $login_model = $container->get('loginModel');
    $bcrypt_wrapper = $container->get('bcryptWrapper');
    $doctrine_wrapper = $container->get('doctrineWrapper');
    $session_wrapper = $container->get('sessionWrapper');
    $authentication_model = $container->get('authenticationModel');
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
   
    $login_model->login();
    $login_result = $login_model->getResult();

    if(!$login_result){
        
        //if legacy account doesnt exist
        $response->getBody()->write(" Legacy account does not exist");
        $response = $response->withStatus(401); //invalid credentials
        return $response;
        //authenticate front end

    }

    //If legacy account exists
    //create firebase account
    $manageAccountsModel = $container->get('manageAccountsModel');
    $manageAccountsModel->setLogger($logger);

    // $factory = new Factory();
    $factory = (new Factory)->withServiceAccount('../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json');
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

        $error_code = $manageAccountsModel->getErrorCode();

        //if email exists on firebase already even though legacy account does exist. Most likely user changed password and then entered password of old legacy account with vaild username
        if($error_code == 400){

            $response = $response->withStatus(401);
            return $response;
            
        }

        $response = $response->withStatus(500);
        return $response;
    }


    $authentication_model->setLogger($logger);
    $authentication_model->fetchOAuth2Token();

    $firestore = $authentication_model->getAuthenticatedFirebaseClient();


    if($firestore == null){

        $response = $response->withStatus(500);
        return $response;

    }

    $manageAccountsModel->setFirebaseFirestore($firestore);
    $manageAccountsModel->createFirestoreUserDocument();


    if($account_type == "customer"){

        //get customer profile data from legacy database;
        $doctrine_wrapper->fetchCustomerDetails($cleaned_parameters['username']);
        $customer_profile = $doctrine_wrapper->getQueryResult();//could be null
        
        $manageAccountsModel->setCustomerProfile($customer_profile);
        $manageAccountsModel->createFirestoreCustomerDocument();

    }

    $response = $response->withStatus(204); //204 response has been process and fulfilled but does not need to return a body
    return $response;
});

function cleanLoginData($app, array $tainted_parameters) : array
{
    $cleaned_parameters = array();

    $sanitizer = $app->getContainer()->get('sanitizer');

    $cleaned_parameters['username'] = $sanitizer->sanitizeUsername($tainted_parameters['username']);
    $cleaned_parameters['password'] = $tainted_parameters['password'];

    return $cleaned_parameters;
}
