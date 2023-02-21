DROP TABLE IF EXISTS `users`;
CREATE TABLE users (
 `id` INT COLLATE utf8_unicode_ci NOT NULL AUTO_INCREMENT PRIMARY KEY,
 `account_type` varchar(8) COLLATE utf8_unicode_ci NOT NULL DEFAULT 0,
 `username` varchar(30)COLLATE utf8_unicode_ci NOT NULL,
 `password` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
 `user_created_timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='CURRENT_TIMESTAMP';

--
-- password : password
--
INSERT INTO `users` VALUES ('1', 'admin', 'root', '$2y$10$VgY8WN/wGt7EFjVxDxBnWOQ4CdYA.Ajc88Ecm0l4T4fztQJchpAey', '2022-01-01 00:00:00');

INSERT INTO `users` VALUES ('20', '0', 'newstaff', '$2y$10$93/qcZvAZWzfsB2BQCo7T.BFMB8lZVQSV.pP86f/5coRhbTCFD3i6', '2022-01-01 00:00:00');


-- C:\MAMP\bin\mysql\bin>mysql.exe






CREATE DATABASE IF NOT EXISTS `highflyersukcouriers` COLLATE 'utf8_unicode_ci';
CREATE USER 'user'@localhost IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE ON highflyersukcouriers.* TO 'user'@'localhost';