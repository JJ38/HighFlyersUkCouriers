<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;
use Kreait\Firebase\Factory;


use Throwable;

$app->get('/add-user[/usernameavailable]', function (Request $request, Response $response, $args) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){

        $container = $app->getContainer();
        

        $allGetVars = $_GET;

        if(!empty($allGetVars)){
            if(!empty($allGetVars['usernameavailable'])){
                $sanitizer = $container->get('sanitizer');
                $cleaned_parameters['usernameavailable'] = $sanitizer->sanitizeBoolean($allGetVars['usernameavailable']);

                if($cleaned_parameters['usernameavailable'] == 'false'){
                    echo "<script>alert('Username not available');</script>";
                }
            }
        }

        return $this->view->render($response,'add-user.html', array(
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "AddUser.css",
                'asset_path' => ASSET_PATH,
                'js_path' => JS_PATH . "",
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
    }

    return $response->withRedirect('loginpage', 302);
    
});


$app->post('/add-user', function (Request $request, Response $response) use ($app) : Response
{   
    $account_type = $request->getAttribute('accountType');
 

    if($account_type == "admin"){

        putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); //works
        
        $container = $app->getContainer();
        $logger = $container->get('logger');
        $manageAccountsModel = $container->get('manageAccountsModel');
        $manageAccountsModel->setLogger($logger);
    
            
        $factory = new Factory();
        $auth = $factory->createAuth();
    
        $tainted_parameters = $request->getParsedBody();
        $cleaned_parameters = cleanUserData($container, $tainted_parameters);


        //if one of the parameters does not meet requirements
        if(empty($cleaned_parameters)){
        
            return $response->withRedirect('/manage-accounts?error=true', 302);
        }

        $userCredentials = [
            'email' =>  $cleaned_parameters['username'],
            'password' =>  $cleaned_parameters['password'],
        ];



        $manageAccountsModel->setFirebaseAuth($auth);
        $manageAccountsModel->setCredentials($userCredentials);
        $manageAccountsModel->setRole($cleaned_parameters['accountType']);
        $manageAccountsModel->createUser();

        if($manageAccountsModel->getFirebaseAuthResult() == false){
            return $response->withRedirect('/manage-accounts?error=fireauth', 302);
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

            return $response->withRedirect('/manage-accounts?error=firestoreinit', 302);

        }


        if($manageAccountsModel->getFirebaseFirestoreResult() == false){
            return $response->withRedirect('/manage-accounts?error=firestore', 302);
        }
    

        return $response->withRedirect('/manage-accounts?success=true', 302);

    }

    return $response->withRedirect('loginpage', 302);


})->setName('add-user');


function cleanUserData($container, $tainted_user_data) : array{

    $cleaned_parameters = [];

    $sanitizer =  $container->get('sanitizer');

    $cleaned_parameters['password'] = $tainted_user_data['password'];
    
    $cleaned_parameters['username'] = $sanitizer->sanitizeUsername($tainted_user_data['username']);
   
    $cleaned_parameters['accountType'] = $sanitizer->sanitizeAccountType($tainted_user_data['isadmin']);

    return $cleaned_parameters;

    if($cleaned_parameters['accountType'] == null || empty($cleaned_parameters['username'])){     
        $cleaned_parameters = [];
    }


    return $cleaned_parameters;
}