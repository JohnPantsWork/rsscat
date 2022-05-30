# <img src="./icon.svg" width="30"> Rsscat.net

<img src="./WebsiteOverview-1.png" width="500">

An RSS website with hundreds of sources gathers different topics of articles.
Also receiving Taiwan's top News from NewsAPI.
User can manage their tags and sources, to filter the articles.

# <img src="./icon.svg" width="30"> Website

[RSSCAT.net](https://www.rsscat.net)

|            | Email           | Password |
| ---------- | --------------- | -------- |
| account -1 | test01@mail.com | test01   |
| account -2 | test02@mail.com | test02   |

# <img src="./icon.svg" width="30"> Features

### Article auto-tagging

-   The content of each article is segmented through the [CKIP Tagger](https://github.com/ckiplab/ckiptagger), and calculated through TF-IDF statistical rules to set article tags.

### Scheduled workers for scanning RSS new articles

-   The Amazon virtual machine started every hour to scan RSS feeds for the latest article content.

### User's article source control

-   Configure the RSS website switch, which filters the source of articles in detail.

### User's tag management

-   Can manage users' own article tags, which filter the content of articles in detail.

### Daily missions

-   The user gets several tasks every day, and they can get rewards for completing the tasks.

### Pet cat with the skin system

-   Pet animated cat. Purchase cat skin and apply it to the cat.

# <img src="./icon.svg" width="30"> TechStack

**Back-End:**

    Nodejs, Express.js, MySQL, Redis, Nginx, Git, Mocha, k6, Docker

**Front-End:**

    Javascript, HTML, CSS, SASS, React.js

**Cloud Services:**

    EC2, RDS, CDN, S3

# <img src="./icon.svg" width="30"> Architecture

-   Overview

    <img src="./framework-01.png" width="500">

-   AWS

    The static website is served by Amazon S3 and Amazon CloudFront which help the website load faster.

    <img src="./server_flow.png" width="500">

-   Worker system

    The task dispatcher and workers are also impacted inside the containers, so the RSS article crawler system can be set up easier.

    <img src="./worker_flow.png" width="500">

-   SQL schema

    The SQL schema can sperate into three sections.

    -   The green area stored users' data that be connected to the yellow article area by tags.
    -   The blue area is the daily mission datas.

    <img src="./mysql_schema_flow-witharea.png" width="500">

# <img src="./icon.svg" width="30"> Demo

-   You can browse RSS articles and News.

     <img src="./demo-01-s.gif" width="500">

-   Filter RSS article sources.

     <img src="./demo-02-s.gif" width="500">
     <img src="./demo-03-s.gif" width="500">

-   New RSS source submitted.

     <img src="./demo-04-s.gif" width="500">

-   Recommend articles based on tags.

     <img src="./demo-05-s.gif" width="500">

-   Click the like button to collect tags.

     <img src="./demo-06-s.gif" width="500">

-   Customized recommended article tags.

     <img src="./demo-07-s.gif" width="500">

-   Finish daily mission and get coins.

     <img src="./demo-08-s.gif" width="500">

-   Interact with pet cat.

     <img src="./demo-09-s.gif" width="500">

-   Buy and switch the cat's skin.

     <img src="./demo-10-s.gif" width="500">

# <img src="./icon.svg" width="30"> WordProcessing&TF-IDF

-   WordProcessing
    After the content of each article passes through the CKIP word segmentation system, First, add all the word segmentation text to the database, and then exclude words that are not valid information by part of it, and the remaining words will be passed through TF-IDF system.

    [demo article source](https://think.folklore.tw/posts/5408)

    ### Before word processing.

    ```
    透過本紀錄片，團隊希望能挖掘桃園開漳聖王信仰的多元面貌，並隨著桃園市各地的儀式文化，讓我們重新認識這尊在生活周遭伴隨我們的神靈。
    ```

    ### After word processing.

    ```
    透過(P)　本(Nes)　紀錄片(Na)　，(COMMACATEGORY)　團隊(Na)　希望(VK)　能(D)　挖掘(VC)　桃園(Nc)　開漳(Nb)　聖王(Na)　信仰(Na)　的(DE)　多元(VH)　面貌(Na)　，(COMMACATEGORY)　並(Cbb)　隨著(P)　桃園市(Nc)　各(Nes)　地(Na)　的(DE)　儀式(Na)　文化(Na)　，(COMMACATEGORY)　讓(VL)　我們(Nh)　重新(D)　認識(VJ)　這(Nep)　尊(Nf)　在(P)　生活(Na)　周(Nd)　遭(P)　伴隨(VC)　我們(Nh)　的(DE)　神靈(Na)　。(PERIODCATEGORY)
    ```

    ### remove unnecessary parts of word

    ```
    紀錄片(Na) 團隊(Na) 桃園(Nc) 聖王(Na) 信仰(Na) 面貌(Na) 桃園市(Nc) 地(Na) 儀式(Na) 文化(Na) 生活(Na) 伴隨(VC) 神靈(Na)
    ```

-   TF-IDF
    TF-IDF is to count the specificity of a word based on the entire database. In this project, the top three with the highest specificity will become the Tag of the article.

    -   TF
        Calculate words' appearance frequency in the original article. Higher frequency has a higher score.
    -   IDF
        Calculate words' appearance frequency in all articles. Higher frequency has a lower score.

    ### After TF-IDF, with top 3 words.

    ```
    紀錄片(Na) 聖王(Na) 桃園市(Nc)
    ```

# <img src="./icon.svg" width="30"> License

The icons used on the website are free licenses, thanks to these artists:

-   <a href="https://www.vecteezy.com/free-vector/nature">
    Nature Vectors by Vecteezy
    </a>

-   <a href="https://www.freepik.com/vectors/crazy-face">
    Crazy face vector created by jcomp - www.freepik.com
    </a>

-   <a href="https://www.flaticon.com/free-icons/heart" title="heart icons">
    Heart icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/heart" title="heart icons">
    Heart icons created by Kiranshastry - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/hosting" title="hosting icons">
    Hosting icons created by Eucalyp - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/rss" title="rss icons">
    Rss icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/news" title="news icons">
    News icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/search" title="search icons">
    Search icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/tag" title="tag icons">
    Tag icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/cat" title="cat icons">
    Cat icons created by Freepik - Flaticon
    </a>

-   <a href="https://www.flaticon.com/free-icons/search" title="search icons">
    Search icons created by Vectors Market - Flaticon
    </a>
