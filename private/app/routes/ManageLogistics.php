<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;



$app->get('/manage-logistics', function (Request $request, Response $response) use ($app) : Response{

    
    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin"){
  
        return $this->view->render($response,'ManageLogistics.twig', array(
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "ManageLogistics.css",
                'css_nav_file' => CSS_PATH . "NavigationBar.css",
                'asset_path' => ASSET_PATH,
                'js_file' => JS_PATH . "ManageLogistics.js",
                'landing_page' => __FILE__,
                'heading_1' => APP_TITLE,
            ));
    }else{
    
        return $response->withRedirect('loginpage', 302);
    }
  });