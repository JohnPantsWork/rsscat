const nodejieba = require('nodejieba');

nodejieba.load({
  dict: './data/chinese/dict.txt',
  stopWordDict: './data/chinese/sw_zh',
});

async function jiebaCut(raw_words) {
  const cuttedWords = await nodejieba.cut(raw_words);
  return cuttedWords;
}

async function jiebaTag(raw_words) {
  const cuttedWords = await nodejieba.cut(raw_words);
  return cuttedWords;
}
// const words =
//   '周五接到小舅媽通知, 周日早上要去掃外公外婆的墓, 所以今早八點我就先去小舅家等左營阿姨, 結果她卻直接去墓園了. 每年大概就是我們這幾個人去, 大多數人家已於上週之前就掃過了, 今天整個墓園僅有兩三家而已, 晚拜的好處就是不會人潮車潮擁擠. 拜完我先去愛心與市集買豆腐, 回來安頓好中午再去小舅家吃午飯.    過年前種的那批玉米今日全部採收, 留了三條煮湯外其餘都先下鍋. 順便將田埂旁空地鋤一鋤, 準備下周再買 20 株來種. 今日去小舅家看到他把空地整理得非常好, 胡瓜從園子裡爬上頂樓, 還可以遮陽哩. 他那邊可種地有限還能產出豐富, 相比之下我的菜園就太曝畛天物了. 下午去菜園採玉米才發現角落的香蕉被爸挖掉了, 說是不會再開花, 我看被挖斷的幼苗葉子還是綠油油, 就把它移到馬路邊波蘿蜜樹旁挖個洞種下去, 這是從公司花園移植來的, 那個花園的植栽已全部被夷平, 所以這棵香蕉樹是唯一的樹種了.         去年跟賣鳳梨的人要的鳳梨頭拿回來種在菜園一年多, 今天發現居然已結出果實 :        鳳梨可用無性生殖法栽培, 切掉的鳳梨頭放入土中還會繼續存活茁壯....(更多請到原始頁面觀看)';

// async function exe() {
//   const result1 = await jiebaCut(words);
//   const result2 = await jiebaTag(words);
//   console.log(`#--------------------[result1]#\n`, result1);
//   console.log(`#--------------------[result2]#\n`, result2);
// }

// exe();

module.exports = { jiebaCut, jiebaTag };
