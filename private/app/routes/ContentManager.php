<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

$app->get('/content-manager[/filepath]', function (Request $request, Response $response) use ($app) : Response{

$account_type = $request->getAttribute('accountType');

  if($account_type == "admin"){

    $allGetVars = $_GET;

    $selected_file = "NewHomepage.twig"; //default value if no file selected

    if(!empty($allGetVars['selectedpage'])){
      $selected_file = $allGetVars['selectedpage'];
    }

    $html_file_data = file_get_contents(TEMPLATE_PATH . '/' . $selected_file, true);
  

    return $this->view->render($response,'content-manager.html', array(
            'page_title' => APP_TITLE,
            'css_file' => CSS_PATH . "ContentManager.css",
            'css_nav_file' => CSS_PATH . "NavigationBar.css",
            'asset_path' => ASSET_PATH,
            'js_file' => JS_PATH . "ContentManager.js",
            'landing_page' => __FILE__,
            'heading_1' => APP_TITLE,
            'filedata' => $html_file_data,
            'selected' => $selected_file,
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
  }else{
    
    return $response->withRedirect('loginpage', 302);
  }
});


$app->post('/content-manager', function (Request $request, Response $response) use ($app) : Response{

  $is_authenticated = $request->getAttribute('isAuthenticated');

  if($is_authenticated){
    $is_authenticated = $request->getAttribute('isAuthenticated');

    $tainted_parameters = $request->getParsedBody();
    $editableDocument = $tainted_parameters['editabledocumentvalue'];
    $fileName = $tainted_parameters['filename'];
    $filePath = TEMPLATE_PATH . $fileName;

    // var_dump($fileName);

    // return $response;

    $newHTML = $editableDocument;
  
    //save file
    file_put_contents($filePath, $newHTML);
  }


  return $response->withRedirect('content-manager', 302);

});
