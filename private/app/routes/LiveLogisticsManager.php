<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;



$app->get('/live-logistics-manager', function (Request $request, Response $response) use ($app) : Response{

    
    $account_type = $request->getAttribute('accountType');
   

    if($account_type == "admin"){
        
        $env = parse_ini_file(realpath('../.env'));

        $api_key = $env['MAPS_JAVASCRIPT_API_KEY'];
  
        return $this->view->render($response,'live-logistics-manager.html', array(
                'places_api_key' => $api_key,
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "ManageLogistics.css",
                'css_nav_file' => CSS_PATH . "NavigationBar.css",
                'css_admin_panel' => CSS_PATH . "AdminPanel.css",
                'asset_path' => ASSET_PATH,
                'js_file' => JS_PATH . "ManageLogistics.js",
                'landing_page' => __FILE__,
                'heading_1' => APP_TITLE,
            ));
    }else{

      
        return $response->withRedirect('loginpage', 302);
    }
});