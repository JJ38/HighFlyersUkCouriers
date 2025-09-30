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

    public function getDeliveryWeek($order_type, $current_date, $delivery_date) : int{

        //public cutoff sunday 4pm
        //customer cutoff monday 12pm

        //is it sunday or monday?
        if(($current_date->format('D') == "Sun" || $current_date->format('D') == "Mon")){
        
            //is it after 4pm sunday and a public order
            if($order_type == "PUBLIC"){ //$current_date->format('H')
                //public order

            
                
                //is it after 4pm on sunday
                if($current_date->format('D') == "Sun" && $current_date->format('H') >= 16){
                    //delivery tuesday after next
                    $delivery_date->modify('next monday')->modify('next monday');
                }else if($current_date->format('D') == "Mon"){
                    $delivery_date->modify('next monday');
                }else{

                    //delivery next tuesday
                    $delivery_date->modify('next monday');
                }
                
            }else{
                //customer order

                //is it after 12pm on Monday
                if($current_date->format('D') == "Mon" && $current_date->format('H') >= 12){

                    //delivery tuesday after next
                    $delivery_date->modify('next monday');
            
                }else if($current_date->format('D') == "Sun"){

                    //delivery next tuesday
                    $delivery_date->modify('next monday');
                }

            }

        }else{
            //else delivery next tuesday
            $delivery_date->modify('next monday');
        }

        $delivery_week = intval($delivery_date->format('W'));

        return $delivery_week; 

    }

    public static function setUpBeforeClass(): void
    {
        
    }

    public function testMondayBeforeCutoffCustomer(): void
    {
        $current_date = new DateTime("2024-12-30 11:00:00", new DateTimeZone("Europe/London")); // Monday before noon
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testMondayAfterCutoffCustomer(): void
    {
        $current_date = new DateTime("2024-12-30 13:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(2, $delivery_week);
    }

    public function testMondayBeforeCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-23 11:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(52, $delivery_week);
    }

    public function testMondayAfterCutoffYearCustomer(): void
    {
        $current_date = new DateTime("2024-12-23 13:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testMondayAfterCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-28T13:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(1, $delivery_week);
    }

    public function testMondayBeforeCutoffYearWeek53YearCustomer(): void
    {
        $current_date = new DateTime("2020-12-28T11:00:00", new DateTimeZone("Europe/London")); // Monday
        $delivery_date = clone $current_date;

        $delivery_week = $this->getDeliveryWeek("CUSTOMER", $current_date, $delivery_date);

        $this->assertSame(53, $delivery_week);
    }

 

}