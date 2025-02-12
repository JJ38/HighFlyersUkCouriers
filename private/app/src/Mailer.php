<?php


namespace HighFlyersUkCouriers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;



class Mailer{

  private $mailer_settings;
  private $mailer_data;
  private $logger;

  public function setMailerSettings(array $mailer_settings) : void
  {
    $this->mailer_settings = $mailer_settings;
  }

  public function setMailData(array $mailer_data) : void
  {

    $this->mailer_data = $mailer_data;

  }

  public function setLogger($logger) : void
  {

    $this->logger = $logger;

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
          $mail->addAttachment(stream_get_meta_data($file)['uri'], 'YourOrder.html');
        
        }

       
        $mail->send();
        if($attachment != false){
          //fclose($file);
        }

        
    } catch (Exception $e) {
        //fclose($file);
        $error_message = array($mail->ErrorInfo);
        $this->logger->error("MAILER-ERROR", $error_message);
        echo $e;
        //echo "Message could not be sent. Mailer Error: {$error_message}";

    }

  }

  public function sendMailCustomer() : void
  {
    $email = $this->mailer_data['email'];
    $subject = 'High Flyers Uk Couriers Booking Confirmation';

    $message =

    '<!DOCTYPE html>'.
    ''.
    '<html>'.
    '<head>'.
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway" id="Raleway">'.
    ''.
    '<style>'.
    ''.
    '@import url(\'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap\');'.
    '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap\');'.
    ''.
    'body{'.
    'font-family: \'Raleway\';'.
    'font-style: normal;'.
    'font-weight: 400;'.
    'font-size: 1.1em;'.
    '}'.
    ''.
    '</style>'.
    '</head>'.
    '<body>';

    $message = $message .
    "
    
    This is a confirmation email for your order with High Flyers Uk Couriers. " . "<br>". "
    " . "<br>". "
    Below are the details for you order: " . "<br>". "
    " . "<br>". "
    Order ID: {$this->mailer_data['ID']}" . "<br>". "
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
    Payment on Pickup or Delivery: {$this->mailer_data['payment_option']}" . "<br>". "
    Message: {$this->mailer_data['message']}" . "<br>". "
    " . "<br>"
    ;

    $message = $message .
    
    '<p>Thank you for booking with Highflyers. Your order has been received and being processed.</p>'.
    ''.
    '<p>We will contact you and the other party included on your booking the days before your collection or delivery takes place.</p>'.
    ''.
    '<p>This is to confirm when to expect the driver within an estimated 2 hour time slot.</p>'.
    ''.
    '<p>Collections are Wednesdays and deliveries are Thursdays each week for all areas.</p>'.
    ''.
    '<p>To check for prices, please follow the link <a href="https://www.highflyersukcouriers.com/prices">here</a></p>'.
    ''.
    '<p>If you have any queries, you can call us on 07887781089 or 07760242729</p>'.
    '<p>Email: <a href= "mailto: highflyerscouriers@gmail.com">highflyerscouriers@gmail.com</a> or use the contact page <a href="https://www.highflyersukcouriers.com/contact-us">here</a></p>'.
    ''.
    '<p>Opening hours 10am - 4pm 7 days a week.</p>'.
    ''.
    '<p>To contact for anything urgent out of hours please call 07707889868 (no bookings are taken on this number)</p>'.
    ''.
    '<p>Please note that last bookings need to be sent in by each Sunday 4pm for collections the following week, if you have sent this after Sunday 4pm, your order will be automatically booked into the week after. However, if we can fit your booking in sooner, we will contact you.</p>'.
    ''.
    '<p>Many thanks for your custom</p>'.
    ''.
    '</body>';
 
    $this->sendMail($email, $subject, $message, false);
  }

  public function sendMailInternal() : void
  {
    $email =  $this->mailer_settings['username'];
    $subject = "Order from {$this->mailer_data['email']}";
    $message = "
    Order ID: {$this->mailer_data['ID']}" . "<br>". "
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
    $subject = 'High Flyers Uk Couriers Inquiry Confirmation';
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
    '.flex{'.
      'display: flex;'.
    '}'.
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
      'grid-template-columns: 9fr 5fr 5fr 14fr 1fr;'.
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
      '<div class="flex collectioninfomargin">'.
        '<i class="fa-solid fa-hashtag" title="ID"></i>'.
        '<p>'. $this->mailer_data[$i]['ID'] .'</p>'.
      '</div>'.
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
      '<i class="fa-solid fa-credit-card" title="payment on pick up or delivery"></i>'.
      '<p>' . $this->mailer_data[$i]['payment_option'] . '</p>'.
      '</div>'.
      '<div>'.
      '<i class="fa-solid fa-ticket-simple" title="code"></i>'.
      '<p>' . $this->mailer_data[$i]['code'] . '</p>'.
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
      $subject = "High Flyers Uk Couriers Booking Confirmation - NoReply";

      $attachment = $this->getMultipleOrderAttachment();
      $message = 
      
      '<!DOCTYPE html>'.
      ''.
      '<html>'.
      '<head>'.
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway" id="Raleway">'.
      ''.
      '<style>'.
      ''.
      '@import url(\'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@800&display=swap\');'.
      '@import url(\'https://fonts.googleapis.com/css2?family=Raleway:wght@300&display=swap\');'.
      ''.
      'body{'.
      'font-family: \'Raleway\';'.
      'font-style: normal;'.
      'font-weight: 400;'.
      'font-size: 1.1em;'.
      '}'.
      ''.
      '</style>'.
      '</head>'.
      '<body>'.
      ''.
      '<p>Thank you for booking with Highflyers. Your order has been received and being processed.</p>'.
      ''.
      '<p>We will contact you and the other party included on your booking the days before your collection or delivery takes place.</p>'.
      ''.
      '<p>This is to confirm when to expect the driver within an estimated 2 hour time slot.</p>'.
      ''.
      '<p>Collections are Wednesdays and deliveries are Thursdays each week for all areas.</p>'.
      ''.
      '<p>To check for prices, please follow the link <a href="https://www.highflyersukcouriers.com/prices">here</a></p>'.
      ''.
      '<p>If you have any queries, you can call us on 07887781089 or 07760242729</p>'.
      '<p>Email: <a href= "mailto: highflyerscouriers@gmail.com">highflyerscouriers@gmail.com</a> or use the contact page <a href="https://www.highflyersukcouriers.com/contact-us">here</a></p>'.
      ''.
      '<p>Opening hours 10am - 4pm 7 days a week.</p>'.
      ''.
      '<p>To contact for anything urgent out of hours please call 07707889868 (no bookings are taken on this number)</p>'.
      ''.
      '<p>Please note that last bookings need to be sent in by each Sunday 4pm for collections the following week, if you have sent this after Sunday 4pm, your order will be automatically booked into the week after. However, if we can fit your booking in sooner, we will contact you.</p>'.
      ''.
      '<p>Many thanks for your custom</p>'.
      ''.
      '</body>';
   
      $this->sendMail($email, $subject, $message, $attachment);
  }


}
