<?php

use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/view-order[/id]', function (Request $request, Response $response) use ($app) : Response{

    $account_type = $request->getAttribute('accountType');

    if($account_type == "admin" || $account_type == "staff"){

        $allGetVars = $request->getQueryParams();

        return $this->view->render($response,'view-order.html', array(
                'page_title' => APP_TITLE,
                'css_file' => CSS_PATH . "DeleteOrder.css",
                'asset_path' => ASSET_PATH,
                'js_path' => JS_PATH . "",
                'landing_page' => __FILE__,
                'heading_1' => APP_TITLE,
            )
        );
    }

    return $response->withRedirect('loginpage', 301);

});