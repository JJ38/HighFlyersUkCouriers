<?php

namespace HighFlyersUkCouriers;

class LoginModel
{
    /** @var object */
    private $bcrypt_wrapper;
    /** @var object */
    private $doctrine_wrapper; 
    /** @var object */
    private $logger_handle;
    /** @var object */
    private $session_wrapper;
    private $user_credentials;
    private $login_result;

    public function __construct()
    {
        $this->bcrypt_wrapper = null;
        $this->doctrine_wrapper = null;
        $this->logger_handle = null;
        $this->user_credentials = array();
        $this->login_result = false;
    }

    public function __destruct() {}

    /**
     * Sets <Bcrypt> wrapper
     *
     * @param $bcrypt_wrapper
     */
    public function setBcryptWrapper($bcrypt_wrapper) : void
    {
        $this->bcrypt_wrapper = $bcrypt_wrapper;
    }

    /**
     * Sets <DoctrineWrapper> handle.
     *
     * @param $doctrine_wrapper
     */
    public function setDoctrineWrapper($doctrine_wrapper) : void
    {
        $this->doctrine_wrapper = $doctrine_wrapper;
    }

    /**
     * Sets <Monolog> handle.
     *
     * @param $logger_handle
     */
    public function setLoggerHandle($logger_handle) : void
    {
        $this->logger_handle = $logger_handle;
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
     * Sets login credentials
     *
     * @param array $user_credentials
     */
    public function setUserCredentials(array $user_credentials) : void
    {
        $this->user_credentials = $user_credentials;
    }

    /**
     * Returns result for user authentication.
     *
     * @return bool
     */
    public function getResult() : bool
    {
        return $this->login_result;
    }

    /**
     * Using the Logger handle, produce a log of level NOTICE
     * Optional parameters in $additional if more information is needed.
     *
     * @param string $log_message
     * @param array|null $additional
     */
    private function logEvent(string $log_message, ?array $additional = null) : void
    {
        if ($additional !== null) {
            $this->logger_handle->notice($log_message, $additional);
        } else {
            $this->logger_handle->notice($log_message);
        }
    }

    /**
     * Logs in a user. Returns true if logged in successfully and false otherwise.
     *
     * @return void
     */
    public function login() : void
    {
        $login_result = false;

        // Fetch password for given username
        $username = $this->user_credentials['username'];


        if (!empty($username)) {
            
            $this->doctrine_wrapper->fetchUserPassword($username);
            $query_result = $this->doctrine_wrapper->getQueryResult();

            if (!empty($query_result)) {
                $fetched_password = $query_result[0]['password'];

                // Check if password is equal to given password
                $given_password = $this->user_credentials['password'];
                $login_result = $this->bcrypt_wrapper->authenticatePassword($given_password, $fetched_password);
            }
        }

        if ($login_result !== false) {

            //check if admin
            $this->doctrine_wrapper->getAccountType($this->user_credentials['username']);
            $account_type = $this->doctrine_wrapper->getQueryResult();

            // Adding to Session Var
            $this->session_wrapper->setSessionVar('user', $this->user_credentials['username']);
            $this->session_wrapper->setSessionVar('accountType', $account_type);
            // Log Successful Authentication
            if ($this->logger_handle !== null) {
                $this->logEvent('User Authentication', array($this->user_credentials['username']));
            }
        }

        $this->login_result = $login_result;
    }
}
