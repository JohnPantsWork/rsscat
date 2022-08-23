-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: rds-rsscat.c44pmkll4dq2.ap-southeast-1.rds.amazonaws.com    Database: rsscat
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `news_data`
--

DROP TABLE IF EXISTS `news_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news_data` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `endpoint_id` tinyint unsigned NOT NULL,
  `latest_date` date NOT NULL DEFAULT (curdate()),
  `title` varchar(255) NOT NULL,
  `source` varchar(32) DEFAULT NULL,
  `auther` varchar(32) DEFAULT NULL,
  `des` varchar(2048) NOT NULL,
  `picture` varchar(2048) DEFAULT NULL,
  `url` varchar(2048) NOT NULL,
  `tag_id_1` mediumint unsigned NOT NULL,
  `tag_id_2` mediumint unsigned NOT NULL,
  `tag_id_3` mediumint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_news_data_endpoint_id_idx` (`endpoint_id`),
  KEY `idx_news_data_tag_id_1` (`tag_id_1`),
  KEY `idx_news_data_tag_id_2` (`tag_id_2`),
  KEY `idx_news_data_tag_id_3` (`tag_id_3`),
  CONSTRAINT `fk_news_data_endpoint_id` FOREIGN KEY (`endpoint_id`) REFERENCES `news_endpoint` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_news_data_tag_id_1` FOREIGN KEY (`tag_id_1`) REFERENCES `tag_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_news_data_tag_id_2` FOREIGN KEY (`tag_id_2`) REFERENCES `tag_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_news_data_tag_id_3` FOREIGN KEY (`tag_id_3`) REFERENCES `tag_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4804 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-08-23 12:15:24
