-- rsscat database

CREATE DATABASE IF NOT EXISTS rsscat;
USE rsscat;

-- drop all tables

DROP TABLE IF EXISTS rss_data;
DROP TABLE IF EXISTS rss_endpoint;
DROP TABLE IF EXISTS worker_center;
DROP TABLE IF EXISTS news_data;
DROP TABLE IF EXISTS news_endpoint;
DROP TABLE IF EXISTS tag_data;
DROP TABLE IF EXISTS user_tag;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS user_provider;

-- worker_center table

CREATE TABLE worker_center(
	id SERIAL PRIMARY KEY,
    latest_mission INT NOT NULL DEFAULT 0,
    latest_rss_checked_array VARCHAR(31) NOT NULL DEFAULT '[0,0,0,0,0,0]'
);
INSERT INTO worker_center(latest_mission) VALUE (0);

-- rss_endpoint table

CREATE TABLE rss_endpoint(
	id SMALLINT UNSIGNED PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    frequence INT NOT NULL,
    latest_article VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL
);

-- news_endpoint table

CREATE TABLE news_endpoint(
	id TINYINT UNSIGNED PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    frequence INT NOT NULL,
    latest_article VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL
);
INSERT INTO news_endpoint(title,frequence,latest_article,url) VALUES ('newsapi',4,'','')

-- rss_data table

CREATE TABLE rss_data(
	id INT UNSIGNED PRIMARY KEY,
    endpoint_id SMALLINT UNSIGNED NOT NULL,
    latest_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    auther VARCHAR(255) NULL,
    des VARCHAR(2048) NOT NULL,
    picture VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL,
    tag1 MEDIUMINT NULL,
    tag2 MEDIUMINT NULL,
    tag3 MEDIUMINT NULL,
    tag4 MEDIUMINT NULL,
    tag5 MEDIUMINT NULL,
    CONSTRAINT fk__endpoint_id FOREIGN KEY(endpoint_id) REFERENCES rss_endpoint(id)
)

-- news_data table

CREATE TABLE news_data(
	id INT UNSIGNED PRIMARY KEY,
    endpoint_id TINYINT UNSIGNED NOT NULL,
    latest_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    source VARCHAR(255) NULL,
    auther VARCHAR(255) NULL,
    des VARCHAR(2048) NOT NULL,
    picture VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL,
    tag1 MEDIUMINT NULL,
    tag2 MEDIUMINT NULL,
    tag3 MEDIUMINT NULL,
    tag4 MEDIUMINT NULL,
    tag5 MEDIUMINT NULL,
    CONSTRAINT fk_endpoint_id_news_endpoint_id FOREIGN KEY(endpoint_id) REFERENCES news_endpoint(id)
)

CREATE TABLE tag_info(
	id MEDIUMINT UNSIGNED PRIMARY KEY,
    tag_name CHAR(8),
    appear_times INT NOT NULL DEFAULT 0,
    idf FLOAT,
    link_tag1 MEDIUMINT UNSIGNED
)

CREATE TABLE tag_data(
	id BIGINT UNSIGNED PRIMARY KEY,
    user_id INT UNSIGNED,
    tag_id MEDIUMINT UNSIGNED,
    data_id INT UNSIGNED,
    datatype CHAR(4),
    latest_date DATE
)

CREATE TABLE user_tag(
	id INT UNSIGNED PRIMARY KEY,
    user_id INT UNSIGNED,
    liked BOOLEAN NOT NULL,
    datatype CHAR(4),
    latest_date DATE
)

CREATE TABLE user(
    id INT UNSIGNED PRIMARY KEY,
    provider CHAR(8) NOT NULL,
    email VARCHAR(128) NOT NULL,
    password CHAR(128) NOT NULL,
)

CREATE TABLE user_provider(
    id TINYINT UNSIGNED PRIMARY KEY,
    provider CHAR(8) NOT NULL
)