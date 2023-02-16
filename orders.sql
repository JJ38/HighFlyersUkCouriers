DROP TABLE IF EXISTS `orders`;
CREATE TABLE orders (
 `id` INT COLLATE utf8_unicode_ci NOT NULL AUTO_INCREMENT PRIMARY KEY,
 `animal_type` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `quantity` INT COLLATE utf8_unicode_ci NOT NULL,
 `email` varchar(319) COLLATE utf8_unicode_ci NOT NULL,
 `collection_name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `collection_phone_number` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `collection_address_1` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `collection_address_2` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `collection_address_3` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `collection_postcode` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_name` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_address_1` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_address_2` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_address_3` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_postcode` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `delivery_phone_number` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `payment_option` varchar(12) COLLATE utf8_unicode_ci NOT NULL,
 `message` MEDIUMTEXT COLLATE utf8_unicode_ci NOT NULL,
 `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='CURRENT_TIMESTAMP';
