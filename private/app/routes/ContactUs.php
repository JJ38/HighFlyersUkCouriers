<?php


use Doctrine\DBAL\DriverManager;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;


$app->get('/contact-us[/invalidform]', function (Request $request, Response $response) use ($app) : Response{

  $allGetVars = $_GET;

  if(!empty($allGetVars)){
    $tainted_invalid_form = $allGetVars['invalidform'];
    $sanitizer = $app->getContainer()->get('sanitizer');
    $cleaned_invalid_form = $sanitizer->sanitizeBoolean($tainted_invalid_form);

    if($cleaned_invalid_form != null){

      if($cleaned_invalid_form === "false"){
        echo "<script>alert('Email sent - You should recieve an email shortly confirming your email has been sent');</script>";
      }else{
        echo "<script>alert('invalid form - please submit a valid form');</script>";
      }
    }
  };

  return $this->view->render($response,'NewContactUs.twig', array(
          'page_title' => APP_TITLE,
          'css_file' => CSS_PATH . "NewContactUs.css",
          'css_nav_file' => CSS_PATH . "NavigationBar.css",
          'css_footer_file' => CSS_PATH . "Footer.css",
          'asset_path' => ASSET_PATH,
          'js_file' => JS_PATH . "NewContactUs.js",
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
});


$app->post('/contact-us', function (Request $request, Response $response) use ($app) : Response
{

  $container = $app->getContainer();

  $tainted_parameters = $request->getParsedBody();
  $cleaned_parameters = cleanContactUsForm($container, $tainted_parameters);
  //if one of the parameters does not meet requirements

  if(empty($cleaned_parameters)){
    return $response->withRedirect('/HighFlyersUkCouriers/public/contact-us?invalidform=true', 302);
    
  }

  //if cleaned and ready to send emails and store

 

  //store in database
  $doctrine_wrapper = $container->get('doctrineWrapper');
  $logger = $container->get('logger');

  //TODO: popups for database error


  //send email

  $mailer = $container->get('mailer');
  $mailer_settings = $container->get('settings')['mailerSettings'];
  $mailer->setMailerSettings($mailer_settings);
  
  $mailer->setMailData($cleaned_parameters);
  $mailer->sendMailCustomerContactUs();
  $mailer->sendMailInternalContactUs();

  return $response->withRedirect('/HighFlyersUkCouriers/public/contact-us?invalidform=false', 302);


})->setName('contact-us');

function cleanContactUsForm($container, $tainted_parameters) : array{

  $cleaned_parameters = [];


  $sanitizer = $container->get('sanitizer');
  $validator = $container->get('validator');

  $sanitized_parameters['email'] = $sanitizer->sanitizeEmail($tainted_parameters['email']);
  $cleaned_parameters['email'] = $validator->validateEmail($sanitized_parameters['email']);
  if(!$validator->getValidationResult()){
    $cleaned_parameters = array();
    return $cleaned_parameters;
  }

  $sanitized_parameters['phone'] = $sanitizer->sanitizePhoneNumber($tainted_parameters['phone']);
  $cleaned_parameters['phone'] = $validator->validatePhoneNumber($sanitized_parameters['phone']);
  if(!$validator->getValidationResult()){
    $cleaned_parameters = array();
    return $cleaned_parameters;
  }

  $cleaned_parameters['name'] = $sanitizer->sanitizeString($tainted_parameters['name']);
  $cleaned_parameters['message'] = $sanitizer->sanitizeString($tainted_parameters['message']);

  return $cleaned_parameters;

}