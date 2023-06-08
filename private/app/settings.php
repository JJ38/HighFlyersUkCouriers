<?php

//Paths
$app_title = 'HighFlyersUkCouriers';
$app_path = '/app/';
$template_path = __DIR__ . '/templates/';
//$css_file_name = 'styles.css';
$css_path = '/css/';
$asset_path = '/assets/';
$js_path = '/js/';
$log_path = '../logs/';
$base_path = "/HighFlyersUkCouriers/public";

//Constants defined
define('APP_TITLE', $app_title);
define('APP_PATH', $app_path);
define('TEMPLATE_PATH', $template_path);
define('CSS_PATH', $css_path);
define('ASSET_PATH', $asset_path);
define('JS_PATH', $js_path);
define('LOG_PATH', $log_path);
define('BASE_PATH', $base_path);

//Constants for Bcrpyt
define ('BCRYPT_ALGO', PASSWORD_DEFAULT);
define ('BCRYPT_COST', PASSWORD_BCRYPT_DEFAULT_COST); //10

// Should be set to 0 in production
error_reporting(E_ALL);

// Should be set to '0' in production
ini_set('display_errors', '1');

// Settings
return array(
    'settings' => array(
        'displayErrorDetails' => true,
        'addContentLengthHeader' => false,
        'mode' => 'development',
        'debug' => true,
        'view' => array(
            'twig_attributes' => array(
                'cache' => false,
                'auto_reload' => true,
            )
        ),
        'doctrineSettings' => array(
            'driver' => 'pdo_mysql',
            'host' => 'localhost',
            'dbname' => 'highflyersukcouriers',
            'port' => '3306',
            'user' => 'user',
            'password' => 'password',
            'charset' => 'utf8'
        ),
        'mailerBookingSettings' => array(
            'username' => 'jamesjbrass@gmail.com', //highflyerscouriers@gmail.com
            'password' => 'cqktvkkjpxobcjcw', //tgslhgadszechaqg
            'port' => 25,
            'host' => 'smtp.gmail.com'
        ),
        'mailerContactUsSettings' => array(
            'username' => 'highflyerscourierscontactus@gmail.com',
            'password' => 'cpmmeumthmmmjynr',
            'port' => 25,
            'host' => 'smtp.gmail.com'
        )
    )
);
