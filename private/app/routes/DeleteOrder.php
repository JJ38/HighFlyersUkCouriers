<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;

$app->get('/delete-order[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){


      return $this->view->render($response,'delete-order.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "DeleteOrder.css",
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
          )
      );
    }

    return $response->withRedirect('loginpage', 302);
    
});

$app->post('/delete-order', function (Request $request, Response $response) use ($app) : Response
{

  $account_type = $request->getAttribute('accountType');

  if($account_type == "admin" || $account_type == "staff"){

    $allGetVars = $request->getParsedBody();
    $docRef = $allGetVars['docRef'];


    if(empty($docRef)){
      return $response->withRedirect('/manage-orders?deleted=false', 302);
    }

    $container = $app->getContainer();
    $logger = $container->get('logger');
    $delete_order_model = $container->get('deleteOrderModel');
    $add_order_model = $container->get('addOrderModel');

    $delete_order_model->setLogger($logger);
    $delete_order_model->setDocRef($docRef);

    $add_order_model->setLogger($logger);
    $add_order_model->fetchOAuth2Token();

    $accessToken = $add_order_model->getOAuth2Token();

    try{
              
      $client = new GuzzleHttp\Client(['headers' => ['Authorization' => 'Bearer ' . $accessToken]]);
          
      $env = parse_ini_file(realpath('../.env'));
  
      $projectID = $env['FIREBASE_PROJECT_ID'];
      $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];
  
      $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
          'database' => '(default)',
      ], $client);
      
      $delete_order_model->setFirebaseFirestore($firestore);

    }catch(Exception $e){

        if($logger != null){
            $logger->error('FIREBASE_INIT_ERROR', array($e));
            $logger->error('FIREBASE_INIT_ENV', array($env));
        }

        return $response->withRedirect('/manage-accounts?error=dberror', 302);

    }
  
    $delete_order_model->deleteOrder();
    $query_result = $delete_order_model->getFirebaseFirestoreResult();

    if($query_result){
      return $response->withRedirect('/manage-orders?deleted=true', 302);
    }

    return $response->withRedirect('/manage-orders?deleted=false', 302);
  }

  return $response->withRedirect('/loginpage', 302);
  

})->setName('edit-orders');
