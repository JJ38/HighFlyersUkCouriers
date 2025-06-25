<?php

namespace HighFlyersUkCouriers;

use Exception;
use GuzzleHttp\Client;


class CalculateRouteModel
{

    private $logger;

    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    public function calculateRoute($accessToken, $model){

        $projectId = "highflyersukcouriers";
        $projectNumber = "683549936058";
        $endpoint = "https://routeoptimization.googleapis.com/v1/projects/{$projectId}:optimizeTours";

        // Prepare the full request body structure
        $requestBody = [
            'model' => $model['model'],
            'searchMode' => 'RETURN_FAST', //CONSUME_ALL_AVAILABLE_TIME', // Or 'RETURN_FAST'
            "populateTransitionPolylines" => true,
        ];

        try {
            // $response = $client->post($endpoint, $request);

            // Get the raw response body as a string
            // return $response->getBody()->getContents();

            $jsonPayload = json_encode($requestBody, JSON_PRETTY_PRINT);

            // --- PHP cURL Request ---

            $ch = curl_init($endpoint);

            // Set cURL options
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST"); // Set request method to POST
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload); // Set JSON payload as request body
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
                'Authorization: Bearer ' . $accessToken
            ));
            
            // Optional: Enable verbose cURL output for debugging (to see headers sent/received)
            // curl_setopt($ch, CURLOPT_VERBOSE, true); 
            // curl_setopt($ch, CURLOPT_STDERR, fopen('php://stderr', 'w'));

            // Execute the request
            $response = curl_exec($ch);

            // Close cURL session
            curl_close($ch);

            return $response;

        }catch(Exception $e){

            if($this->logger != null){
       
                $this->logger->error("CALCULATE_ROUTE_ERROR", array($e));

            }

            // var_dump($e);
            var_dump($e->getResponse()->getBody()->getContents());


            throw new Exception("Error calculating route");

        }
    }

}