<?php
/**
 * DoctrineWrapper.php
 *
 * Provides a wrapper for Doctrine functionalities.
 *
 * @package telemetry_processing
 * @\TelemProc
 *
 * @author James Brass
 * @author Mo Aziz
 * @author Ryan Instrell
 */

namespace HighFlyersUkCouriers;

class DoctrineWrapper
{
    /** @var resource $doctrine_logger Contains handle to <telemetryLogger>. */
    private $doctrine_logger;

    /** @var resource $query_builder Stores Doctrine's QueryBuilder Object. */
    private $query_builder;

    /** @var mixed $query_result Stores the result of an executed SQL query. */
    private $query_result;

    public function __construct()
    {
        $this->doctrine_logger = null;
        $this->query_builder = null;
        $this->query_result = null;
    }

    public function __destruct() {}

    /**
     * Sets handle for <Doctrine>.
     *
     * @param $doctrine_logger
     */
    public function setDoctrineLogger($doctrine_logger) : void
    {
        $this->doctrine_logger = $doctrine_logger;
    }

    /**
     * Sets QueryBuilder object.
     *
     * @param $query_builder
     */
    public function setQueryBuilder($query_builder) : void
    {
        $this->query_builder = $query_builder;
    }

    /**
     * Returns result from executed SQL queries.
     *
     * @return mixed|null
     */
    public function getQueryResult()
    {
        return $this->query_result;
    }

    public function storeOrderData($cleaned_parameters) : void
    {

      $store_result = false;

      try {
          $query_builder = $this->query_builder
              ->insert('orders')
              ->values(array(
                  'animal_type' => ':animal_type',
                  'quantity' => ':quantity',
                  'email' => ':email',
                  'collection_phone_number' => ':collection_phone_number',
                  'collection_address_1' => ':collection_address_1',
                  'collection_address_2' => ':collection_address_2',
                  'collection_address_3' => ':collection_address_3',
                  'collection_postcode' => ':collection_postcode',
                  'delivery_name' => ':delivery_name',
                  'delivery_address_1' => ':delivery_address_1',
                  'delivery_address_2' => ':delivery_address_2',
                  'delivery_address_3' => ':delivery_address_3',
                  'delivery_postcode' => ':delivery_postcode',
                  'delivery_phone_number' => ':delivery_phone_number',
                  'payment_option' => ':payment_option',
                  'message' => ':message',
                  'timestamp' => ':timestamp'

              ))
              ->setParameters(array(
                'animal_type' => $cleaned_parameters['animal_type'],
                'quantity' => $cleaned_parameters['quantity'],
                'email' => $cleaned_parameters['email'],
                'collection_phone_number' => $cleaned_parameters['collection_phone_number'],
                'collection_address_1' => $cleaned_parameters['collection_address_1'],
                'collection_address_2' => $cleaned_parameters['collection_address_2'],
                'collection_address_3' => $cleaned_parameters['collection_address_3'],
                'collection_postcode' => $cleaned_parameters['collection_postcode'],
                'delivery_name' => $cleaned_parameters['delivery_name'],
                'delivery_address_1' => $cleaned_parameters['delivery_address_1'],
                'delivery_address_2' => $cleaned_parameters['delivery_address_2'],
                'delivery_address_3' => $cleaned_parameters['delivery_address_3'],
                'delivery_postcode' => $cleaned_parameters['delivery_postcode'],
                'delivery_phone_number' => $cleaned_parameters['delivery_phone_number'],
                'payment_option' => $cleaned_parameters['payment_option'],
                'message' => $cleaned_parameters['message'],
                'timestamp' => $cleaned_parameters['timestamp']
              ));

          $store_result = $query_builder->execute();

          $store_result = $store_result == 1;

      } catch (\Exception $exception) {
          if ($this->doctrine_logger !== null) {
              $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
          }
      } finally {
          $this->query_result = $store_result;
      }


    }

