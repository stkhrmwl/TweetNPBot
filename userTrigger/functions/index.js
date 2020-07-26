'use strict';

const line = require('@line/bot-sdk');
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
const client = new line.Client(config);

function handleEvent(event) {
  console.log(event);
  let message = 'Please push text message.';
  let userId;

  if (event.type === 'message' && event.message.type === 'text') {
    message = event.message.text;
  }

  // ******************** Firestore
  userId = event.source.userId;

  if (message.length < 4) {
    message = '検索キーワードは4文字以上で入力してください';
  } else if (message.match(/テスト/)) {
    userId = event.source.userId;
    try {
      db.collection('users').doc(userId).set({
        replyToken: event.replyToken,
        message: message,
      });
    } catch (error) {
      console.log('トークン更新エラー');
      console.log(error);
    }
    message = '分析中...';
  }
  // ********************

  const echo = { type: 'text', text: message };
  return client.replyMessage(event.replyToken, echo);
}

exports.handler = function echoBot(req, res) {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.status(200).send(`Success: ${result}`))
    .catch((err) => res.status(400).send(err.toString()));
};
