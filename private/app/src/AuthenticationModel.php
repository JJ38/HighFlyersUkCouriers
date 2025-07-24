<?php

namespace HighFlyersUkCouriers;

use MrShan0\PHPFirestore\FirestoreClient;
use GuzzleHttp\Client;
use Google\Auth\Credentials\ServiceAccountCredentials;
use Kreait\Firebase\Project\ProjectId;
use Psr\Http\Message\RequestInterface as Request; 
use Exception;

class AuthenticationModel
{
    private $logger;
    private $order_ID;
    private $access_token;

    public function getOrderID(){
        return $this->order_ID;
    }

    public function getOAuth2Token(){
        return $this->access_token;
    }

    public function setLogger($logger) : void{
        $this->logger = $logger;
    }

    public function __construct() {}


    public function fetchOAuth2Token(){


        function base64url_encode($data) { 
            return rtrim(strtr(base64_encode($data), '+/', '-_'), '='); 
        }
        
        //Google's Documentation of Creating a JWT: https://developers.google.com/identity/protocols/OAuth2ServiceAccount#authorizingrequests
        
        //{Base64url encoded JSON header}
        $jwtHeader = base64url_encode(json_encode(array(
            "alg" => "RS256",
            "typ" => "JWT"
        )));

        //{Base64url encoded JSON claim set}
        $now = time();
        $jwtClaim = base64url_encode(json_encode(array(
            "iss" => "firebase-adminsdk-fbsvc@highflyersukcouriers-a9c17.iam.gserviceaccount.com",
            "scope" => "https://www.googleapis.com/auth/datastore",
            "aud" => "https://oauth2.googleapis.com/token",
            "exp" => $now + 3600,
            "iat" => $now
        )));


        $env = parse_ini_file(realpath('../.env'));
        $private_key = $env['SERVICE_ACCOUNT_PRIVATE_KEY'];

        $new_private_key = str_replace('\n', "\n", $private_key); //important for formatting. Key wont work otherwise

        //The base string for the signature: {Base64url encoded JSON header}.{Base64url encoded JSON claim set}
        $encryption_result = openssl_sign(
            $jwtHeader.".".$jwtClaim,
            $jwtSig,
            $new_private_key,
            "sha256WithRSAEncryption"
        );

        $jwtSign = base64url_encode($jwtSig);
        
        //{Base64url encoded JSON header}.{Base64url encoded JSON claim set}.{Base64url encoded signature}
        $jwtAssertion = $jwtHeader.".".$jwtClaim.".".$jwtSign;

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" . $jwtAssertion);

        $headers = array();
        $headers[] = 'Content-Type: application/x-www-form-urlencoded';
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {

            if($this->logger != null){
                $this->logger->error("JWT", array($jwtAssertion));
                $this->logger->error("OAUTH2_CURL_ERROR", array(curl_error($ch)));
            }
        }

        $result_arr = json_decode($result, true);
        $access_token = $result_arr['access_token'];
        curl_close($ch);

        $this->access_token = $access_token;

    }

    public function getAuthenticatedFirebaseClient(){   


        if($this->access_token == null){

            if($this->logger != null){
                $this->logger->error('ACCESS_TOKEN_NULL_ERROR', array());

            }

            return null;
        }

        try{

            $client = new Client(['headers' => ['Authorization' => 'Bearer ' . $this->access_token]]);
            
            $env = parse_ini_file(realpath('../.env'));
        
            $projectID = $env['FIREBASE_PROJECT_ID'];
            $firebaseProjectAPIKey = $env['FIREBASE_PROJECT_API_KEY'];
        
            $firestore = new FirestoreClient($projectID, $firebaseProjectAPIKey, [
                'database' => '(default)',
            ], $client);

            
        }catch(\Exception $e){

            if($this->logger != null){
                $this->logger->error('FIREBASE_INIT_ERROR', array($e));
                $this->logger->error('FIREBASE_INIT_ENV', array($env));
            }

            return null;

        }

        return $firestore;

    }

     public function fetchGoogleCloudAccessToken($serviceAccountKeyPath, $scopes){

        if (!file_exists($serviceAccountKeyPath)) {
            throw new Exception("Service account key file not found at: " . $serviceAccountKeyPath);
        }

        try {
         
            $credentials = new ServiceAccountCredentials(
                $scopes,
                $serviceAccountKeyPath
            );

          
            $httpClient = new Client();

            
            $httpHandler = function (Request $request, array $options = []) use ($httpClient) {
                // Use the Guzzle client to send the request
                return $httpClient->send($request, $options);
            };

            // The fetchAuthToken method handles refreshing the token when it expires.
            $token = $credentials->fetchAuthToken($httpHandler);

            if (!isset($token['access_token'])) {

                throw new Exception('Failed to get access token. Response: ' . json_encode($token));

            } 
    
            return $token['access_token'];
            
        } catch (Exception $e) {

            if ($this->logger !== null) {

                $this->logger->error("FETCH_GOOGLE_ACCESS_TOKEN_ERROR", array($e));
            }

            throw new Exception("");

        }

    }

}