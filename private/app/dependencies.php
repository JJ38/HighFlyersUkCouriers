<?php

use Slim\Views\Twig;
use Slim\Views\TwigExtension;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

$container['view'] = function ($container) {
    $view = new \Slim\Views\Twig(__DIR__ . '/templates',  $container['settings']['view']['twig_attributes']);
    // Instantiate and add Slim specific extension
    $basePath = rtrim(str_ireplace('index.php', '', $container['request']->getUri()->getBasePath()), '/');
    $view->addExtension(new Slim\Views\TwigExtension($container['router'], $basePath));
    return $view;
};

$container['logger'] = function ()
{
    $logger = new Logger('logger');

    /* Logs of level NOTICE */
    $log_notice_name = 'notice.log';
    $log_notice_path = LOG_PATH . $log_notice_name;
    $notice_stream_handler = new StreamHandler($log_notice_path, Logger::NOTICE);

    /* Logs of level ERROR */
    $log_error_name = 'error.log';
    $log_error_path = LOG_PATH . $log_error_name;
    $error_stream_handler = new StreamHandler($log_error_path, Logger::ERROR);

    $logger->pushHandler($notice_stream_handler);
    $logger->pushHandler($error_stream_handler);

    return $logger;
};

$container['sanitizer'] = function () {
  return new \HighFlyersUkCouriers\Sanitizer();
};

$container['validator'] = function () {
  return new \HighFlyersUkCouriers\Validator();
};

$container['loginModel'] = function () {
  return new \HighFlyersUkCouriers\LoginModel();
};

$container['doctrineWrapper'] = function () {
  return new \HighFlyersUkCouriers\DoctrineWrapper();
};

$container['bcryptWrapper'] = function () {
  return new \HighFlyersUkCouriers\BcryptWrapper();
};

$container['sessionWrapper'] = function () {
  return new \HighFlyersUkCouriers\SessionWrapper();
};

$container['authenticationMiddleware'] = function () {
  return new \HighFlyersUkCouriers\AuthenticationMiddleware();
};

$container['mailer'] = function () {
  return new \HighFlyersUkCouriers\Mailer();
};

$container['manageOrderModel'] = function () {
  return new \HighFlyersUkCouriers\ManageOrderModel();
};

$container['addOrderModel'] = function () {
  return new \HighFlyersUkCouriers\AddOrderModel();
};

$container['editOrderModel'] = function () {
  return new \HighFlyersUkCouriers\EditOrderModel();
};

$container['deleteOrderModel'] = function () {
  return new \HighFlyersUkCouriers\DeleteOrderModel();
};


$container['customerProfileModel'] = function () {
  return new \HighFlyersUkCouriers\CustomerProfileModel();
};

$container['manageAccountsModel'] = function () {
  return new \HighFlyersUkCouriers\ManageAccountsModel();
};

$container['authenticationModel'] = function () {
  return new \HighFlyersUkCouriers\AuthenticationModel();
};

$container['calculateRouteModel'] = function () {
  return new \HighFlyersUkCouriers\CalculateRouteModel();
};

$container['notFoundHandler'] = function ($container) {
  return function ($request, $response) use ($container) {
      return  $response->withRedirect('/', 302);
  };
};
