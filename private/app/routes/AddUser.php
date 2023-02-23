<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


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



    return $this->view->render($response,'AddUser.twig', array(
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
    $account_type = $request->getAttribute('isAdmin');

    if(1 == 1){
        $container = $app->getContainer();

        $tainted_parameters = $request->getParsedBody();
        $cleaned_parameters = cleanUserData($container, $tainted_parameters);
        //if one of the parameters does not meet requirements
        
        
        if(empty($cleaned_parameters)){
          
            return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts?error=true', 302);
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


        //check for duplicate users
        $doctrine_wrapper->checkIfUsernameAvailable($cleaned_parameters['username']);
        $is_username_available = $doctrine_wrapper->getQueryResult();

        if($is_username_available){
            //store username

            // var_dump($cleaned_parameters);
            // echo "username is available";

            // return $response;

            //hash password
            $bcryptWrapper = $container->get('bcryptWrapper');

            $cleaned_parameters['password'] = $bcryptWrapper->createHashedPassword($cleaned_parameters['password']);

            $doctrine_wrapper->storeUserDetails($cleaned_parameters['username'], $cleaned_parameters['password'], $cleaned_parameters['accountType']);

            if($cleaned_parameters['accountType'] == "customer"){

                $doctrine_wrapper->createCustomer($cleaned_parameters['username']);
                
            }
     

        }else{
            return $response->withRedirect('/HighFlyersUkCouriers/public/add-user?usernameavailable=false', 302);
        }

        //store data
        return $response->withRedirect('/HighFlyersUkCouriers/public/manage-accounts', 302);

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