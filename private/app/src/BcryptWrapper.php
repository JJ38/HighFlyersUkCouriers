<?php

namespace HighFlyersUkCouriers;

class BcryptWrapper
{
    public function __construct() {}

    public function __destruct() {}

    /**
     * Creates a hash of a given password.
     *
     * @param string $password_to_hash
     * @return false|string|null
     */
    public function createHashedPassword(string $password_to_hash)
    {
        $hashed_password = '';

        if (!empty($password_to_hash)) {
            $options = array('cost' => BCRYPT_COST);
            $hashed_password = password_hash($password_to_hash, BCRYPT_ALGO, $options);
        }

        return $hashed_password;
    }

    /**
     * Compares a given un hashed password with a given hashed password. Returns true if they are the same and
     * false otherwise
     *
     * @param string $user_password
     * @param string $stored_user_password
     * @return bool
     */
    public function authenticatePassword(string $user_password, string $stored_user_password) : bool
    {
        $user_authenticated = false;

        if (!empty($user_password)
            && !empty($stored_user_password)) {
            $user_authenticated = password_verify($user_password, $stored_user_password);
        }

        return $user_authenticated;
    }
}
