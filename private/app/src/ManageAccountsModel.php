<?php

namespace HighFlyersUkCouriers;

class ManageAccountsModel
{
    private $doctrine_wrapper;
    private $user_data;
    private $HTML_user_data;

    public function getUserData() : array //for testing purposes
    {
      return $this->user_data;
    }
    
    public function getUserDataHTML() : String  //for testing purposes
    {
      return $this->HTML_user_data;
    }

    public function setDoctrineWrapper($doctrine_wrapper) : void
    {
        $this->doctrine_wrapper = $doctrine_wrapper;
    }
    

    public function fetchAllUsers() : void
    {
        $this->doctrine_wrapper->fetchAllUsers();
        $this->user_data = $this->doctrine_wrapper->getQueryResult();
    }

    public function fetchUserDataByID($id)
    {
        $this->doctrine_wrapper->fetchUserDataByField('id', $id);
        $this->user_data = $this->doctrine_wrapper->getQueryResult();
    }

    public function fetchUserDataByField($field, $value){
        $this->doctrine_wrapper->fetchUserDataByField($field, $value);
        $this->user_data = $this->doctrine_wrapper->getQueryResult();
    }   

    public function generateHTMLFromData() : void
    {

        $headers = array('id', 'username', 'account_type', 'user_created_timestamp');

        $HTML = '';
        $number_of_users = count($this->user_data);
        for ($i = 0; $i < $number_of_users; $i++) {
        $HTML = $HTML . '<tr>';
            for ($j = 0; $j < count($this->user_data[$i]); $j++) {
                $HTML = $HTML . "<td>{$this->user_data[$i][$headers[$j]]}</td>";
            }

            //add buttons
            $HTML = $HTML . '<td class="orderbuttons"><a href="/HighFlyersUkCouriers/public/change-password?id=' . $this->user_data[$i]['id'] .'"><button>Reset Password</button></a><a href="/HighFlyersUkCouriers/public/delete-user?id=' . $this->user_data[$i]['id'] .'"><button type="button">Delete</button></a>';
            $HTML = $HTML . '</tr>';

        }

        $this->HTML_user_data = $HTML;

    }

    public function generateHTMLForDeleteData(){

        $headers = array('id', 'username', 'account_type', 'user_created_timestamp');


        $HTML = '';
        $number_of_users = count($this->user_data);
        for ($i = 0; $i < $number_of_users; $i++) {
        
            for ($j = 0; $j < 4; $j++) {
                $HTML = $HTML . '<tr>';
                $HTML = $HTML . "<td>" . $headers[$j] . "</td>";
                $HTML = $HTML . "<td>" . $this->user_data[$i][$headers[$j]] . "</td>";
                $HTML = $HTML . '</tr>';
            }
           
        }

        $this->HTML_user_data = $HTML;
    }
}