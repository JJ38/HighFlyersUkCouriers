DROP TABLE IF EXISTS `orders`;
CREATE TABLE orders (
 `id` INT COLLATE utf8_unicode_ci NOT NULL AUTO_INCREMENT PRIMARY KEY,
 `animal_type` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `quantity` INT COLLATE utf8_unicode_ci NOT NULL,
 `email` varchar(319) COLLATE utf8_unicode_ci NOT NULL,
 `username` varchar(30) COLLATE utf8_unicode_ci,
 `delivery_week` varchar(30) COLLATE utf8_unicode_ci,
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
 `message` MEDIUMTEXT COLLATE utf8_unicode_ci,
 `printed` INT(1) COLLATE utf8_unicode_ci DEFAULT 0,
 `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='CURRENT_TIMESTAMP';


INSERT INTO 'orders' VALUES ('1', 'Pigeon', '11', 'jamesbrass@ymail.com', 'account', '32nd', 'James', '07842133519', '10 Kenilworth Road', 'Ripley', 'derbyshire', 'DE5 3GY', 'Katherine', '10 Marston Close', 'Belper', 'Derbyshire','DE56 1TP', '07894567341', 'collection', 'message', '1', '2022-01-01 00:00:00');
-- (
-- `animal_type`,
-- `quantity`,
-- `email`,
-- `collection_name`,
-- `collection_phone_number`,
-- `collection_address_1`,
-- `collection_address_2`,
-- `collection_address_3`,
-- `collection_postcode`,
-- `delivery_name`,
-- `delivery_address_1`,
-- `delivery_address_2`,
-- `delivery_address_3`,
-- `delivery_postcode`,
-- `delivery_phone_number`,
-- `payment_option`,
-- `message`,
-- )