<?php

namespace HighFlyersUkCouriers;

class CustomerProfileModel
{   

    private $sanitizer;
    private $validator;
    private $cleaned_form_data;
    private $doctrine_wrapper;
    private $session_wrapper;
    private $customer_details;
    private $update_result;


    public function setSanitizer($sanitizer){
        $this->sanitizer = $sanitizer;
    }

    public function setValidator($validator){
        $this->validator = $validator;
    }

    public function setDoctrineWrapper($doctrine_wrapper){
        $this->doctrine_wrapper = $doctrine_wrapper;

    }

    public function setSessionWrapper($session_wrapper){
        $this->session_wrapper = $session_wrapper;

    }

    public function setCustomerDetails($customer_details){
        $this->customer_details = $customer_details;
    }

    public function getCleanedFormData() : array|null{

        return $this->cleaned_form_data;

    }

    public function getUpdateResult(){
        return $this->update_result;
    }

    public function cleanProfileForm($form){

        $cleaned_form_data = [];

        $sanitized_email = $this->sanitizer->sanitizeEmail($form['email']);
        $cleaned_form_data['email'] = $this->validator->validateEmail($sanitized_email);
        if(!$this->validator->getValidationResult()){
            return $cleaned_form_data = [];
        }

        $sanitized_collection_phone_number = $this->sanitizer->sanitizePhoneNumber($form['collectionTelephone']);
        $cleaned_form_data['collection_phone_number'] = $this->validator->validatePhoneNumber($sanitized_collection_phone_number);
        if(!$this->validator->getValidationResult()){
            return $cleaned_form_data = [];
        }

        $cleaned_form_data['collection_name'] = $this->sanitizer->sanitizeString($form['collectionName']);

        $cleaned_form_data['collection_address_1']  = $this->sanitizer->sanitizeString($form['collectionAddress1']);

        $cleaned_form_data['collection_address_2']  = $this->sanitizer->sanitizeString($form['collectionAddress2']);

        $cleaned_form_data['collection_address_3']= $this->sanitizer->sanitizeString($form['collectionAddress3']);

        $cleaned_form_data['collection_postcode'] = $this->sanitizer->sanitizeString($form['collectionPostcode']);

        $this->cleaned_form_data = $cleaned_form_data;

    }

    public function updateCustomerDetails(){

        $username = $this->session_wrapper->getSessionVar('user');

        $this->doctrine_wrapper->updateCustomerDetails($username, $this->customer_details);
        $this->update_result = $this->doctrine_wrapper->getQueryResult();
    }


    
}