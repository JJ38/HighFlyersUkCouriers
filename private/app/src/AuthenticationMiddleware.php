<?php
/**
 * AuthenticationMiddleware.php
 *
 * Provides middleware to check if a user is authenticated.
 *
 * @package telemetry_processing
 * @\TelemProc
 *
 * @author James Brass
 * @author Mo Aziz
 * @author Ryan Instrell
 */

//This is simply an abstraction to check whether a user is authenticated by checking whether the user variable is set for the given session. This allows in the route to request an attribute from a request rather than have to manually check if the user variable is set everytime. Over engineering really

namespace HighFlyersUkCouriers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

class AuthenticationMiddleware
{
    /** @var resource $session_wrapper Contains the handle to <SessionWrapper>. */
    private $session_wrapper;

    public function __construct()
    {
        $this->session_wrapper = null;
    }

    /**
     * Sets <SessionWrapper>.
     *
     * @param $session_wrapper
     */
    public function setSessionWrapper($session_wrapper) : void
    {
        $this->session_wrapper = $session_wrapper;
    }

    /**
     * Invoke method for AuthenticationMiddleware.
     *
     * Gets invoked before every request
     *
     * @param Request $request PSR7 request
     * @param Response $response PSR7 response
     * @param callable $next Next middleware
     *
     * @return Response
     * @throws \Doctrine\DBAL\Exception
     */

     //This is invoked before every request
    public function __invoke(Request $request, Response $response, callable $next) : Response
    {
        $is_authenticated = false;
        $username = $this->session_wrapper->getSessionVar('user');
        $is_admin = $this->session_wrapper->getSessionVar('accountType');

        if (!empty($username)) {
            $is_authenticated = true;
            $request = $request->withAttribute('isAuthenticated', $is_authenticated); //If has username set as var then add authenticated attribut to request.
            $request = $request->withAttribute('isAdmin', $is_admin); //If has username set as var then add authenticated attribut to request.

        }

        $response = $next($request, $response);

        return $response;
    }
}
