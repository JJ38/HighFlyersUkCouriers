<?php

use DI\Container;
use DI\ContainerBuilder;
use Psr\Container\ContainerInterface;
use Slim\App;
use Slim\Factory\AppFactory;
/** Creates a Session. */
session_start();

/** Regenerates Session ID at each page within application. */
// session_regenerate_id(true);

/** <PSR-4> Autoloading using <Composer>. */
require '../vendor/autoload.php';

/** Settings File - Global Constants and Configurations. */
$settings = require __DIR__ . '/app/' . 'settings.php';

/** Points to relative /app/ directory. */
$app_path = __DIR__ . APP_PATH;

/** Instantiation of Slim DIC. */
$container = new \Slim\Container($settings);

/** Dependencies File - Using DIC Containers for different classes. */
require $app_path . 'dependencies.php';

/** Instantiation of Slim App. */
//$app = AppFactory::create();
$app = new \Slim\App($container);

/** Routes and Middleware. */
require $app_path . 'routes.php';
require $app_path . 'middleware.php';

$app->run();