    public function fetchAllOrderData() : void
    {

      $retrieve_result = array();

      try {
          $query_builder = $this->query_builder
              ->select('o.*')
              ->from('orders', 'o')
              ->orderBy('o.id', 'DESC');

          $query = $query_builder->execute();
          $retrieve_result = $query->fetchAll();

      } catch (\Exception $exception) {
          if ($this->doctrine_logger !== null) {
              $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
          }
      } finally {
          $this->query_result = $retrieve_result;
      }

    }

    public function fetchOrderDataById(string $id) : void
    {

      $password = null;

      try {
          $query_builder = $this->query_builder
              ->select('o.*')
              ->from('orders', 'o')
              ->where('o.id= :id')
              ->setParameters(array(
                  'id' => $id,
              ));

          $query = $query_builder->execute();
          $password = $query->fetchAll();

      } catch (\Exception $exception) {
          if ($this->doctrine_logger !== null) {
              $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
          }
      } finally {
          $this->query_result = $password;
      }

    }

    public function updateOrderDataById($cleaned_parameters) : void
    {
        $updated_order = false;

        try {
            $query_builder = $this->query_builder
                ->update('orders', 'o')
                ->set('o.email', ':email')
                ->set('o.quantity', ':quantity')
                ->set('o.payment_option', ':payment_option')
                ->set('o.delivery_phone_number', ':delivery_phone_number')
                ->set('o.collection_phone_number', ':collection_phone_number')
                ->set('o.animal_type', ':animal_type')
                ->set('o.collection_address_1', ':collection_address_1')
                ->set('o.collection_address_2', ':collection_address_2')
                ->set('o.collection_address_3', ':collection_address_3')
                ->set('o.collection_postcode', ':collection_postcode')
                ->set('o.delivery_name', ':delivery_name')
                ->set('o.delivery_address_1', ':delivery_address_1')
                ->set('o.delivery_address_2', ':delivery_address_2')
                ->set('o.delivery_address_3', ':delivery_address_3')
                ->set('o.delivery_postcode', ':delivery_postcode')
                ->set('o.message', ':message')
                ->where('o.id = :id')
                ->setParameter('email', $cleaned_parameters['email'])
                ->setParameter('quantity', $cleaned_parameters['quantity'])
                ->setParameter('payment_option', $cleaned_parameters['payment_option'])
                ->setParameter('delivery_phone_number', $cleaned_parameters['delivery_phone_number'])
                ->setParameter('collection_phone_number', $cleaned_parameters['collection_phone_number'])
                ->setParameter('animal_type', $cleaned_parameters['animal_type'])
                ->setParameter('collection_address_1', $cleaned_parameters['collection_address_1'])
                ->setParameter('collection_address_2', $cleaned_parameters['collection_address_2'])
                ->setParameter('collection_address_3', $cleaned_parameters['collection_address_3'])
                ->setParameter('collection_postcode', $cleaned_parameters['collection_postcode'])
                ->setParameter('delivery_name', $cleaned_parameters['delivery_name'])
                ->setParameter('delivery_address_1', $cleaned_parameters['delivery_address_1'])
                ->setParameter('delivery_address_2', $cleaned_parameters['delivery_address_2'])
                ->setParameter('delivery_address_3', $cleaned_parameters['delivery_address_3'])
                ->setParameter('delivery_postcode', $cleaned_parameters['delivery_postcode'])
                ->setParameter('message', $cleaned_parameters['message'])
                ->setParameter('id', $cleaned_parameters['id']);



            $updated_order = $query_builder->execute();

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $updated_order;
        }
    }

    /**
     * Using the Logger handle, produce a log of level ERROR
     * Optional parameters in $additional if more information is needed
     *
     * @param string $log_message
     * @param array|null $additional
     */
    private function logDoctrineError(string $log_message, ?array $additional = null) : void
    {
        if ($additional !== null) {
            $this->doctrine_logger->error($log_message, $additional);
        } else {
            $this->doctrine_logger->error($log_message);
        }
    }


