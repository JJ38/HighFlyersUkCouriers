<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use MrShan0\PHPFirestore\FirestoreClient;

$app->get('/delete-multiple-orders', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){

        return $this->view->render($response,'delete-multiple-orders.html');
    }
    
    
    return $response->withRedirect('loginpage', 302);
    
});


$app->post('/delete-multiple-orders', function (Request $request, Response $response) use ($app) : Response{    

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){

        $container = $app->getContainer();
        
        $allPostVars = $request->getParsedBody();
        $validator = $container->get('sanitizer');

        $ids = [];

        foreach($allPostVars as $key => $value){
            

            $sanitized_id = $validator->sanitizeString($value);

            if($sanitized_id){
                array_push($ids, $sanitized_id);
            }else{

                return $response->withRedirect('manage-orders?deleted=false', 302);

            }
        }

        //add in order id
        putenv("GOOGLE_APPLICATION_CREDENTIALS=../highflyersukcouriers-a9c17-firebase-adminsdk-fbsvc-9bf9b914eb.json"); 

        $logger = $container->get('logger');  
        $delete_order_model = $container->get('deleteOrderModel');

        try{
            
            $env = parse_ini_file(realpath('../.env'));
        
            $projectID = $env['FIREBASE_PROJECT_ID'];
            $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];
        
            $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
                'database' => '(default)',
            ]);
        
            $delete_order_model->setFirebaseFirestore($firestore);
        
          }catch(Exception $e){
        
              if($logger != null){
                  $logger->error('FIREBASE_INIT_ERROR', array($e));
                  $logger->error('FIREBASE_INIT_ENV', array($env));
              }
        
              return $response->withRedirect('/manage-accounts?error=dberror', 302);
        
          }

        
        $delete_order_model->setLogger($logger);
        $delete_order_model->setDocRefArray($ids);
        $delete_order_model->bulkDeleteOrder();




        $query_result = $delete_order_model->getFirebaseFirestoreResult();

        if($query_result){
            return $response->withRedirect('manage-orders?deleted=true', 302);
        }

        $unsuccessfullyDeletedTally = $delete_order_model->getUnsuccessfullyDeletedTally();
        $numberOfOrders = count($ids);

        return $response->withRedirect('manage-orders?partiallyDeleted=' . $unsuccessfullyDeletedTally . "/" . $numberOfOrders, 302);

    }

    return $response->withRedirect('manage-orders', 302);

});