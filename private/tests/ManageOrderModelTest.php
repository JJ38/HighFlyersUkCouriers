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

    
    public function getDeliveryWeek($current_date, $delivery_date) : int{


        if($current_date->format('D') == "Mon"){

            if($current_date->format('H') >= 16){
                $delivery_date->modify('next monday');
            }

        }else{

            $delivery_date->modify('next monday');

        }

        $delivery_week = intval($delivery_date->format('W'));

        return $delivery_week; 

    }

    public static function setUpBeforeClass(): void
    {
        
    }

    public function testMondayBeforeCutoff(): void
    {
        $current_date = new DateTime("2026-04-06 15:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(15, $delivery_week);
    }

    public function testMondayAfterCutoff(): void
    {
        $current_date = new DateTime("2026-04-06 17:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }

    public function testWednesdayMidday(): void
    {
        $current_date = new DateTime("2026-04-08 12:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }

    
    public function testThursdayMidday(): void
    {
        $current_date = new DateTime("2026-04-09 12:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }

    
    public function testFridayMidday(): void
    {
        $current_date = new DateTime("2026-04-10 12:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }

    
    public function testSaturdayMidday(): void
    {
        $current_date = new DateTime("2026-04-11 12:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }
    
    public function testSundayMidday(): void
    {
        $current_date = new DateTime("2026-04-12 12:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }
    
    
    public function testNextMondayBeforeCutoff(): void
    {
        $current_date = new DateTime("2026-04-13 15:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(16, $delivery_week);
    }

    public function testNextMondayAfterCutoff(): void
    {
        $current_date = new DateTime("2026-04-13 17:00:00", new DateTimeZone("Europe/London")); // Monday before 4
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(17, $delivery_week);
    }

    public function testMondayBeforeCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-23 15:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(52, $delivery_week);
    }

    public function testMondayAfterCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-23 17:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testMondayAfterCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-28T17:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testMondayBeforeCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-28T15:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek($current_date, $delivery_date);

        $this->assertSame(53, $delivery_week);
    }

 

}