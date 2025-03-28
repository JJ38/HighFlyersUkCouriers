<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/manage-accounts[/error/deleted/passwordreset]', function (Request $request, Response $response) use ($app) : Response{


    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){
      
      $cleaned_field = null;
      $cleaned_filter = null;

      $allGetVars = $_GET;
      if(!empty($allGetVars)){
        if(!empty($allGetVars['error'])){
          $tainted_error = $allGetVars['error'];
        
          $sanitizer = $app->getContainer()->get('sanitizer');
          $cleaned_error = $sanitizer->sanitizeBoolean($tainted_error);

          if($cleaned_error != "false"){
            echo "<script>alert('Error');</script>";
          }
        }
        if(!empty($allGetVars['deleted'])){
          $tainted_deleted = $allGetVars['deleted'];
        
          $sanitizer = $app->getContainer()->get('sanitizer');
          $cleaned_deleted = $sanitizer->sanitizeBoolean($tainted_deleted);
          if($cleaned_deleted == "true"){
            echo "<script>alert('User deleted successfully');</script>";
          }

          if($cleaned_deleted == "false"){
            echo "<script>alert('Error user not deleted');</script>";

          }
        }

        if(!empty($allGetVars['passwordreset'])){
          $tainted_deleted = $allGetVars['passwordreset'];
        
          $sanitizer = $app->getContainer()->get('sanitizer');
          $cleaned_deleted = $sanitizer->sanitizeBoolean($tainted_deleted);
          if($cleaned_deleted == "true"){
            echo "<script>alert('Password changed successfully');</script>";
          }

          if($cleaned_deleted == "false"){
            echo "<script>alert('Error password was not changed');</script>";

          }
        }

        if(!empty($allGetVars['field'])){
          if(!empty($allGetVars['filter'])){
            $tainted_field = $allGetVars['field'];
            $tainted_filter = $allGetVars['filter'];

            $cleaned_field = $tainted_field;
            $cleaned_filter = $tainted_filter;
          }

        }
      }

  

      return $this->view->render($response,'manage-accounts.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageAccounts.css",
              'asset_path' => ASSET_PATH,));
    }else{

      return $response->withRedirect('loginpage', 302);
    }
});
