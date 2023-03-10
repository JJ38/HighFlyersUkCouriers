<?php

namespace HighFlyersUkCouriers;

//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class Mailer{

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
        $mail->Subject = $subject;
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
    Bird/Animal type: {$this->mailer_data['animal_type']}" . "<br>". "
    Quantity: {$this->mailer_data['quantity']}" . "<br>". "
    Collection Telephone Number: {$this->mailer_data['collection_phone_number']}" . "<br>". "
    Email Address: {$this->mailer_data['email']}" . "<br>". "
    Collection Name: {$this->mailer_data['collection_name']}" . "<br>". "
    Collection Address 1: {$this->mailer_data['collection_address_1']}" . "<br>". "
    Collection Address 2: {$this->mailer_data['collection_address_2']}" . "<br>". "
    Collection Address 3: {$this->mailer_data['collection_address_3']}" . "<br>". "
    Collection Postcode: {$this->mailer_data['collection_postcode']}" . "<br>". "
    Delivery Name: {$this->mailer_data['delivery_name']}" . "<br>". "
    Delivery Address Line 1: {$this->mailer_data['delivery_address_1']}" . "<br>". "
    Delivery Address Line 2: {$this->mailer_data['delivery_address_2']}" . "<br>". "
    Delivery Address Line 3: {$this->mailer_data['delivery_address_3']}" . "<br>". "
    Delivery Postcode: {$this->mailer_data['delivery_postcode']}" . "<br>". "
    Delivery telephone Number: {$this->mailer_data['delivery_phone_number']}" . "<br>". "
    Payment on Delivery or Collection: {$this->mailer_data['payment_option']}" . "<br>". "
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

    Bird/Animal type: {$this->mailer_data['animal_type']}" . "<br>". "
    Quantity: {$this->mailer_data['quantity']}" . "<br>". "
    Collection Telephone Number: {$this->mailer_data['collection_phone_number']}" . "<br>". "
    Email Address: {$this->mailer_data['email']}" . "<br>". "
    Collection Name: {$this->mailer_data['collection_name']}" . "<br>". "
    Collection Address 1: {$this->mailer_data['collection_address_1']}" . "<br>". "
    Collection Address 2: {$this->mailer_data['collection_address_2']}" . "<br>". "
    Collection Address 3: {$this->mailer_data['collection_address_3']}" . "<br>". "
    Collection Postcode: {$this->mailer_data['collection_postcode']}" . "<br>". "
    Delivery Name: {$this->mailer_data['delivery_name']}" . "<br>". "
    Delivery Address Line 1: {$this->mailer_data['delivery_address_1']}" . "<br>". "
    Delivery Address Line 2: {$this->mailer_data['delivery_address_2']}" . "<br>". "
    Delivery Address Line 3: {$this->mailer_data['delivery_address_3']}" . "<br>". "
    Delivery Postcode: {$this->mailer_data['delivery_postcode']}" . "<br>". "
    Delivery telephone Number: {$this->mailer_data['delivery_phone_number']}" . "<br>". "
    Payment on Delivery or Collection: {$this->mailer_data['payment_option']}" . "<br>". "
    Message: {$this->mailer_data['message']}" . "<br>". "

    ";
    $this->sendMail($email, $subject, $message);
  }

  public function sendMailCustomerContactUs() : void
  {
    $email = $this->mailer_data['email'];
    $subject = 'High Flyers Uk Couriers Inquiry Confirmation - NoReply';
    $message = "Thankyou for contacting High Flyers UK Couriers. <br> <br> We have recieved your email and will get back to you shortly";

    $this->sendMail($email, $subject, $message);
  }

  public function sendMailInternalContactUs() : void
  {
    $email =  $this->mailer_settings['username'];
    $subject = "Inquiry from {$this->mailer_data['name']}";
    $message = 
    "Name: {$this->mailer_data['name']}" . "<br>" . 
    "Phone Number: {$this->mailer_data['phone']}" . "<br>" . 
    "Email: {$this->mailer_data['email']}" . "<br> <br>" . 
    $this->mailer_data['message'];

    $this->sendMail($email, $subject, $message);
  }


  public function sendMultipleOrderEmail($email){

    $email =  $email;
    $subject = "Order from testing";

    $message = '<html>'.
    '<head>'.
    '<style>'.
    'table{'.
    'border-collapse: collapse;'.
    'table-layout: fixed;'.
    '}'.
    ''.
    'div.orderdatawrapper{'.
    'overflow-x: scroll;'.
    'max-width: 70vw;'.
    '}'.
    'th{'.
    ''.
    'font-weight: 500;'.
    'padding-top: 1em;'.
    'padding-left: 1em;'.
    'padding-bottom: 1em;'.
    'text-align: left;'.
    'white-space: nowrap;'.
    ''.
    '}'.
    ''.
    'td{'.
    'padding: 1em;'.
    'font-weight: 100;'.
    'vertical-align: top;'.
    '}'.
    ''.
    'tr{'.
    'border-bottom: 1px solid black;'.
    '}'.
    ''.
    'tr:last-of-type{'.
    'border-bottom: none;'.
    '}'.
    '.emailwrapper{'.
    'width: 50vw;'.
    '}'.
    ''.
    '</style>'.
    '</head>'.
    '<body>'.
    ''.
    '<div class="orderdatawrapper">'.
    ''.
    '<table>'.
    '<thead>'.
    '<tr class="headerrow">'.
    '<th>Animal Type</th>'.
    '<th>Quantity</th>'.
    '<th>Email</th>'.
    '<th>Delivery Week</th>'.
    '<th>Collection Name</th>'.
    '<th>Collection Address 1</th>'.
    '<th>Collection Address 2</th>'.
    '<th>Collection Address 3</th>'.
    '<th>Collection Postcode</th>'.
    '<th>Collection Phone Number</th>'.
    '<th>Delivery Name</th>'.
    '<th>Delivery Address 1</th>'.
    '<th>Delivery Address 2</th>'.
    '<th>Delivery Address 3</th>'.
    '<th>Delivery Postcode</th>'.
    '<th>Delivery Phone Number</th>'.
    '<th>Payment</th>'.
    '<th>Message</th>'.
    '</tr>'.
    '</thead>'.
    '<tbody>';

    for($i = 1; $i < count($this->mailer_data) + 1; $i++){

      echo $this->mailer_data[$i]['animal_type'];

      $message = $message . 
      '<tr>'.

        '<td>' . $this->mailer_data[$i]['animal_type'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['quantity'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['email'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_week'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_name'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_address_1'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_address_2'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_address_3'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_postcode'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['collection_phone_number'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_name'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_address_1'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_address_2'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_address_3'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_postcode'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['delivery_phone_number'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['payment_option'] . '</td>'.
        '<td>' . $this->mailer_data[$i]['message'] . '</td>'.
      '</tr>';
    }




// '<tr>'.
// '<td>7</td>'.
// '<td> graardg rds </td>'.
// '<td>7</td>'.
// '<td>jamesbrass@ymail.com</td>'.
// '<td>admin</td>'.
// '<td>61st</td>'.
// '<td>Matthegrd rgd gargw</td>'.
// '<td>waddwa</td>'.
// '<td>aadw</td>'.
// '<td>dawrwdawdadw</td>'.
// '<td>LE1 6NU</td>'.
// '<td>07842133519</td>'.
// '<td>wadawdawd</td>'.
// '<td>16 York Street Flat 7</td>'.
// '<td>dawadwdaw</td>'.
// '<td>dwadaw</td>'.
// '<td>DADAWW</td>'.
// '<td>07842133519</td>'.
// '<td>Collection</td>'.
// '<td>daawdawd</td>'.
// '<td>2023-03-09 13:15:37</td>'.
// '</tr>'.
    $message = $message . '</tbody>'.
    '</table>'.
    ''.
    '</div>'.
    ''.
    '</body>'.
    '</html>';


    $this->sendMail($email, $subject, $message);
}


}
