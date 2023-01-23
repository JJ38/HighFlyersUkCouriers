<?php

namespace HighFlyersUkCouriers;

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mailer{

  private $name;
  private $email;
  private $message;
  private $mailer_settings;
  private $mailer_data;

  public function setMailerSettings(array $mailer_settings) : void
  {
    $this->mailer_settings = $mailer_settings;
  }

  public function setMailData(array $mailer_data) : void
  {

    $this->mailer_data = $mailer_data;

  }

  public function sendMail($email, $subject, $message) : void
  {
    $mail = new PHPMailer(true);

    try {

        //Server settings
        $mail->SMTPDebug = 2;
        //$mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
        $mail->isSMTP();                                            //Send using SMTP
        $mail->Host       = $this->mailer_settings['host'];              //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
        $mail->Username   = $this->mailer_settings['username'];    //SMTP username
        $mail->Password   = $this->mailer_settings['password'];                               //SMTP password -application specific using google app passwords
        $mail->SMTPSecure = 'tls';            //Enable implicit TLS encryption
        $mail->Port       = $this->mailer_settings['port'];                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

        // Sender Info
        $mail->setFrom($this->mailer_settings['username'], 'High Flyers Uk Couriers');

        //recipient
        $mail->addAddress($email, '');     //Add a recipient

        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = 'High Flyers Uk Couriers Booking Confirmation -NoReply';
        $mail->Body    = $message;


        $mail->send();
    } catch (Exception $e) {

        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
  }

  public function sendMailCustomer() : void
  {
    $email = $this->mailer_data['email'];
    $subject = 'High Flyers Uk Couriers Booking Confirmation -NoReply';
    $message = "

    This is a confirmation email for your order with High Flyers Uk Couriers. " . "<br>". "
    " . "<br>". "
    Below are the details for you order: " . "<br>". "
    " . "<br>". "
    Bird/Animal type: {$this->mailer_data['animalType']}" . "<br>". "
    Quantity: {$this->mailer_data['quantity']}" . "<br>". "
    Collection Telephone Number: {$this->mailer_data['collectionTelephone']}" . "<br>". "
    Email Address: {$this->mailer_data['email']}" . "<br>". "
    Collection Address 1: {$this->mailer_data['collectionAddress1']}" . "<br>". "
    Collection Address 2: {$this->mailer_data['collectionAddress2']}" . "<br>". "
    Collection Address 3: {$this->mailer_data['collectionAddress3']}" . "<br>". "
    Collection Postcode: {$this->mailer_data['collectionPostcode']}" . "<br>". "
    Delivery Name: {$this->mailer_data['deliveryName']}" . "<br>". "
    Delivery Address Line 1: {$this->mailer_data['deliveryAddress1']}" . "<br>". "
    Delivery Address Line 2: {$this->mailer_data['deliveryAddress2']}" . "<br>". "
    Delivery Address Line 3: {$this->mailer_data['deliveryAddress3']}" . "<br>". "
    Delivery Postcode: {$this->mailer_data['deliveryPostcode']}" . "<br>". "
    Delivery telephone Number: {$this->mailer_data['deliveryTelephone']}" . "<br>". "
    Payment on Delivery or Collection: {$this->mailer_data['payment']}" . "<br>". "
    Message: {$this->mailer_data['message']}" . "<br>". "
    " . "<br>". "
    Please contact us at 07887781089 if there is a problem regarding your order.

    ";
    $this->sendMail($email, $subject, $message);
  }

  public function sendMailInternal() : void
  {
    $email =  $this->mailer_settings['username'];
    $subject = "Order from {$this->mailer_data['email']}";
    $message = "

    Bird/Animal type: {$this->mailer_data['animalType']}" . "<br>". "
    Quantity: {$this->mailer_data['quantity']}" . "<br>". "
    Collection Telephone Number: {$this->mailer_data['collectionTelephone']}" . "<br>". "
    Email Address: {$this->mailer_data['email']}" . "<br>". "
    Collection Address 1: {$this->mailer_data['collectionAddress1']}" . "<br>". "
    Collection Address 2: {$this->mailer_data['collectionAddress2']}" . "<br>". "
    Collection Address 3: {$this->mailer_data['collectionAddress3']}" . "<br>". "
    Collection Postcode: {$this->mailer_data['collectionPostcode']}" . "<br>". "
    Delivery Name: {$this->mailer_data['deliveryName']}" . "<br>". "
    Delivery Address Line 1: {$this->mailer_data['deliveryAddress1']}" . "<br>". "
    Delivery Address Line 2: {$this->mailer_data['deliveryAddress2']}" . "<br>". "
    Delivery Address Line 3: {$this->mailer_data['deliveryAddress3']}" . "<br>". "
    Delivery Postcode: {$this->mailer_data['deliveryPostcode']}" . "<br>". "
    Delivery telephone Number: {$this->mailer_data['deliveryTelephone']}" . "<br>". "
    Payment on Delivery or Collection: {$this->mailer_data['payment']}" . "<br>". "
    Message: {$this->mailer_data['message']}" . "<br>". "

    ";
    $this->sendMail($email, $subject, $message);
  }

}
