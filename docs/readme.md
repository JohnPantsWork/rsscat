# Rsscat.net

https://www.rsscat.net

An RSS website with hundreds of sources gathers different topics of articles.
Also receiving Taiwan's top News from NewsAPI.
User can manage their tags and sources, to filter the articles.

# Test Accounts

|            | Email           | Password |
| ---------- | --------------- | -------- |
| account -1 | test01@mail.com | test01   |
| account -2 | test02@mail.com | test02   |

# Table of contents

-   [Feature](#Feature)
-   [Tech Stack](#TechStack)
-   [Architecture](#Architecture)
-   [Demo](#Demo)
    <!-- -   [TF-IDF](#TF-IDF) -->
    <!-- -   [Optimization](#Optimization) -->
    <!-- -   [License](#License) -->

# Features

-   Article auto-tagging.
-   Scheduled workers for scanning RSS new articles.
-   User's article source control.
-   User's tag management.
-   Pet cat with skin system.

# Tech Stack

**Client:**

    React, SASS

**Server:**

    Node.js, Express.js, Redis, Nginx, Docker

**Cloud Services:**

    EC2, RDS, CDN, S3

# Architecture

-   overview

    <img src="./framework-01.png" width="500">

-   AWS

    <img src="./server_flow.png" width="500">

-   worker

    <img src="./worker_flow.png" width="500">

-   sql schema

    <img src="./mysql_schema_flow.png" width="500">

# Demo

-   1. You can browse RSS articles and News.

     <img src="./demo-01-s.gif" width="500">

-   2. Filter specific RSS article soruce.

     <img src="./demo-02-s.gif" width="500">
     <img src="./demo-03-s.gif" width="500">

-   3. New RSS source submit.

     <img src="./demo-04-s.gif" width="500">

-   4. Recommend articles based on tags.

     <img src="./demo-05-s.gif" width="500">

-   5. Click the like button to collect tags.

     <img src="./demo-06-s.gif" width="500">

-   6. Customized recommended article tags.

     <img src="./demo-07-s.gif" width="500">

-   7. Finish daily mission and get coins.

     <img src="./demo-08-s.gif" width="500">

-   8. Interact with pet cat.

     <img src="./demo-09-s.gif" width="500">

-   9. Buy and switch the cat's skin.

     <img src="./demo-10-s.gif" width="500">
