<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->post('/view-customer-order', function (Request $request, Response $response) use ($app) : Response
{   
    
    $tainted_parameters = $request->getParsedBody();

    $order_details = '"<html lang="en">'.
    '<head>'.
    
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'.
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">'.
    '<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'.
    
    '<link rel="stylesheet" href="/css/CustomerOrder.css" type="text/css">'.
    
    '</head>'.
    '<body>';


    $order_details = $order_details . '<div id="table">'.
        '<div class="columns tablerow headerrow">'.
        
        '<h3>Animal</h3>'.
        '<h3>Quantity</h3>'.
        '<h3>Name</h3>'.
        '<h3>Delivery address</h3>'.
        '<h3>Delivery telephone</h3>'.
        '<h3>Payment</h3>'.
        '<h3></h3>'.
        ''.
        '</div>'.
        '<div class="tablerow"><div class="transportinfowrapper"><div class="hidden collectiondeliveryicons transporticons"><i class="fa-solid fa-box-open" title="collection"></i><i class="fa-solid fa-ellipsis-vertical"></i><i class="fa-solid fa-truck" title="delivery"></i></div><div class="columns hidden collectioninfomargin"><p>Pigeon</p><p>2</p><p>James</p><div class="onelineaddress"><p>10 Kenilworth Road</p><p>Derby</p><p>Derbyshire</p><p>DE5 3GY</p></div><p>07842133519</p><p></p></div><div class="columns deliveryinfomargin"><p class="">Pigeon</p><p>2</p><p>Katherine</p><div class="onelineaddress"><p>16 York Street Flat 7</p><p>Leicester</p><p>Derbyshire</p><p>LE1 6NU</p></div><p>07842133519</p><p class="">Collection</p><div class="expand" onclick="toggleExpand(this)"><p>V</p></div></div></div><div class="extrainfo hidden"><div><i class="fa-solid fa-at" title="email"></i><p>jamesbrass@ymail.com</p></div><div><i class="fa-solid fa-credit-card" title="payment on delivery or collection"></i><p>Collection</p></div><div><i class="fa-solid fa-message" title="message"></i><p>Message</p></div></div><div class="deletewrapper hidden" onclick="deleteOrder(this)"><i class="fa-solid fa-trash-can"></i></div><input type="hidden" name="id" value="0"></div>'.
        ''.
        '</div>'
        ;


    $order_details = $order_details . 
            '<script type="text/javascript" src="/js/CustomerOrder.js"></script>'.
        '</body>'.
        
    '</html>';
    // $response->getBody()->write($tainted_parameters);

    echo $order_details;

    return $response;

    return $this->view->render($response, $order_details, array(
        'page_title' => APP_TITLE,
        'css_file' => CSS_PATH . "CustomerOrder.css",
        'asset_path' => ASSET_PATH,
        'js_path' => JS_PATH . "",
        'landing_page' => __FILE__,
        'heading_1' => APP_TITLE,
       
    ));

})->setName('view-customer-order');