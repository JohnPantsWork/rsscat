-- rsscat database

CREATE DATABASE IF NOT EXISTS rsscat;
USE rsscat;

-- drop all tables

DROP TABLE IF EXISTS rss_data;
DROP TABLE IF EXISTS rss_endpoint;
DROP TABLE IF EXISTS worker_center;
DROP TABLE IF EXISTS news_data;
DROP TABLE IF EXISTS news_endpoint;

-- worker_center table

CREATE TABLE worker_center(
	id SERIAL PRIMARY KEY,
    latest_mission INT NOT NULL DEFAULT 0,
    latest_rss_checked_array VARCHAR(31) NOT NULL DEFAULT '[0,0,0,0,0,0]'
);
INSERT INTO worker_center(latest_mission) VALUE (0);

-- rss_endpoint table

CREATE TABLE rss_endpoint(
	id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    frequence INT NOT NULL,
    latest_article VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL
);

-- news_endpoint table

CREATE TABLE news_endpoint(
	id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    frequence INT NOT NULL,
    latest_article VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL
);
INSERT INTO news_endpoint(title,frequence,latest_article,url) VALUES ('newsapi',4,'','')

-- rss_data table

CREATE TABLE rss_data(
	id SERIAL PRIMARY KEY,
    endpoint_id BIGINT UNSIGNED NOT NULL,
    latest_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    auther VARCHAR(255) NULL,
    des VARCHAR(2048) NOT NULL,
    picture VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL,
    tag1 VARCHAR(31) NULL,
    tag2 VARCHAR(31) NULL,
    tag3 VARCHAR(31) NULL,
    tag4 VARCHAR(31) NULL,
    tag5 VARCHAR(31) NULL,
    CONSTRAINT fk_endpoint_id_rss_endpoint_id FOREIGN KEY(endpoint_id) REFERENCES rss_endpoint(id)
)

-- news_data table

CREATE TABLE news_data(
	id SERIAL PRIMARY KEY,
    endpoint_id BIGINT UNSIGNED NOT NULL,
    latest_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    source VARCHAR(255) NULL,
    auther VARCHAR(255) NULL,
    des VARCHAR(2048) NOT NULL,
    picture VARCHAR(2048) NULL,
    url VARCHAR(2048) NOT NULL,
    tag1 VARCHAR(31) NULL,
    tag2 VARCHAR(31) NULL,
    tag3 VARCHAR(31) NULL,
    tag4 VARCHAR(31) NULL,
    tag5 VARCHAR(31) NULL,
    CONSTRAINT fk_endpoint_id_news_endpoint_id FOREIGN KEY(endpoint_id) REFERENCES news_endpoint(id)
)