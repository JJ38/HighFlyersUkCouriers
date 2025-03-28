<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

use Datetime;
use DateTimeZone;

$app->get('/manage-orders[/updated]', function (Request $request, Response $response, $updated="null") use ($app) : Response{


    $current_date = new DateTime();
    $current_date->setTimezone(new DateTimeZone('Europe/London'));

    echo $current_date->format("Y-m-d H:i:s P T");

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){

      return $this->view->render($response,'manage-orders.html', array(
              'page_title' => APP_TITLE,
              'css_file' => CSS_PATH . "ManageOrders.css",
              'asset_path' => ASSET_PATH,
              'js_file' => JS_PATH . "ManageOrders.js",
              'landing_page' => __FILE__,
              'heading_1' => APP_TITLE,
              'isAdmin' => $account_type == "admin",
          ));
    }

    return $response->withRedirect('loginpage', 301);
    
});


