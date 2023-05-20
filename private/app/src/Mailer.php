<?php


namespace HighFlyersUkCouriers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dompdf\Dompdf; 



class Mailer{

  private $mailer_settings;
  private $mailer_data;
  private $file;

  public function setMailerSettings(array $mailer_settings) : void
  {
    $this->mailer_settings = $mailer_settings;
  }

  public function setMailData(array $mailer_data) : void
  {

    $this->mailer_data = $mailer_data;

  }

  public function sendMail($email, $subject, $message, $attachment) : void
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
        $mail->isHTML(true);        //Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $message;
        if($attachment != false){
          $file = tmpfile();
           
          fwrite($file, $attachment);
          $mail->AddAttachment(stream_get_meta_data($file)['uri'], 'YourOrder.html');
        
        }

        $mail->send();
        if($attachment != false){
          //fclose($file);
        }

        
    } catch (Exception $e) {
        //fclose($file);
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }

  }

  public function sendMailCustomer() : void
  {
    $email = $this->mailer_data['email'];
    $subject = 'High Flyers Uk Couriers Booking Confirmation - NoReply';
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
    $this->sendMail($email, $subject, $message, false);
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
    $this->sendMail($email, $subject, $message, false);
  }

  public function sendMailCustomerContactUs() : void
  {
    $email = $this->mailer_data['email'];
    $subject = 'High Flyers Uk Couriers Inquiry Confirmation - NoReply';
    $message = "Thank you for contacting High Flyers UK Couriers. <br> <br> We have recieved your email and will get back to you shortly";

    $this->sendMail($email, $subject, $message, false);
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

    $this->sendMail($email, $subject, $message, false);
  }

  public function sendMultipleOrderEmailInternal(){
    $email =  $this->mailer_settings['username'];
    $subject = "Order from {$this->mailer_data[1]['username']}";

    $attachment = $this->getMultipleOrderAttachment();
    $message = "Order from {$this->mailer_data[1]['username']}";

    $this->sendMail($email, $subject, $message, $attachment);
  }

  private function getMultipleOrderAttachment(){

    $message = '<html>'.
    '<head>'.
    '<style>'.
    // 'table{'.
    // 'border-collapse: collapse;'.
    // 'table-layout: fixed;'.
    // '}'.
    // ''.
    // 'div.orderdatawrapper{'.
    // 'overflow-x: scroll;'.
    // 'max-width: 100vw;'.
    // '}'.
    // 'th{'.
    // ''.
    // 'font-weight: 500;'.
    // 'padding-top: 1em;'.
    // 'padding-left: 1em;'.
    // 'padding-bottom: 1em;'.
    // 'text-align: left;'.
    // 'white-space: nowrap;'.
    // ''.
    // '}'.
    // ''.
    // 'td{'.
    // 'padding: 1em;'.
    // 'font-weight: 100;'.
    // 'vertical-align: top;'.
    // '}'.
    // ''.
    // 'tr{'.
    // 'border-bottom: 1px solid black;'.
    // '}'.
    // ''.
    // 'tr:last-of-type{'.
    // 'border-bottom: none;'.
    // '}'.
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

      // echo $this->mailer_data[$i]['animal_type'];

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


    $message = $message . '</tbody>'.
    '</table>'.
    ''.
    '</div>'.
    ''.
    '</body>'.
    '</html>';


    $attachment = '<html>'.
    '<head>'.
    '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'.
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">'.
    '<style>'.
    '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@600&display=swap\');'.
'@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@500&display=swap\');'.
'@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@400&display=swap\');'.
'html,body{'.
'margin:0;'.
'}'.
'body{'.
'background: #f9f9f9;'.
'padding-bottom: 250px;'.
'}'.
''.
'div.columns{'.
'display: grid;'.
'grid-template-columns: 4fr 1fr 4fr 12fr 6fr 2fr;'.
'gap: 20px;'.
'height: auto;'.
'margin-top: 25px;'.
'margin-bottom: 20px;'.
'transition: max-height 0.5s ease-in-out;'.
'}'.
'div.tablerow{'.
'position: relative;'.
'font-family: \'Raleway\';'.
'font-style: 500;'.
'font-size: 18px;'.
'padding-top: 1px;'.
'padding-bottom: 26px;'.
'background-color: white;'.
'border-bottom: 1px solid grey;'.
'margin-bottom: 10px;'.
'padding-left: 30px !important;'.
'}'.
'div.headerrow{'.
'padding-top: 26px;'.
'}'.
'p{'.
'font-weight: 500;'.
'font-size: 18px;'.
'margin:0;'.
'padding: 0;'.
'overflow-wrap: anywhere;'.
'}'.
'div.collectioninfomargin{'.
'margin-top: 25px !important;'.
'}'.
'div.deliveryinfomargin{'.
'margin-top: -25px;'.
'margin-bottom: 0px;'.
'transition: margin-top 0.5s ease-in-out, margin-bottom 0.5s ease-in-out;'.
'}'.
'i{'.
'width: 20px;'.
'height: 20px;'.
'font-size: 20px;'.
'margin: 1px 0px;'.
'margin-right: 10px;'.
'}'.
'div.extrainfo{'.
'display: grid;'.
'grid-template-columns: 12fr 6fr 18fr 1fr;'.
'max-height: 200px;'.
'transition: max-height 0.5s ease-in-out;'.
'}'.
'div.extrainfo > div{'.
'display: flex;'.
'}'.
'div.onelineaddress{'.
'display: flex;'.
'flex-wrap: wrap;'.
'gap: 5px;'.
''.
'}'.
'@media(max-width: 1250px){'.
'div.tablerow{'.
'padding-left: 30px !important;'.
''.
'}'.
'}'.
''.
'@media(max-width: 1200px){'.
'div.columns{'.
'gap: 10px;'.
'}'.
'}'.
''.
'@media (max-width: 1150px) {'.
''.
'div.extrainfo{'.
'display: flex;'.
'flex-wrap: wrap;'.
'gap: 35px;'.
'row-gap: 15px;'.
'}'.
'p{'.
'font-size: 17px !important;'.
'}'.
'}'.
'@media (max-width: 1000px){'.
'div.headerrow{'.
'font-size: 17px !important;'.
''.
'}'.
'}'.
'@media (max-width: 740px){'.
'p{'.
'font-size: 15px !important;'.
'}'.
'input, #payment{'.
'height: 25px;'.
'font-size: 16px;'.
'}'.
'}'.
'@media (max-width: 600px){'.
'div.tablerow{'.
'padding-bottom: 13px !important;'.
'}'.
'div.headerrow{'.
'padding-top: 13px !important;'.
'}'.
'}'.
'@media (max-width: 510px){'.
'div.info{'.
'grid-template-columns: 1fr !important;'.
'}'.
'}'.
    '@media(max-width: 1250px){'.
    '.tablerow{'.
    'padding-left: 30px !important;'.
    ''.
    '}'.
    '}'.
    ''.
    '@media(max-width: 1200px){'.
    '.columns{'.
    'gap: 10px;'.
    '}'.
    '}'.
    ''.
    '@media (max-width: 1150px) {'.
    '.info{'.
    'grid-template-columns: 1fr 1fr;'.
    '}'.
    '.quickcollectionaddresswrapper > p{'.
    'font-size: 15px !important;'.
    '}'.
    '.flex > p{'.
    'font-size: 13px ;'.
    '}'.
    '.forminput{'.
    'margin: 10px 0px !important;'.
    '}'.
    '.extrainfo{'.
    'display: flex;'.
    'flex-wrap: wrap;'.
    'gap: 35px;'.
    'row-gap: 15px;'.
    ''.
    '}'.
    'p{'.
    'font-size: 17px !important;'.
    '}'.
    '}'.
    '@media (max-width: 1000px){'.
    '.headerrow{'.
    'font-size: 17px !important;'.
    ''.
    '}'.
    '}'.
    '@media (max-width: 740px){'.
    'p{'.
    'font-size: 15px !important;'.
    '}'.
    'input, #payment{'.
    'height: 25px;'.
    'font-size: 16px;'.
    '}'.
    '.info{'.
    'column-gap: 20px !important;'.
    '}'.
    '}'.
    '@media (max-width: 600px){'.
    '.tablerow{'.
    'padding-bottom: 13px !important;'.
    '}'.
    '.headerrow{'.
    'padding-top: 13px !important;'.
    '}'.
    '}'.
    '@media (max-width: 510px){'.
    '.info{'.
    'grid-template-columns: 1fr !important;'.
    '}'.
    '.paymentinfo{'.
    'grid-template-columns: 1fr !important;'.
    '}'.
    '}'.
    '</style>'.
    ''.
    '</head>'.
    '<body>'.
    ''.
    '<div id="table">';

    for($i = 1; $i < count($this->mailer_data) + 1; $i++){

      // echo $this->mailer_data[$i]['animal_type'];

      $attachment = $attachment . '<div class="tablerow">'.
      '<div class="transportinfowrapper">'.
      '<div class="columns collectioninfomargin">'.
      '<p>' . $this->mailer_data[$i]['animal_type'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['quantity'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['collection_name'] . '</p>'.
      '<div class="onelineaddress">'.
      '<p>' . $this->mailer_data[$i]['collection_address_1'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['collection_address_2'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['collection_address_3'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['collection_postcode'] . '</p>'.
      '</div>'.
      '<p>' . $this->mailer_data[$i]['collection_phone_number'] . '</p>'.
      '<i class="fa-solid fa-box-open" title="collection"></i>'.
      '</div>'.
      '<div class="columns ">'.
      '<p class="">' . $this->mailer_data[$i]['animal_type'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['quantity'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['delivery_name'] . '</p>'.
      '<div class="onelineaddress">'.
      '<p>' . $this->mailer_data[$i]['delivery_address_1'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['delivery_address_2'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['delivery_address_3'] . '</p>'.
      '<p>' . $this->mailer_data[$i]['delivery_postcode'] . '</p>'.
      '</div>'.
      '<p>' . $this->mailer_data[$i]['delivery_phone_number'] . '</p>'.
      '<i class="fa-solid fa-truck" title="delivery"></i>'.
      '</div>'.
      '</div>'.
      '<div class="extrainfo ">'.
      '<div>'.
      '<i class="fa-solid fa-at" title="email"></i>'.
      '<p>' . $this->mailer_data[$i]['email'] . '</p>'.
      '</div>'.
      '<div>'.
      '<i class="fa-solid fa-credit-card" title="payment on delivery or collection"></i>'.
      '<p>' . $this->mailer_data[$i]['payment_option'] . '</p>'.
      '</div>'.
      '<div>'.
      '<i class="fa-solid fa-message" title="message"></i>'.
      '<p>' . $this->mailer_data[$i]['message'] . '</p>'.
      '</div>'.
      '</div>'.
      '</div>';
 
}

$attachment = $attachment . '</tbody>'.
'</table>'.
'</div>'.
'<script src="https://kit.fontawesome.com/dce6efa4ea.js" crossorigin="anonymous"></script>'.
'</body>'.
'</html>';



    return $attachment;

  }


  public function sendMultipleOrderEmail($email){

      $email =  $email;
      $subject = "High Flyers Uk Couriers Booking Confirmation -NoReply";

      $attachment = $this->getMultipleOrderAttachment();
      $message = "Thank you for your order. Below is a file confirming you orders.";
   
      $this->sendMail($email, $subject, $message, $attachment);
  }


}
