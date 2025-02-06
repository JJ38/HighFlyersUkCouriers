<?php
/**
 * SessionWrapper.php
 *
 * Provides a wrapper for session management, variable setting and unsetting.
 *
 * @package telemetry_processing
 * @\TelemProc
 *
 * @author James Brass
 * @author Mo Aziz
 * @author Ryan Instrell
 */

namespace HighFlyersUkCouriers;

class SessionWrapper
{
    public function __construct() {}

    public function __destruct() {}

    /**
     * Sets session variable
     * @param string $session_var
     * @param string $session_value
     * @return bool
     */
    public function setSessionVar(string $session_var, string $session_value) : bool
    {
        $set_session = false;
        session_start();

        if (isset($session_var) && !empty($session_value)) {
            $_SESSION[$session_var] = $session_value;
            $set_session = true;
        }

        return $set_session;
    }

    /**
     * Gets session variable with the correct key
     * @param string $session_var
     * @return mixed
     */
    public function getSessionVar(string $session_var)
    {
        $returned_var = '';
        session_start();

        if (isset($_SESSION[$session_var])) {
            $returned_var = $_SESSION[$session_var];
        }

        return $returned_var;
    }

    /**
     * Unsets the session variable
     * @param string $session_var
     * @return bool
     */
    public function unsetSessionVar(string $session_var) : bool
    {
        session_start();
        $unset_session = false;

        if (isset($_SESSION[$session_var])) {
            unset($_SESSION[$session_var]);
            if (!isset($_SESSION[$session_var])) {
                $unset_session = true;
            }
        }

        return $unset_session;
    }
}
