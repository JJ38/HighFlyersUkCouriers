<?php declare(strict_types=1);

namespace HighFlyersUkCouriers;
use Datetime;
use DateTimeZone;
use PHPUnit\Framework\TestCase;


final class ManageOrderModelTest extends TestCase {

    //If Jan 1 falls on Friday, Saturday, or Sunday, then those days still belong to the last week of the previous year.
    //ISO week 1 is the Monday–Sunday week that contains January 4th (or the first Thursday of the year).

    //https://en.wikipedia.org/wiki/ISO_8601
    //As a consequence, if 1 January is on a Monday, Tuesday, Wednesday or Thursday, it is in week 01. 
    //If 1 January is on a Friday, Saturday or Sunday, it is in week 52 or 53 of the previous year (there is no week 00). 28 December is always in the last week of its year.

    private $manage_order_model;
        

    protected function setUp(): void
    {
        $this->manage_order_model = new ManageOrderModel();
    }

    public function testSundayBeforeCutoff(): void
    {
        $current_date = new DateTime("2026-09-27 15:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(40, $delivery_week);
    }

    public function testSundayAfterCutoff(): void
    {
        $current_date = new DateTime("2026-09-27 18:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(41, $delivery_week);
    }

    public function testWednesdayMidday(): void
    {
        $current_date = new DateTime("2026-09-23 12:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(40, $delivery_week);
    }

    
    public function testThursdayMidday(): void
    {
        $current_date = new DateTime("2026-09-24 12:00:00", new DateTimeZone("Europe/London"));
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(40, $delivery_week);
    }

    
    public function testFridayMidday(): void
    {
        $current_date = new DateTime("2026-09-25 12:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(40, $delivery_week);
    }

    
    public function testSaturdayMidday(): void
    {
        $current_date = new DateTime("2026-04-11 12:00:00", new DateTimeZone("Europe/London"));
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }
    
    public function testSundayMidday(): void
    {
        $current_date = new DateTime("2026-09-27 12:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(40, $delivery_week);
    }
    
    
    public function testNextSundayBeforeCutoff(): void
    {
        $current_date = new DateTime("2026-10-04 15:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(41, $delivery_week);
    }

    public function testNextSundayAfterCutoff(): void
    {
        $current_date = new DateTime("2026-10-04 18:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(42, $delivery_week);
    }

    public function testSundayBeforeCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-22 15:00:00", new DateTimeZone("Europe/London"));
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(52, $delivery_week);
    }

    public function testSundayAfterCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-23 18:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testSundayAfterCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-27T18:00:00", new DateTimeZone("Europe/London")); 
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testSundayBeforeCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-27T15:00:00", new DateTimeZone("Europe/London"));
        $delivery_date = clone $current_date;

        $delivery_week = $this->manage_order_model->calculateDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(53, $delivery_week);
    }

 
}