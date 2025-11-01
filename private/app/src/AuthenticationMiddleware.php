<?php


namespace HighFlyersUkCouriers;

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

class AuthenticationMiddleware
{
    /** @var object */
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

     //This is is invoked before every request
    public function __invoke(Request $request, Response $response, callable $next) : Response
    {

        $origin = $request->getHeaderLine('Origin');
        
        $allowed_origins = [
            'https://www.highflyersukcouriers.com',
            'http://localhost:80',
            'http://localhost:5173/',
            'http://localhost:5173/shipments-logistics-manager',
        ];

        $isAllowed = in_array($origin, $allowed_origins);

        if ($isAllowed) {
            $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
        } else {
            $response = $response->withHeader('Access-Control-Allow-Origin', 'https://www.highflyersukcouriers.com');
        }

        $is_authenticated = false;
        $username = $this->session_wrapper->getSessionVar('user');
        $account_type = $this->session_wrapper->getSessionVar('accountType');

        if (!empty($username)) {
            $is_authenticated = true;
            $request = $request->withAttribute('username', $username);
            $request = $request->withAttribute('isAuthenticated', $is_authenticated); //If has username set as var then add authenticated attribute to request.
            $request = $request->withAttribute('accountType', $account_type); //If has username set as var then add authenticated attribute to request.
        }

        $response = $next($request, $response);
        return $response; 
    }
}
