<?php declare(strict_types=1);

use HighFlyersUkCouriers\FinanceModel;
use HighFlyersUkCouriers\FirebaseDocument;
use PHPUnit\Framework\TestCase;

final class FinanceModelTest extends TestCase {

    // $this->assertSame($string, $email->asString());
    // $this->expectException(InvalidArgumentException::class);

    private static $order_data_defaults;
    private static $prices_firebase_document;
    private static $postcodes_firebase_document;


    public static function setUpBeforeClass(): void
    {

        self::$prices_firebase_document = new FirebaseDocument();
        self::$postcodes_firebase_document = new FirebaseDocument();

        $bird_species = json_decode(file_get_contents('testData/bird_species_pricing.json', true), true);
        $postcode_price_definitions = json_decode(file_get_contents('testData/postcode_price_definitions.json', true), true);

        self::$prices_firebase_document->setData($bird_species['fields']);
        self::$postcodes_firebase_document->setData($postcode_price_definitions['fields']);

        self::$order_data_defaults['collection_name'] = "test name";
        self::$order_data_defaults['collection_address_1'] = "test address";
        self::$order_data_defaults['collection_address_2'] = "test address";
        self::$order_data_defaults['collection_address_3'] = "test address";
        self::$order_data_defaults['collection_phone_number'] = "test phonenumber";

        self::$order_data_defaults['delivery_name'] = "test name";
        self::$order_data_defaults['delivery_address_1'] = "test address";
        self::$order_data_defaults['delivery_address_2'] = "test address";
        self::$order_data_defaults['delivery_address_3'] = "test address";
        self::$order_data_defaults['delivery_phone_number'] = "test phonenumber";

        self::$order_data_defaults['message'] = "test message";
        self::$order_data_defaults['delivery_week'] = 20;
        self::$order_data_defaults['added_by'] = "test user";
        self::$order_data_defaults['printed'] = 0;
        self::$order_data_defaults['code'] = "wadwadwda";
        self::$order_data_defaults['username'] = "tset user";
        self::$order_data_defaults['timestamp'] = "2025-06-08 13:51:06";

        
    }

    public function testYoungPigeonOrderTwelve(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    public function testYoungPigeonOrderThirteen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 13;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(57, $finance_model->getOrderPrice());

    }

    public function testOrderQuantityOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    public function testOrderQuantityZero(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 0;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(0, $finance_model->getOrderPrice());

    }

    public function testQuantityMinusOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = -1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(0, $finance_model->getOrderPrice());

    }

    public function testOldPigeonOrderTwelve(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    
    public function testOldPigeonsOrderLondonCollection(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "TW76NY";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }

     public function testOldPigeonsOrderScotlandCollection(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "ML3 9AD";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(65, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderAberdeenCollection(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "AB10 1AB";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(75, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderInvernessCollection(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "IV1 1AD";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(85, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderSwanseaCollection(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "SA41 3PL";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }

    
    public function testOldPigeonsOrderLondonDelivery(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;

        $order_data['collection_postcode'] = "S17 3AL";
        $order_data['delivery_postcode'] = "TW76NY";


        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderScotlandDelivery(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;

        $order_data['collection_postcode'] = "S17 3AL";
        $order_data['delivery_postcode'] = "ML3 9AD";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(65, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderAberdeenDelivery(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "S17 3AL";
        $order_data['delivery_postcode'] = "AB10 1AB";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(75, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderInvernessDelivery(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "S17 3AL";
        $order_data['delivery_postcode'] = "IV1 1AD";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(85, $finance_model->getOrderPrice());

    }

    public function testOldPigeonsOrderSwanseaDelivery(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Old Birds";
        $order_data['quantity'] = 12;
        $order_data['collection_postcode'] = "S17 3AL";
        $order_data['delivery_postcode'] = "SA41 3PL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }


    public function testOldPigeonOrderThirteen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 13;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(57, $finance_model->getOrderPrice());

    }

    
    public function testOldPigeonOrderTwentyTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 22;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(75, $finance_model->getOrderPrice());

    }

    public function testAviaryAndCageBirdsOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Aviary & Cage Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }

    public function testAviaryAndCageBirdsTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Aviary & Cage Birds";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(70, $finance_model->getOrderPrice());

    }

    public function testAviaryAndCageBirdsTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Aviary & Cage Birds";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(150, $finance_model->getOrderPrice());

    }

    public function testPoultryAndGamebirdsOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Poultry & Gamebirds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(99, $finance_model->getOrderPrice());

    }

    public function testPoultryAndGamebirdsTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Poultry & Gamebirds";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(109, $finance_model->getOrderPrice());

    }

    public function testPoultryAndGamebirdsTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Poultry & Gamebirds";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(189, $finance_model->getOrderPrice());

    }

    public function testSmallMammalsOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Mammals";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(99, $finance_model->getOrderPrice());

    }

    public function testSmallMammalsTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Mammals";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(124, $finance_model->getOrderPrice());

    }

    public function testSmallMammalsTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Mammals";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(324, $finance_model->getOrderPrice());

    }

    public function testReptilesOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Reptiles";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(65, $finance_model->getOrderPrice());

    }

    public function testReptilesTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Reptiles";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(75, $finance_model->getOrderPrice());

    }

    public function testReptilesTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Reptiles";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(155, $finance_model->getOrderPrice());

    }

    
    public function testBirdsOfPreyOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Birds Of Prey";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(99, $finance_model->getOrderPrice());

    }

    public function testBirdsOfPreyTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Birds Of Prey";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(124, $finance_model->getOrderPrice());

    }

    public function testBirdsOfPreyTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Birds Of Prey";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(324, $finance_model->getOrderPrice());

    }

    public function testSmallRodentsOne(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Rodents";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(65, $finance_model->getOrderPrice());

    }

    public function testSmallRodentsTwo(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Rodents";
        $order_data['quantity'] = 2;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(75, $finance_model->getOrderPrice());

    }

    public function testSmallRodentsTen(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Rodents";
        $order_data['quantity'] = 10;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(155, $finance_model->getOrderPrice());

    }

    public function testBirdsOfPreyOrderSwansea(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Birds Of Prey";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "SA41 3PL";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(99, $finance_model->getOrderPrice());

    }

     public function testSmallMammalsSwansea(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Small Mammals";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "SA41 3PL";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(99, $finance_model->getOrderPrice());

    }

     public function testAviaryAndCageBirdsSwansea(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Aviary & Cage Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "SA41 3PL";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(60, $finance_model->getOrderPrice());

    }

    
    public function testPostcodeLengthSeven(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56 1TP";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    public function testPostcodeLengthSix(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE5 3GY";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    public function testPostcodeLengthFive(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "L1 0AA";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    
    public function testPostcodeLengthFourOutwardOnly(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "DE56";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

    public function testPostcodeLengthThreeOutwardOnly(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "IV1";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(85, $finance_model->getOrderPrice());

    }

    public function testPostcodeLengthTwoOutwardOnly(): void {

        $finance_model = new FinanceModel();

        $finance_model->setPricesDocument(self::$prices_firebase_document);
        $finance_model->setPostcodesDocument(self::$postcodes_firebase_document);

        $order_data = self::$order_data_defaults;

        $order_data['animal_type'] = "Pigeons - Young Birds";
        $order_data['quantity'] = 1;
        $order_data['collection_postcode'] = "L1";
        $order_data['delivery_postcode'] = "S17 3AL";

        $finance_model->setOrderData($order_data);

        $finance_model->calculateOrderPrice();
        $this->assertSame(55, $finance_model->getOrderPrice());

    }

}