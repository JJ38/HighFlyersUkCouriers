DROP TABLE IF EXISTS `customers`;
CREATE TABLE customers (
 `id` INT COLLATE utf8_unicode_ci NOT NULL AUTO_INCREMENT PRIMARY KEY,
 `username` varchar(30) COLLATE utf8_unicode_ci,
 `email` varchar(319) COLLATE utf8_unicode_ci,
 `collection_name` varchar(256) COLLATE utf8_unicode_ci,
 `collection_phone_number` varchar(256) COLLATE utf8_unicode_ci,
 `collection_address_1` varchar(256) COLLATE utf8_unicode_ci,
 `collection_address_2` varchar(256) COLLATE utf8_unicode_ci,
 `collection_address_3` varchar(256) COLLATE utf8_unicode_ci,
 `collection_postcode` varchar(256) COLLATE utf8_unicode_ci,
 `customer_created_timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='CURRENT_TIMESTAMP';

INSERT INTO `customers` VALUES ('49', 'testcustomer', 'null', 'null', 'null', 'null', 'null', 'null', 'null', '2025-02-02 00:00:00');