    public function fetchAllUsers() : void
    {
        $retrieve_result = array();

        try {
            $query_builder = $this->query_builder
                ->select('u.username')
                ->from('users', 'u')
                ->orderBy('u.username', 'DESC');

            $query = $query_builder->execute();
            $retrieve_result = $query->fetchAll();

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $retrieve_result;
        }
    }



    /**
     * Uses <Doctrine> to fetch the password of the given username
     *
     * @param string $cleaned_username
     */
    public function fetchUserPassword(string $cleaned_username) : void
    {
        $password = null;

        try {
            $query_builder = $this->query_builder
                ->select('u.password')
                ->from('users', 'u')
                ->where('u.username = :username')
                ->setParameters(array(
                    'username' => $cleaned_username,
                ));

            $query = $query_builder->execute();
            $password = $query->fetchAll();

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $password;
        }
    }

    /**
     * Uses <Doctrine> to check if a given username is available when registering.
     *
     * @param string $cleaned_username
     */
    public function checkIfUsernameAvailable(string $cleaned_username) : void
    {
        $is_available = false;

        try {
            $query_builder = $this->query_builder
                ->select('u.*')
                ->from('users', 'u')
                ->where('u.username = :username')
                ->setParameters(array(
                    'username' => $cleaned_username,
                ));

            $query = $query_builder->execute();
            $result = $query->fetchAll();

            $is_available = empty($result); // If empty, username is available

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $is_available;
        }
    }

    /**
     * Uses <Doctrine> to store new user details
     *
     * @param string $cleaned_username
     * @param string $cleaned_password
     */
    public function storeUserDetails(string $cleaned_username, string $cleaned_password) : void
    {
        $store_result = false;

        try {
            $query_builder = $this->query_builder
                ->insert('users')
                ->values(array(
                    'username' => ':username',
                    'password' => ':password'
                ))
                ->setParameters(array(
                    'username' => $cleaned_username,
                    'password' => $cleaned_password
                ));

            $store_result = $query_builder->execute();

            $store_result = $store_result == 1;

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $store_result;
        }
    }

    /**
     * Checks if a user is an admin or not.
     *
     * @param string $cleaned_username
     */
    public function checkIfAdmin(string $cleaned_username) : void
    {
        $is_admin = false;

        try {
            $query_builder = $this->query_builder
                ->select('u.admin')
                ->from('users', 'u')
                ->where('u.username = :username')
                ->setParameter('username', $cleaned_username);

            $query = $query_builder->execute();
            $result = $query->fetch();

            $is_admin = $result['admin'] == 1;

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $is_admin;
        }
    }

    /**
     * Performs DELETE query of specific user entry.
     *
     * @param string $cleaned_username
     */
    public function deleteUser(string $cleaned_username) : void
    {
        $delete_result = false;

        try {
            $query_builder = $this->query_builder
                ->delete('telemetry_users')
                ->where('username = :username')
                ->setParameter('username', $cleaned_username);

            $delete_result = $query_builder->execute();

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $delete_result;
        }
    }

    /**
     * Changes the password of a specific stored user.
     *
     * @param string $cleaned_username
     * @param string $new_hashed_password
     * @return void
     */
    public function changeUserPassword(string $cleaned_username, string $new_hashed_password) : void
    {
        $user_password_changed = false;

        try {
            $query_builder = $this->query_builder
                ->update('telemetry_users', 'u')
                ->set('u.password', ':password')
                ->where('u.username = :username')
                ->setParameter('username', $cleaned_username)
                ->setParameter('password', $new_hashed_password);

            $user_password_changed = $query_builder->execute();

        } catch (\Exception $exception) {
            if ($this->doctrine_logger !== null) {
                $this->logDoctrineError('Doctrine Error', array($exception->getMessage()));
            }
        } finally {
            $this->query_result = $user_password_changed;
        }
    }
}
