<?php
/**
 * logout.php
 *
 * Responsible for logging out a user and unsetting session variables accordingly.
 *
 * @package telemetry_processing
 *
 * @author James Brass
 * @author Mo Aziz
 * @author Ryan Instrell
 */

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->get('/logout', function (Request $request, Response $response) use ($app) : Response
{
    if (checkIfAuthenticated($app)) {
        logoutUser($app);
    }

    return $response->withRedirect('/', 302);
})->setName('logout');

/**
 * Checks if the relevant session value is set prior to logging a user out.
 *
 * @param $app
 * @return bool
 */
function checkIfAuthenticated($app) : bool
{
    $session_wrapper = $app->getContainer()->get('sessionWrapper');

    return !empty($session_wrapper->getSessionVar('user'));
}

/**
 * Unsets all session variables associated with the specific user.
 *
 * @param $app
 * @return void
 */
function logoutUser($app) : void
{
    $session_wrapper = $app->getContainer()->get('sessionWrapper');

    $session_wrapper->unsetSessionVar('user');
    $session_wrapper->unsetSessionVar('accountType');
}
