const getFacebookProfile = async function (accessToken) {
  console.log('begin-getFacebookProfile-model:');
  try {
    let res = await got('https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken, {
      responseType: 'json',
    });
    return res.body;
  } catch (e) {
    console.log(e);
    throw 'Permissions Error: facebook access token is wrong';
  }
};

module.exports = { getFacebookProfile };
