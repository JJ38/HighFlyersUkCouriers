<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/customer-order', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "customer"){

        $allGetVars = $_GET;

        if(!empty($allGetVars)){   
    
            $cleaned_updated = $allGetVars['updated'];
    
    
            if($cleaned_updated == "true"){
                echo "<script>alert('profile updated!');</script>";
            }
        }
    
        if($account_type == "customer"){
            return $this->view->render($response,'CustomerOrder.twig', array(
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "CustomerOrder.css",
                'css_nav_file' => CSS_PATH . "NavigationBar.css",
                'css_footer_file' => CSS_PATH . "Footer.css",
                'asset_path' => ASSET_PATH,
                'js_file' => JS_PATH . "CustomerOrder.js",
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
    
    }

    
    return $response->withRedirect('loginpage', 302);
    

    
   
})->setName('');
