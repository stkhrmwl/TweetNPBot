'use strict';

const functions = require('firebase-functions');
const { PythonShell } = require('python-shell');

const twitter = require('twitter');
const line = require('@line/bot-sdk');
const kuromoji = require('kuromoji');
const MeCab = new require('mecab-async');
const mecab = new MeCab();
const ENV = require('./env.json');

// ******************** Firestore
const admin = require('firebase-admin');
const SERVICE_ACCOUNT = require('./service_account.json');
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});
const db = admin.firestore();
// ********************

const config = {
  channelAccessToken: ENV.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: ENV.LINE_CHANNEL_SECRET,
};
const liClient = new line.Client(config);

exports.sendParams = functions
  .region('asia-northeast1')
  .firestore.document('users/{userId}')
  .onWrite((change, context) => {
    const userId = context.params.userId;

    getDocument(userId).then((doc) => {
      // let pushContent = doc.message;

      getTotalScore(doc.message).then((result) => {
        let pushContent = result;

        const message = {
          type: 'text',
          text: pushContent,
        };

        liClient
          .pushMessage(userId, message)
          .then(() => {
            console.log('push OK.');
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });

    return 0;
  });

const getDocument = (userId) => {
  return new Promise((resolve) => {
    console.log('reach getDocument');
    db.collection('users')
      .doc(userId)
      .get()
      .then((doc) => {
        resolve(doc.data());
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const getTotalScore = (keyword) => {
  return new Promise((resolve) => {
    const twClient = new twitter({
      consumer_key: ENV.TWITTER_API_KEY,
      consumer_secret: ENV.TWITTER_API_SECRET_KEY,
      access_token_key: ENV.TWITTER_ACCESS_TOKEN,
      access_token_secret: ENV.TWITTER_ACCESS_TOKEN_SECRET,
    });

    const LOOP = 1;
    let lastId = '';
    let params = {
      q: keyword,
      count: 1,
      max_id: lastId,
      result_type: 'recent',
      include_entities: false,
    };

    !(async () => {
      for (let i = 1; i <= LOOP; i++) {
        params.max_id = lastId;
        const tweets = await twClient.get('search/tweets', params);

        tweets.statuses.forEach(function (val, index, ar) {
          const tweet = val.text.replace(/\r?\n/g, '');

          getToken(tweet).then((token) => {
            getScore(token).then((score) => {
              resolve(String(score));
            });
          });
        });
      }
    })();
  });
};

const getToken = (tweet) => {
  return new Promise((resolve) => {
    console.log('reach getToken');
    console.log(tweet);
    let token = [];
    mecab.parse('これは良い文章だと思います。', function (err, result) {
      if (err) throw err;
      for (let i = 0; i < result.length; i++) {
        let word = {
          word_id: null,
          word_type: null,
          word_position: i,
          surface_form: result[i][0],
          pos: result[i][1],
          pos_detail_1: result[i][2],
          pos_detail_2: result[i][3],
          pos_detail_3: result[i][4],
          conjugated_type: result[i][5],
          conjugated_form: result[i][6],
          basic_form: result[i][7],
          reading: result[i][8],
          pronunciation: result[i][9],
        };
        token.push(word);
      }
    });
    resolve(token);
  });
};

const getScore = (token) => {
  return new Promise((resolve) => {
    console.log('reach getScore');
    console.log(token);
    const analyze = require('negaposi-analyzer-ja');
    const score = analyze(token);
    resolve(score);
  });
};
