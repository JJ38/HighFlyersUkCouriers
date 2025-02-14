<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Value\Uid;
use Google\Cloud\Firestore\FirestoreClient;

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
    
        $container = $app->getContainer();
        $factory = (new Factory)->withServiceAccount('../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-12de523cbb.json');
        $auth = $factory->createAuth();
    
        $tainted_parameters = $request->getParsedBody();
    
        $cleaned_parameters = cleanUserData($container, $tainted_parameters);
        //if one of the parameters does not meet requirements
        
        
        if(empty($cleaned_parameters)){
          
            return $response->withRedirect('/manage-accounts?error=true', 302);
        }

        $userProperties = [
            'email' =>  $cleaned_parameters['username'],
            'password' =>  $cleaned_parameters['password'],
        ];
        
        $createdUser = $auth->createUser($userProperties);
        $uid = $createdUser->uid;
        var_dump($uid);
        $auth->setCustomUserClaims($uid, ['role' => $cleaned_parameters['accountType']]);

        //create docuement in users collection to store roles for admin panel to see role information

        // $db = new FirestoreClient();

        // $firestore = $factory->withFirestoreClientConfig([ "apiKey" => "AIzaSyBHkjHITuk2opFgiG2wG36WJE6CDmb4tK4",
        // "authDomain" => "highflyersukcouriers-a9c17.firebaseapp.com",
        // "projectId" => "highflyersukcouriers-a9c17",
        // "storageBucket" => "highflyersukcouriers-a9c17.firebasestorage.app",
        // "messagingSenderId" => "970355130070",
        // "appId" => "1:970355130070:web:b2ff0ee62b6b9ac2339377",
        // "measurementId" => "G-93M1E0Q9FJ",])->createFirestore();
        // $firestore = $factory->createFirestore();
        // $database = $firestore->database();

        // $docRef = $database->collection('users')->document('alovelace');
        // $docRef->set([
        //     'first' => 'Ada',
        //     'last' => 'Lovelace',
        //     'born' => 1815
        // ]);
    


        return $response->withRedirect('/manage-accounts', 302);

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